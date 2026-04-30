// examples/nextjs/app/cerez-politikasi/page.tsx — placeholder cookie policy page
import Link from "next/link";

export const metadata = {
  title: "Çerez Politikası — Blakfy Cookie Demo",
};

export default function CookiePolicyPage() {
  return (
    <main>
      <h1 style={{ color: "#3E5C3A" }}>Çerez Politikası</h1>
      <p>
        <em>
          Bu, demo amaçlı bir placeholder sayfasıdır. Production'da burayı
          KVKK Md.10 (aydınlatma yükümlülüğü) ve GDPR Art.13 (information
          to be provided) gereksinimlerini karşılayan tam metinle
          doldurmalısın.
        </em>
      </p>

      <h2>İçerik şablonu</h2>
      <ol>
        <li>Veri sorumlusunun kimliği ve iletişim bilgileri</li>
        <li>Kullanılan çerez kategorileri ve amaçları (essential, analytics, marketing, functional, recording)</li>
        <li>Üçüncü taraf çerezleri ve sağlayıcılar (Google, Meta, Microsoft, Yandex, vb.)</li>
        <li>Saklama süreleri</li>
        <li>Yasal dayanak (GDPR Art.6(1)(a) açık rıza, KVKK Md.5)</li>
        <li>Kullanıcı hakları ve başvuru kanalları (KVKK Md.11, GDPR Art.15-22)</li>
        <li>Onay yönetimi (banner üzerinden veya footer linkinden)</li>
      </ol>

      <p>
        <Link href="/">← Anasayfa</Link>
      </p>
    </main>
  );
}
