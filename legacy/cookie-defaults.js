/*!
 * Blakfy Cookie Defaults — Google Consent Mode v2 Bootstrap
 * v1.0.0 | https://github.com/tariktunc/blakfy-cookie
 * MIT License
 *
 * USAGE: Place this as the FIRST script in <head>, BEFORE GTM/GA4.
 * It sets all consent signals to 'denied' until the user makes a choice.
 */
(function () {
  if (window.__blakfyConsentDefaultsLoaded) return;
  window.__blakfyConsentDefaultsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage:              'denied',
    ad_user_data:            'denied',
    ad_personalization:      'denied',
    analytics_storage:       'denied',
    functionality_storage:   'denied',
    personalization_storage: 'denied',
    security_storage:        'granted',
    wait_for_update:         500
  });
})();
