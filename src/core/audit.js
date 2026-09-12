// blakfy-cookie/src/core/audit.js — fire-and-forget audit log POST per docs/compliance.md §10
//
// #28: transport is sendBeacon first, fetch(keepalive) as fallback. A consent decision
// made in the same tick as a navigation/unload must not be lost — sendBeacon is the only
// browser primitive designed for that (its request survives page teardown); fetch with
// keepalive:true is the fallback for the (rare) environment where sendBeacon does not
// exist (older browsers) or where sendBeacon itself refuses the request (e.g. payload
// over its ~64KB queue limit — never a real concern for this payload shape, but checked
// defensively since sendBeacon returns false rather than throwing on that path).

/**
 * @typedef {Object} BlakfyAuditPayload
 * @property {string} id            Anonymous per-visitor id (`crypto.randomUUID()`, not a fingerprint).
 * @property {"accept_all"|"reject_all"|"save"} action  What triggered this record.
 * @property {string} timestamp     ISO 8601 timestamp of the consent decision.
 * @property {string} version       Policy version this decision was made under (`data-blakfy-version`).
 * @property {string} jurisdiction  Resolved jurisdiction ("GDPR" | "CCPA" | "LGPD" | "default").
 * @property {string|null} locale   Locale active when the decision was made.
 * @property {{analytics:boolean,marketing:boolean,functional:boolean,recording:boolean}} consent
 *   The granted/denied state per category at the time of this record.
 */

/**
 * POSTs one audit record to `endpoint`. Never throws, never blocks, never retries —
 * a failed audit POST must not affect the consent flow itself (fail-open by design).
 *
 * @param {string|null|undefined} endpoint
 * @param {BlakfyAuditPayload} payload
 */
export const postAudit = (endpoint, payload) => {
  if (!endpoint) return;

  let body;
  try {
    body = JSON.stringify(payload);
  } catch (e) {
    return; // unserializable payload — nothing sane to send
  }

  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function" &&
      typeof Blob !== "undefined"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
      // sendBeacon returned false (queue full / disallowed) — fall through to fetch.
    }
  } catch (e) {
    /* fall through to fetch */
  }

  try {
    if (typeof fetch === "function") {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    /* swallow — audit delivery must never break the consent flow */
  }
};
