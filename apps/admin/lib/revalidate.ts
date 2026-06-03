// Best-effort signal to refresh the PUBLIC website after a content change.
//
// Fire-and-forget: it must never block, delay, or throw into the caller's flow.
// It pings the admin's OWN same-origin route (no secret in the browser); that
// route forwards the request to the public site server-side. If anything fails,
// the public site still updates on its normal time-based revalidation.
export function pingRevalidate(): void {
  try {
    // keepalive lets the request finish even if the user navigates away.
    void fetch("/api/revalidate", { method: "POST", keepalive: true }).catch(() => {});
  } catch {
    /* ignore — never let a refresh signal break a save */
  }
}
