import { RefObject, useEffect, useRef, useState } from 'react';

export default function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    observer.current = new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting),
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (ref.current) observer.current?.observe(ref.current);
    return () => observer.current?.disconnect();
  }, [observer, ref]);

  return isIntersecting;
}
