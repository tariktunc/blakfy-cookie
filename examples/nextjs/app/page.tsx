// examples/nextjs/app/page.tsx — homepage demonstrates useGating, useBlakfyConsent, tag-gated <Script>
"use client";

import Script from "next/script";
import Link from "next/link";
import { useBlakfyConsent, useGating } from "@blakfy/cookie-next";

export default function HomePage() {
  return (
    <main>
      <h1 style={{ color: "#3E5C3A" }}>Blakfy Cookie — Next.js Demo</h1>
      <p>
        Bu sayfa <code>@blakfy/cookie-next</code> entegrasyonunun canlı bir örneğini gösterir. Sağ
        alt köşedeki banner'dan onay verince diğer bölümler aktif olur.
      </p>

      <Section title="1. Tag-gated YouTube embed (useGating)">
        <p>
          <code>useGating(&quot;marketing&quot;)</code> hook'u kullanıcının marketing kategori
          onayına göre içeriği koşullu render eder.
        </p>
        <YouTubeEmbed id="dQw4w9WgXcQ" />
      </Section>

      <Section title="2. Tag-gated <Script type='text/plain'>">
        <p>
          Bu <code>next/script</code> kullanıcı <strong>analytics</strong> kabul edene kadar
          çalışmaz. Tarayıcı <code>type=&quot;text/plain&quot;</code>'i çalıştırmaz; widget observer
          onay sonrası tipi <code>text/javascript</code>'e çevirir.
        </p>
        <Script
          id="example-analytics-tag"
          type="text/plain"
          data-blakfy-category="analytics"
          strategy="afterInteractive"
        >
          {`console.log("[blakfy-next demo] Analytics tag fired");`}
        </Script>
      </Section>

      <Section title="3. Imperative API + canlı state">
        <ConsentControls />
      </Section>

      <Section title="4. Footer linki">
        <p>Kullanıcılar tercihlerini değiştirebilmek için kalıcı bir link olmalı:</p>
        <PreferencesButton />
        {" — veya — "}
        <Link href="/cerez-politikasi">Çerez Politikası</Link>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        marginTop: 32,
        paddingTop: 16,
        borderTop: "1px solid #eee",
      }}
    >
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function YouTubeEmbed({ id }: { id: string }) {
  const allowed = useGating("marketing");
  if (!allowed) {
    return (
      <div
        style={{
          aspectRatio: "16 / 9",
          background: "#f3f4f6",
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          color: "#6b7280",
          padding: 24,
          textAlign: "center",
        }}
      >
        Bu içerik YouTube'dan geliyor ve <strong>marketing</strong> çerezleri gerektiriyor.
        Banner'dan onay verdikten sonra video burada belirir.
      </div>
    );
  }
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      title="YouTube video"
      width="100%"
      height={420}
      style={{ border: 0, borderRadius: 8, maxWidth: "100%" }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function ConsentControls() {
  const { state, jurisdiction, open, acceptAll, rejectAll, getConsent } = useBlakfyConsent();

  const btn: React.CSSProperties = {
    background: "#3E5C3A",
    color: "white",
    border: 0,
    padding: "10px 16px",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
    margin: "4px 4px 4px 0",
  };

  return (
    <>
      <p>
        <span style={{ background: "#e5e7eb", padding: "2px 10px", borderRadius: 999 }}>
          jurisdiction: {jurisdiction ?? "loading…"}
        </span>{" "}
        <span style={{ background: "#e5e7eb", padding: "2px 10px", borderRadius: 999 }}>
          analytics: {String(getConsent("analytics"))}
        </span>{" "}
        <span style={{ background: "#e5e7eb", padding: "2px 10px", borderRadius: 999 }}>
          marketing: {String(getConsent("marketing"))}
        </span>
      </p>
      <div>
        <button style={btn} onClick={open}>
          open()
        </button>
        <button style={btn} onClick={acceptAll}>
          acceptAll()
        </button>
        <button style={{ ...btn, background: "#6b7280" }} onClick={rejectAll}>
          rejectAll()
        </button>
        <button
          style={{ ...btn, background: "#6b7280" }}
          onClick={() => window.BlakfyCookie?.scan()}
        >
          scan()
        </button>
        <button
          style={{ ...btn, background: "#6b7280" }}
          onClick={() => window.BlakfyCookie?.ccpa.optOut()}
        >
          ccpa.optOut()
        </button>
      </div>
      <pre
        style={{
          background: "#f6f8fa",
          padding: 14,
          borderRadius: 8,
          overflowX: "auto",
          fontSize: 13,
        }}
      >
        {state ? JSON.stringify(state, null, 2) : "(state yok — kullanıcı henüz karar vermedi)"}
      </pre>
    </>
  );
}

function PreferencesButton() {
  const { open } = useBlakfyConsent();
  return (
    <button
      onClick={open}
      style={{
        background: "transparent",
        color: "#3E5C3A",
        textDecoration: "underline",
        border: 0,
        cursor: "pointer",
        padding: 0,
        font: "inherit",
      }}
    >
      Çerez Tercihleri
    </button>
  );
}
