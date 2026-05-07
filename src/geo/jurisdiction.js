// blakfy-cookie/src/geo/jurisdiction.js — jurisdiction detection (GDPR / CCPA / LGPD / default)

export const EU_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "NO",
  "IS",
  "LI",
  "GB",
  "UK",
  "CH",
];

export const mapCountryToJurisdiction = (country, region) => {
  if (!country) return "default";
  const c = String(country).toUpperCase();
  const r = region ? String(region).toUpperCase() : "";

  if (EU_COUNTRIES.indexOf(c) !== -1) return "GDPR";
  if (c === "TR") return "GDPR";
  if (c === "BR") return "LGPD";
  if (c === "US" && r === "CA") return "CCPA";
  return "default";
};

const tzGuess = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.indexOf("Europe/") === 0) return "GDPR";
    if (tz === "America/Los_Angeles" || tz === "America/Tijuana") return "CCPA";
    if (tz === "America/Sao_Paulo") return "LGPD";
    return "default";
  } catch (e) {
    return "default";
  }
};

export const detectJurisdiction = async (opts) => {
  const o = opts || {};

  if (
    typeof document !== "undefined" &&
    document.documentElement &&
    document.documentElement.dataset &&
    document.documentElement.dataset.jurisdiction
  ) {
    const v = document.documentElement.dataset.jurisdiction;
    if (v === "GDPR" || v === "CCPA" || v === "LGPD" || v === "default") return v;
  }

  if (o.geoEndpoint && typeof fetch === "function") {
    try {
      const res = await fetch(o.geoEndpoint, { credentials: "omit" });
      if (res && res.ok) {
        const data = await res.json();
        return mapCountryToJurisdiction(data && data.country, data && data.region);
      }
    } catch (e) {
      /* fall through */
    }
  }

  return tzGuess();
};
