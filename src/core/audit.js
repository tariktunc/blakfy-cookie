// blakfy-cookie/src/core/audit.js — fire-and-forget audit log POST per COMPLIANCE.md §10

export const postAudit = (endpoint, payload) => {
  if (!endpoint) return;
  try {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    /* swallow */
  }
};
