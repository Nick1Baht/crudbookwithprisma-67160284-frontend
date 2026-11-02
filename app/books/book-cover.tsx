"use client";

import Image from "next/image";
import { useState } from "react";
import { coverImageUrl } from "./book-api";

export default function BookCover({
  coverUrl,
  title,
  className = "",
}: {
  coverUrl?: string | null;
  title: string;
  className?: string;
}) {
  const src = coverImageUrl(coverUrl);

  return (
    <div className={`book-cover ${className}`}>
      {src ? (
        <LoadedBookCover key={src} src={src} title={title} />
      ) : (
        <CoverPlaceholder label="ไม่มีรูปปก" />
      )}
    </div>
  );
}

function LoadedBookCover({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <CoverPlaceholder label="โหลดรูปปกไม่สำเร็จ" />;

  return (
    <Image
      src={src}
      alt={`ปกหนังสือ ${title}`}
      width={160}
      height={220}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

function CoverPlaceholder({ label }: { label: string }) {
  return (
    <div className="cover-placeholder" aria-label={label}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M12 8h19a5 5 0 0 1 5 5v27H17a5 5 0 0 1-5-5V8Z" />
        <path d="M12 34a5 5 0 0 1 5-5h19M18 16h11M18 21h11" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
