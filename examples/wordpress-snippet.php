<?php
/**
 * Blakfy Cookie Widget — WordPress integration snippet (v2)
 * ---------------------------------------------------------
 * KVKK + GDPR + CCPA + Google CMv2 + Microsoft UET + Yandex Metrica
 * + IAB TCF v2.2 uyumlu cookie consent widget. 23 dil. 18 preset.
 *
 * KURULUM
 * -------
 * Bu dosyanın içeriğini şuradan birine ekle:
 *   A) Aktif tema'nın `functions.php` dosyasının sonuna,
 *   B) Yeni bir mu-plugin: `wp-content/mu-plugins/blakfy-cookie.php`,
 *   C) "Code Snippets" gibi bir snippet eklentisine.
 *
 * NOT: Tema güncellemelerinde kaybolmaması için (B) tercih edilir.
 *
 * GTM / GA4 ile uyumluluk
 * -----------------------
 * Bu snippet bootstrap script'ini `wp_head` priority 1 ile, yani GTM'den
 * ÖNCE yükler. GTM/GA4 tag'leri default 'denied' state ile başlar.
 * Kullanıcı kabul edince Google Consent Mode v2 sinyali otomatik 'update'
 * olarak push edilir. GTM tag'lerinde "Consent settings" → "Require
 * additional consent for tag firing" kullanmak yeterli.
 *
 * PRESET'LERİ ÖZELLEŞTİR
 * ----------------------
 * data-blakfy-presets attribute'una virgüllü ekle:
 *   ga4, gtm, maps, recaptcha, facebook, youtube, vimeo, hotjar, clarity,
 *   linkedin, yandex, bing, tiktok, pinterest, tawkto, intercom, hubspot,
 *   mailchimp
 *
 * Tam dokümantasyon: https://github.com/tariktunc/blakfy-cookie
 */

if (!defined('ABSPATH')) exit; // direct access engelle

/**
 * 1) BOOTSTRAP — wp_head priority 1 (GTM/GA4'ten önce)
 *    Tüm consent sinyallerini 'denied' olarak başlatır.
 */
add_action('wp_head', function () { ?>
  <!-- Blakfy Cookie — Bootstrap (defaults all consent to denied) -->
  <script src="https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.1.1/dist/cookie-defaults.min.js"></script>
<?php }, 1);

/**
 * 2) WIDGET — wp_footer (sayfa sonunda)
 *    Banner + badge + tag-gating observer + preset cleanup'lar.
 */
add_action('wp_footer', function () {
    // Cookie politikası sayfasının URL'sini akıllıca bul.
    // Slug "cerez-politikasi" varsa onu, yoksa fallback string.
    $policy_page = get_page_by_path('cerez-politikasi');
    $policy_url  = $policy_page ? get_permalink($policy_page) : '/cerez-politikasi';

    // Aktif preset listesi — GA4, GTM, Facebook Pixel, Microsoft Clarity.
    // İhtiyacına göre düzenle.
    $presets = 'ga4,gtm,facebook,clarity';

    // Politika versiyonu — politika metni değişince bunu artır.
    // Tüm kullanıcılar yeniden onay vermek zorunda kalır (re-consent).
    $policy_version = '1.0';
    ?>
  <!-- Blakfy Cookie — Widget -->
  <script
    src="https://cdn.jsdelivr.net/npm/@blakfy/cookie@2.1.1/dist/cookie.min.js"
    data-blakfy-locale="auto"
    data-blakfy-policy-url="<?php echo esc_url($policy_url); ?>"
    data-blakfy-version="<?php echo esc_attr($policy_version); ?>"
    data-blakfy-presets="<?php echo esc_attr($presets); ?>"
    data-blakfy-ccpa="auto"
    data-blakfy-tcf="false"
    data-blakfy-gpc="respect"
    data-blakfy-dnt="respect"
    data-blakfy-position="bottom-center"
    data-blakfy-theme="auto"
    data-blakfy-accent="#3E5C3A"></script>
<?php });

/**
 * 3) (Opsiyonel) Footer "Çerez Tercihleri" linki
 *    Footer menüsüne shortcode olarak ekle: [blakfy_cookie_link]
 */
add_shortcode('blakfy_cookie_link', function ($atts) {
    $atts = shortcode_atts(['label' => 'Çerez Tercihleri'], $atts, 'blakfy_cookie_link');
    return sprintf(
        '<a href="#" onclick="event.preventDefault(); if(window.BlakfyCookie) window.BlakfyCookie.open();">%s</a>',
        esc_html($atts['label'])
    );
});

/**
 * 4) (Opsiyonel) Audit endpoint için kendi REST route'unu ekle
 *    KVKK Md.12 / GDPR Art.7(1) ispat yükümlülüğü için kullanışlı.
 *    data-blakfy-audit-endpoint attribute'una bu route'u yaz:
 *      data-blakfy-audit-endpoint="/wp-json/blakfy/v1/consent"
 */
add_action('rest_api_init', function () {
    register_rest_route('blakfy/v1', '/consent', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function (WP_REST_Request $request) {
            $payload = $request->get_json_params();
            // TODO: payload'ı veritabanına / log dosyasına kaydet.
            // Örnek tablo: wp_blakfy_consent_log (id, uuid, action, state, ts).
            error_log('[blakfy-consent] ' . wp_json_encode($payload));
            return new WP_REST_Response(['ok' => true], 200);
        },
    ]);
});
