import { useEffect, useRef, useState } from "react";

export const useInfiniteScroll = (callback, options = { threshold: 1.0 }) => {
  const observerRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const currentRef = observerRef.current;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetching) {
        setIsFetching(true);
        callback().finally(() => setIsFetching(false));
      }
    }, options);

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [callback, isFetching, options]);

  return [observerRef, isFetching];
};
