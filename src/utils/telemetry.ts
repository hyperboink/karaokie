/**
 * Anti-devtools security module.
 *
 * Uses three independent detection methods. If any fires, the page is wiped.
 * Nothing here is truly unbypassable, but it raises the bar high enough
 * that casual snooping in the browser tools gives up quickly.
 */

const DEVTOOLS_SIZE_THRESHOLD = 200; // px delta that suggests docked devtools
const DEBUGGER_PAUSE_THRESHOLD = 100; // ms — anything longer means the debugger paused us
const CONSOLE_CLEAR_INTERVAL = 500; // ms
const SECURITY_CHECK_INTERVAL = 1000; // ms

// Save native console methods before overriding them so Method 2 can use them
// internally after the public console API is suppressed.
const nativeConsoleLog = console.log.bind(console);
const nativeConsoleClear = console.clear.bind(console);

function lockdown() {
  try {
    document.documentElement.innerHTML = '';
    document.open();
    document.write('');
    document.close();
  } catch {
    // ignore
  }
  try {
    window.location.replace('about:blank');
  } catch {
    // ignore
  }
}

// Window size delta
// Docked devtools shrink the inner viewport. Undocked devtools don't, so this
// is paired with the other methods for broader coverage.
function checkWindowSize() {
  const widthDelta = window.outerWidth - window.innerWidth;
  const heightDelta = window.outerHeight - window.innerHeight;
  if (widthDelta > DEVTOOLS_SIZE_THRESHOLD || heightDelta > DEVTOOLS_SIZE_THRESHOLD) {
    lockdown();
  }
}

// Image getter trap
// When devtools is open, console.log'ing an object causes the browser to read
// its enumerable properties (including getters) for display. The getter fires
// only when the console panel is actually open and rendering the object.
function startImageTrap() {
  const img = new Image();
  let triggered = false;
  Object.defineProperty(img, 'id', {
    get() {
      if (!triggered) {
        triggered = true;
        lockdown();
      }
      return '';
    },
  });

  const loop = () => {
    nativeConsoleLog(img);
    nativeConsoleClear();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// Debugger timing
// When the browser pauses on a debugger statement, execution time balloons.
// This triggers if someone has "pause on debugger statements" enabled.
function checkDebuggerTiming() {
  const start = performance.now();
  // eslint-disable-next-line no-debugger
  debugger;
  if (performance.now() - start > DEBUGGER_PAUSE_THRESHOLD) {
    lockdown();
  }
}

// Console suppression
const noop = () => undefined;
const suppressedMethods = [
  'log', 'warn', 'error', 'info', 'debug', 'table', 'dir', 'dirxml',
  'group', 'groupCollapsed', 'groupEnd', 'trace', 'assert',
  'count', 'countReset', 'time', 'timeLog', 'timeEnd',
  'profile', 'profileEnd',
] as const;

suppressedMethods.forEach((method) => {
  try {
    (console as unknown as Record<string, unknown>)[method] = noop;
  } catch { }
});

export function init() {
  // Run immediate checks on page load
  checkWindowSize();
  checkDebuggerTiming();

  // Periodic re-checks
  setInterval(() => {
    checkWindowSize();
    checkDebuggerTiming();
  }, SECURITY_CHECK_INTERVAL);

  // Continuous console/object trap
  startImageTrap();

  // Clear any residual console output regularly
  setInterval(nativeConsoleClear, CONSOLE_CLEAR_INTERVAL);

  // Disable text selection across the entire page
  document.documentElement.style.userSelect = 'none';
  document.documentElement.style.webkitUserSelect = 'none';
}
