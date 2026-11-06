import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function focusContent() {
  const main = document.getElementById("workspace-content");
  const heading = main?.querySelector("h1");
  if (heading) heading.setAttribute("tabindex", "-1");
  (heading || main)?.focus({ preventScroll: true });
  if (main) main.scrollTop = 0;
}

export function RouteFocus({ focusOnMount = false }) {
  const { pathname } = useLocation();
  const previous = useRef(focusOnMount ? null : pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    const frame = requestAnimationFrame(() => { previous.current = pathname; focusContent(); });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
}

export function SkipToContent() {
  return <a href="#workspace-content" className="workspace-skip-link" onClick={event => { event.preventDefault(); focusContent(); }}>Skip to content</a>;
}
