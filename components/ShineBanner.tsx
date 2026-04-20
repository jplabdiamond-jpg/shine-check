"use client";

import Image from "next/image";

export default function ShineBanner() {
  return (
    <div className="shine-banner-wrapper mt-8 mb-4">
      <a href="https://yoru-navi-shine.com" target="_blank" rel="noopener noreferrer">
        <Image
          src="/shine_banner.png"
          alt="夜職ナビ Shine"
          width={320}
          height={80}
          className="shine-banner-img rounded-xl"
          priority={false}
        />
      </a>
    </div>
  );
}
