(function () {
  if (!window.__kx) return;

  var dk = ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'];

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  }, true);

  document.addEventListener('keydown', function (e) {
    var ctrl  = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    var alt   = e.altKey;

    if (e.key === 'F12') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    if (ctrl && shift && dk.indexOf(e.key) !== -1) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    if (ctrl && !shift && !alt && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    if (ctrl && alt && (e.key === 'i' || e.key === 'I' ||
                        e.key === 'j' || e.key === 'J' ||
                        e.key === 'c' || e.key === 'C')) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
  }, true);
})();
