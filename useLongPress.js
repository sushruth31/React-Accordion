import { useEffect, useState } from "react";

export default function useLongPress(callback = () => null, ms = 500) {
  const [start, setStart] = useState(false);

  useEffect(() => {
    let timerId;
    if (start) {
      timerId = setTimeout(callback, ms);
    } else {
      clearTimeout(timerId);
    }
    return () => clearTimeout(timerId);
  }, [callback, ms, start]);

  return {
    onMouseDown: () => setStart(true),
    onMouseUp: () => setStart(false),
    onMouseLeave: () => setStart(false),
    onTouchStart: () => setStart(true),
    onTouchEnd: () => setStart(false),
  };
}
