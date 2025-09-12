// components/BrandBanner.js
"use client";

import Image from "next/image";
import Link from "next/link";

export default function BrandBanner({
  src = "/brand/hero-mudamelekfinansial.webp", // taruh file hero di sini
  alt = "Mudamelekfinansial — belajar finansial dengan cara menyenangkan",
  title = "Yuk Literasi Keuangan",
  subtitle = "Bikin Keputusan Cerdas, dari Literasi yang Jelas!",
  primaryCta = { href: "/yuk-literasi", label: "Mulai Belajar" },
  secondaryCta = { href: "/articles", label: "Jelajahi Artikel" },
}) {
  return (
    <section className="brand-banner">
      {/* Media background */}
      <div className="brand-banner__media" aria-hidden="true">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="brand-banner__overlay" />
      </div>

      {/* Konten */}
      <div className="container">
        <div className="brand-banner__content">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          <div className="brand-banner__actions">
            <Link href={primaryCta.href} className="btn btn-primary btn-lg">
              {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} className="btn btn-outline btn-lg">
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
