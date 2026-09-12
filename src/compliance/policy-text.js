// blakfy-cookie/src/compliance/policy-text.js — generates the in-widget policy notice (#49)
//
// Owner decision (2026-09-12, issue #49): when data-blakfy-policy-url is unset or
// "auto", the widget shows a generated notice instead of linking off-site to a page
// that may 404. The notice needs the site operator's identity (GDPR Art. 13(1)(a) /
// KVKK Md.10), which the widget does not otherwise collect — hence the new
// data-blakfy-operator / data-blakfy-operator-contact / data-blakfy-operator-address
// config fields. Missing operator/contact is a real compliance gap, not a rendering
// choice: this module marks the result `incomplete: true` rather than silently
// producing a notice that looks complete but omits the controller's identity — the
// caller (ui/modal.js) is expected to surface that loudly, not hide it (consistent
// with #43's fail-loud philosophy).

import { getPolicyStrings } from "../i18n/policy-strings.js";

const RIGHTS_KEY_BY_JURISDICTION = {
  GDPR: "rightsGDPR",
  KVKK: "rightsKVKK",
  CCPA: "rightsCCPA",
};

export const isAutoPolicy = (policyUrl) => !policyUrl || policyUrl === "auto";

// enrichedPresets: [{ key, meta }] — same shape ui/modal.js already builds from
// SERVICE_METADATA for the Services tab.
export const buildPolicyText = ({
  locale,
  operator,
  operatorContact,
  operatorAddress,
  jurisdiction,
  policyVersion,
  consentTimestamp,
  enrichedPresets,
}) => {
  const s = getPolicyStrings(locale);
  const hasOperator = !!(operator && operatorContact);

  const services = (enrichedPresets || [])
    .filter((p) => p && p.meta)
    .map((p) => ({
      key: p.key,
      displayName: p.meta.displayName || p.key,
      category: p.meta.category || "",
      purposes: p.meta.purposes || [],
      legalBasis: p.meta.legalBasis || "",
      retention: p.meta.retention || "",
      processorName: (p.meta.processor && p.meta.processor.name) || "",
      transferCountries: p.meta.transferCountries || [],
    }));

  const rightsKey = RIGHTS_KEY_BY_JURISDICTION[jurisdiction] || "rightsDefault";

  return {
    incomplete: !hasOperator,
    strings: s,
    controller: {
      name: operator || null,
      contact: operatorContact || null,
      address: operatorAddress || null,
    },
    services: services,
    rightsText: s[rightsKey] || s.rightsDefault,
    policyVersion: policyVersion || null,
    consentTimestamp: consentTimestamp || null,
  };
};
