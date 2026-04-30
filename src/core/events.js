// blakfy-cookie/src/core/events.js — minimal event emitter for state and category consent

export const createEmitter = () => {
  const listeners = Object.create(null);

  const on = (event, fn) => {
    if (typeof fn !== "function") return;
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
  };

  const off = (event, fn) => {
    const arr = listeners[event];
    if (!arr) return;
    const i = arr.indexOf(fn);
    if (i > -1) arr.splice(i, 1);
  };

  const emit = (event, ...args) => {
    const arr = listeners[event];
    if (!arr) return;
    for (let i = 0; i < arr.length; i++) {
      try { arr[i].apply(null, args); } catch (e) { /* swallow listener errors */ }
    }
  };

  return { on, off, emit };
};
