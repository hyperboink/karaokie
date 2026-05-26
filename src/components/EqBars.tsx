/** Animated equalizer bars displayed while a song is playing. */
export default function EqBars() {
  return (
    <span className="flex items-end gap-[2px] h-2">
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
    </span>
  );
}
