declare global {
  interface Window {
    umami?: {
      track?: (
        payload?:
          | string
          | Record<string, unknown>
          | ((props: Record<string, unknown>) => Record<string, unknown>)
      ) => void;
    };
  }
}

/** Send a pageview for SPA navigations (Umami Cloud script is loaded once in index.html). */
export function trackUmamiPageview(pathname: string, search: string): void {
  if (typeof window === "undefined") return;
  const track = window.umami?.track;
  if (!track) return;

  const url = `${window.location.origin}${pathname}${search}`;

  track((props: Record<string, unknown>) => ({
    ...props,
    url,
  }));
}
