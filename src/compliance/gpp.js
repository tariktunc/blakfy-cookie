// blakfy-cookie/src/compliance/gpp.js — minimal IAB Global Privacy Platform (GPP) CMP API stub (#32)
//
// Scope note: this is a detection/signalling surface only (command queue + ping + getGPPData),
// enough for a GPP-aware ad partner to find this CMP and read applicable sections. It does NOT
// implement the full official GPP bitstring encoding for every US state section (that is its own
// validation project, same as TCF v2.2 in tcf-v2.js — file separately before relying on it for
// real ad-partner integrations). __uspapi (ccpa.js) is kept running in parallel for backwards
// compatibility during the TCF/USP -> GPP transition, per issue #32.

const SID_TCFEU = 2;
const SID_USNAT = 7; // US National section id per IAB GPP spec

const buildUSNatSection = (state) => {
  const s = state || {};
  // Minimal opt-out-status representation (not the official bit-packed string):
  // used only so a consumer reading getField()/getGPPData() sees a consistent, truthful signal.
  const saleOptOut = s.marketing ? 2 : 1; // 1 = opted out, 2 = did not opt out (GPP convention)
  const sharingOptOut = s.marketing ? 2 : 1;
  const targetedAdvertisingOptOut = s.marketing ? 2 : 1;
  return {
    Version: 1,
    SaleOptOut: saleOptOut,
    SharingOptOut: sharingOptOut,
    TargetedAdvertisingOptOut: targetedAdvertisingOptOut,
    Gpc: s.gpc === true,
  };
};

export const installGPPAPI = (opts) => {
  if (typeof window === "undefined") return null;
  const o = opts || {};
  const getConsent = typeof o.getConsent === "function" ? o.getConsent : () => ({});
  const getGpcFlag = typeof o.getGpc === "function" ? o.getGpc : () => false;
  const applicableSections = Array.isArray(o.applicableSections)
    ? o.applicableSections
    : [SID_USNAT];
  const subscribe = typeof o.on === "function" ? o.on : null;

  const listeners = Object.create(null);
  let nextId = 1;
  const cmpStatus = "loaded";

  const currentUSNat = () =>
    buildUSNatSection(Object.assign({}, getConsent(), { gpc: getGpcFlag() }));

  const buildGPPData = (listenerId) => ({
    gppVersion: "1.1",
    cmpStatus: cmpStatus,
    cmpDisplayStatus: "hidden",
    signalStatus: "ready",
    supportedAPIs: ["6:uspv1", "7:usnat"],
    cmpId: o.cmpId || 0,
    sectionList: applicableSections,
    applicableSections: applicableSections,
    gppString: "", // official bitstring encoding not implemented — see file header
    parsedSections: { usnat: currentUSNat() },
    listenerId: typeof listenerId === "number" ? listenerId : null,
  });

  const handle = (command, callback, parameter) => {
    if (typeof callback !== "function") return;
    if (command === "ping") {
      callback(
        {
          gppVersion: "1.1",
          cmpStatus: cmpStatus,
          cmpDisplayStatus: "hidden",
          supportedAPIs: ["6:uspv1", "7:usnat"],
          cmpId: o.cmpId || 0,
          sectionList: applicableSections,
          applicableSections: applicableSections,
        },
        true
      );
      return;
    }
    if (command === "getGPPData" || command === "getField") {
      callback(buildGPPData(null), true);
      return;
    }
    if (command === "addEventListener") {
      const id = nextId++;
      listeners[id] = callback;
      callback(buildGPPData(id), true);
      return;
    }
    if (command === "removeEventListener") {
      if (listeners[parameter]) {
        delete listeners[parameter];
        callback({ success: true }, true);
      } else callback({ success: false }, true);
      return;
    }
    callback(null, false);
  };

  const queue = window.__gpp && window.__gpp.queue ? window.__gpp.queue : [];

  if (!window.__gpp || !window.__gpp.__blakfy) {
    const gppFn = (command, callback, parameter) => handle(command, callback, parameter);
    gppFn.queue = [];
    gppFn.__blakfy = true;
    window.__gpp = gppFn;
    // drain anything queued before this stub loaded (standard GPP loader stub shape)
    for (let i = 0; i < queue.length; i++) {
      const args = queue[i];
      try {
        handle(args[0], args[1], args[2]);
      } catch (e) {
        /* noop */
      }
    }
  }

  if (typeof document !== "undefined" && !document.querySelector('iframe[name="__gppLocator"]')) {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "display:none;position:absolute;width:0;height:0;border:0";
      iframe.name = "__gppLocator";
      (document.body || document.documentElement).appendChild(iframe);
    } catch (e) {
      /* noop */
    }
  }

  const fireAll = (eventName) => {
    const ids = Object.keys(listeners);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      try {
        const data = buildGPPData(parseInt(id, 10));
        data.pingData = { signalStatus: eventName || "ready" };
        listeners[id](data, true);
      } catch (e) {
        /* noop */
      }
    }
  };

  if (subscribe) {
    subscribe("change", () => fireAll("useractioncomplete"));
  }

  return { fireAll: fireAll };
};
