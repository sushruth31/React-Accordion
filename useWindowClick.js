import { useEffect, useRef } from "react";

export default function useWindowClick(cb, refs = [], dependencies) {
  useEffect(() => {
    const listener = e => {
      if (refs?.some(ref => ref?.current?.contains(e.target))) {
        return;
      }
      cb();
    };
    document.addEventListener("mousedown", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [...refs, cb, dependencies]);
}
