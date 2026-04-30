// blakfy-cookie/packages/cookie-next/src/ConsentModeDefault.tsx — head-stage GCM/UET/Yandex denial defaults

import Script from "next/script";

const SCRIPT = `(function(){if(typeof window==='undefined')return;if(window.__blakfyConsentDefaultsLoaded)return;window.__blakfyConsentDefaultsLoaded=true;try{window.dataLayer=window.dataLayer||[];if(typeof window.gtag!=='function'){window.gtag=function(){window.dataLayer.push(arguments);};}window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted',wait_for_update:500});}catch(e){}try{window.uetq=window.uetq||[];window.uetq.push('consent','default',{ad_storage:'denied'});}catch(e){}try{if(typeof window.ym!=='function'){window.ym=function(){};window.ym.__blakfyStub=true;}}catch(e){}})();`;

export function ConsentModeDefault() {
  return (
    <Script
      id="blakfy-consent-defaults"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
