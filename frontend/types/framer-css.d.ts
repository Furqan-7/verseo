import "react";

declare module "react" {
  interface CSSProperties {
    // CSS custom properties (--framer-*) and CSS features newer than React's
    // type definitions (e.g. corner-shape) both appear in this design's inline
    // styles. They work at runtime; this just stops TypeScript rejecting them.
    [key: string]: string | number | undefined;
  }
}
