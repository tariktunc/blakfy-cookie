// blakfy-cookie/src/compliance/tcf-v2.js — IAB TCF v2.2 minimal CMP surface (preview-mode encoder)
// Simplified TC string encoder — produces parseable but empty vendor consent v2.2 string. Production sites SHOULD wait for IAB Europe CMP audit.

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

let lastTCString = "";
let vendorList = null;

const bitsToB64 = (bits) => {
  const pad = (6 - (bits.length % 6)) % 6;
  const padded = bits + "0".repeat(pad);
  let out = "";
  for (let i = 0; i < padded.length; i += 6) {
    out += B64.charAt(parseInt(padded.substr(i, 6), 2));
  }
  return out;
};

const intToBits = (n, width) => {
  let s = (n >>> 0).toString(2);
  if (s.length > width) s = s.slice(-width);
  return s.padStart(width, "0");
};

const bigIntToBits = (n, width) => {
  const v = BigInt(Math.max(0, Math.floor(Number(n) / 100)));
  let s = v.toString(2);
  if (s.length > width) s = s.slice(-width);
  return s.padStart(width, "0");
};

const charToBits = (c) => intToBits(c.toUpperCase().charCodeAt(0) - 65, 6);
const langToBits = (lang) =>
  charToBits((lang || "EN").charAt(0)) + charToBits((lang || "EN").charAt(1));

const buildPurposes = (state) => {
  const out = new Array(24).fill(0);
  out[0] = 1;
  if (state && state.analytics) {
    out[1] = 1;
    out[2] = 1;
    out[3] = 1;
  }
  if (state && state.marketing) {
    out[4] = 1;
    out[5] = 1;
    out[6] = 1;
    out[7] = 1;
    out[8] = 1;
  }
  if (state && state.functional) {
    out[9] = 1;
  }
  return out.join("");
};

export const buildTCString = (opts) => {
  const o = opts || {};
  const cmpId = o.cmpId | 0;
  const cmpVersion = o.cmpVersion | 0;
  const now = Date.now();
  const created = bigIntToBits(now, 36);
  const lastUpdated = bigIntToBits(now, 36);

  const purposesConsent = o.purposeConsents || buildPurposes(o.state);
  const purposesLI = "0".repeat(24);

  const core =
    intToBits(2, 6) +
    created +
    lastUpdated +
    intToBits(cmpId, 12) +
    intToBits(cmpVersion, 12) +
    intToBits(1, 6) +
    langToBits(o.consentLanguage || "EN") +
    intToBits(o.vendorListVersion || 300, 12) +
    intToBits(4, 6) +
    "1" +
    "0" +
    "0".repeat(12) +
    purposesConsent +
    purposesLI +
    "0" +
    charToBits("A") +
    charToBits("A") +
    intToBits(0, 16) +
    intToBits(0, 16) +
    "1" +
    intToBits(0, 12) +
    intToBits(0, 16) +
    intToBits(0, 16) +
    "1" +
    intToBits(0, 12);

  return bitsToB64(core);
};

export const getTCString = () => lastTCString;
export const setVendorList = (vl) => {
  vendorList = vl;
};

const buildPurposeMap = (state) => {
  const consents = {};
  const li = {};
  const s = state || {};
  for (let i = 1; i <= 11; i++) {
    consents[i] = false;
    li[i] = false;
  }
  consents[1] = true;
  if (s.analytics) {
    consents[2] = true;
    consents[3] = true;
    consents[4] = true;
  }
  if (s.marketing) {
    consents[5] = true;
    consents[6] = true;
    consents[7] = true;
    consents[8] = true;
    consents[9] = true;
  }
  if (s.functional) {
    consents[10] = true;
  }
  return { consents: consents, legitimateInterests: li };
};

export const installTCFAPI = (opts) => {
  if (typeof window === "undefined") return;
  const o = opts || {};
  const cmpId = o.cmpId | 0;
  const cmpVersion = o.cmpVersion | 0;
  const getConsent = typeof o.getConsent === "function" ? o.getConsent : () => ({});
  const subscribe = typeof o.on === "function" ? o.on : null;

  const listeners = Object.create(null);
  let nextId = 1;
  let displayStatus = "hidden";
  let eventStatus = "tcloaded";

  const buildTCData = (listenerId) => {
    const state = getConsent() || {};
    const purposes = buildPurposeMap(state);
    lastTCString = buildTCString({ cmpId: cmpId, cmpVersion: cmpVersion, state: state });
    return {
      tcString: lastTCString,
      eventStatus: eventStatus,
      cmpId: cmpId,
      cmpVersion: cmpVersion,
      gdprApplies: true,
      listenerId: typeof listenerId === "number" ? listenerId : null,
      addtlConsent: "",
      purpose: purposes,
      vendor: { consents: {}, legitimateInterests: {} },
    };
  };

  const buildPing = () => ({
    gdprApplies: true,
    cmpLoaded: true,
    cmpStatus: "loaded",
    displayStatus: displayStatus,
    apiVersion: "2.2",
    cmpVersion: cmpVersion,
    cmpId: cmpId,
    gvlVersion: vendorList && vendorList.vendorListVersion ? vendorList.vendorListVersion : 0,
    tcfPolicyVersion: 4,
  });

  const handle = (command, version, callback, parameter) => {
    if (typeof callback !== "function") return;
    if (command === "ping") {
      callback(buildPing(), true);
      return;
    }
    if (command === "getTCData") {
      callback(buildTCData(null), true);
      return;
    }
    if (command === "addEventListener") {
      const id = nextId++;
      listeners[id] = callback;
      callback(buildTCData(id), true);
      return;
    }
    if (command === "removeEventListener") {
      if (listeners[parameter]) {
        delete listeners[parameter];
        callback(true, true);
      } else callback(false, true);
      return;
    }
    callback(null, false);
  };

  if (!window.__tcfapi || !window.__tcfapi.__blakfy) {
    window.__tcfapi = (cmd, ver, cb, param) => handle(cmd, ver, cb, param);
    window.__tcfapi.__blakfy = true;
  }

  if (
    typeof document !== "undefined" &&
    !document.querySelector('iframe[name="__tcfapiLocator"]')
  ) {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "display:none;position:absolute;width:0;height:0;border:0";
      iframe.name = "__tcfapiLocator";
      (document.body || document.documentElement).appendChild(iframe);
    } catch (e) {
      /* noop */
    }
  }

  if (!window.__blakfyTcfMsg) {
    window.__blakfyTcfMsg = true;
    window.addEventListener("message", (ev) => {
      const data = ev && ev.data;
      if (!data) return;
      const payload = typeof data === "string" ? safeParse(data) : data;
      if (!payload || !payload.__tcfapiCall) return;
      const call = payload.__tcfapiCall;
      handle(
        call.command,
        call.version,
        (returnValue, success) => {
          const msg = {
            __tcfapiReturn: { returnValue: returnValue, success: success, callId: call.callId },
          };
          try {
            ev.source && ev.source.postMessage(msg, ev.origin || "*");
          } catch (e) {
            /* noop */
          }
        },
        call.parameter
      );
    });
  }

  const fireAll = () => {
    const ids = Object.keys(listeners);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      try {
        listeners[id](buildTCData(parseInt(id, 10)), true);
      } catch (e) {
        /* noop */
      }
    }
  };

  if (subscribe) {
    subscribe("change", () => {
      eventStatus = "useractioncomplete";
      fireAll();
    });
    subscribe("display", (visible) => {
      displayStatus = visible ? "visible" : "hidden";
      fireAll();
    });
  }

  return { fireAll: fireAll };
};

const safeParse = (s) => {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
};
