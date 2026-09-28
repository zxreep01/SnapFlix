"use client";

import { cn } from "@/utils/helpers";
import { useCallback, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger in milliseconds, applied when the block starts revealing. */
  delay?: number;
  /** Keeps heavy children unmounted until they are just off screen. */
  defer?: boolean;
}

/**
 * Scroll entrance for page blocks.
 *
 * Content rises out of a soft motion blur once it reaches the viewport; with
 * `defer` the children are not even mounted until they are about to be seen,
 * so long pages stay cheap until the viewer scrolls down to them.
 */
const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, defer = false }) => {
  const { ref: mountRef, inView: near } = useInView({ triggerOnce: true, rootMargin: "360px" });
  const { ref: viewRef, inView: inView } = useInView({
    triggerOnce: true,
    rootMargin: "0px 0px -8% 0px",
  });

  const ref = useCallback(
    (node: Element | null) => {
      mountRef(node);
      viewRef(node);
    },
    [mountRef, viewRef],
  );

  return (
    <div
      ref={ref}
      data-revealed={inView}
      style={{ "--sf-delay": `${delay}ms` } as React.CSSProperties}
      className={cn("sf-reveal", className)}
    >
      {defer && !near ? null : children}
    </div>
  );
};

export default Reveal;
