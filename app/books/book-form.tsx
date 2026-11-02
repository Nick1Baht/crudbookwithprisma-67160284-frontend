"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Book, BookFormValues, coverImageUrl } from "./book-api";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function BookForm({
  book,
  saving,
  onSave,
  onCancel,
}: {
  book?: Book;
  saving: boolean;
  onSave: (values: BookFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [publishedYear, setPublishedYear] = useState(
    book?.publishedYear != null ? String(book.publishedYear) : "",
  );
  const [publishedAt, setPublishedAt] = useState(
    book?.publishedAt ? book.publishedAt.slice(0, 10) : "",
  );
  const [isAvailable, setIsAvailable] = useState(book?.isAvailable ?? true);
  const [cover, setCover] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function handleCoverChange(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = file ? URL.createObjectURL(file) : null;
    setPreviewUrl(previewUrlRef.current);
    setCover(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!title.trim() || !author.trim()) {
      setFormError("กรุณากรอกชื่อหนังสือและชื่อผู้แต่ง");
      return;
    }
    if (publishedYear && !/^\d{1,4}$/.test(publishedYear)) {
      setFormError("ปีที่พิมพ์ต้องเป็นตัวเลขจำนวนเต็ม");
      return;
    }
    if (cover && !ALLOWED_IMAGE_TYPES.includes(cover.type)) {
      setFormError("รองรับเฉพาะไฟล์ JPEG, PNG, GIF และ WebP");
      return;
    }
    if (cover && cover.size > MAX_IMAGE_SIZE) {
      setFormError("ขนาดรูปปกต้องไม่เกิน 5 MB");
      return;
    }

    try {
      await onSave({
        title,
        author,
        publishedYear,
        publishedAt,
        isAvailable,
        cover,
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "บันทึกหนังสือไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    }
  }

  const coverSrc =
    previewUrl ?? (book?.coverUrl ? coverImageUrl(book.coverUrl) : null);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{book ? "EDIT BOOK" : "NEW ARRIVAL"}</span>
            <h2 id="book-form-title">
              {book ? "แก้ไขข้อมูลหนังสือ" : "เพิ่มหนังสือเล่มใหม่"}
            </h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onCancel}
            aria-label="ปิดหน้าต่าง"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form className="book-form" onSubmit={handleSubmit}>
          <div className="cover-upload-row">
            <div className="upload-preview">
              {coverSrc ? (
                <Image
                  src={coverSrc}
                  alt="ตัวอย่างรูปปก"
                  width={108}
                  height={144}
                  unoptimized
                />
              ) : (
                <span className="upload-placeholder" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M12 8h19a5 5 0 0 1 5 5v27H17a5 5 0 0 1-5-5V8Z" />
                    <path d="M12 34a5 5 0 0 1 5-5h19M18 16h11M18 21h11" />
                  </svg>
                </span>
              )}
            </div>
            <div className="upload-copy">
              <label className="field-label" htmlFor="book-cover">
                รูปปกหนังสือ
              </label>
              <p>JPEG, PNG, GIF หรือ WebP · ไม่เกิน 5 MB</p>
              <input
                id="book-cover"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(event) =>
                  handleCoverChange(event.currentTarget.files?.[0] ?? null)
                }
                disabled={saving}
              />
              {book?.coverUrl && !cover && (
                <span className="field-hint">เว้นว่างไว้เพื่อใช้รูปปกเดิม</span>
              )}
            </div>
          </div>

          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span className="field-label">ชื่อหนังสือ *</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="เช่น ก่อนดวงตะวันลับฟ้า"
                maxLength={200}
                required
                disabled={saving}
              />
            </label>
            <label className="form-field form-field-wide">
              <span className="field-label">ผู้แต่ง *</span>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="ชื่อผู้เขียน"
                maxLength={160}
                required
                disabled={saving}
              />
            </label>
            <label className="form-field">
              <span className="field-label">ปีที่พิมพ์</span>
              <input
                type="number"
                min="0"
                max="9999"
                value={publishedYear}
                onChange={(event) => setPublishedYear(event.target.value)}
                placeholder="เช่น 2567"
                disabled={saving}
              />
            </label>
            <label className="form-field">
              <span className="field-label">วันที่พิมพ์</span>
              <input
                type="date"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
                disabled={saving}
              />
            </label>
            <label className="form-field form-field-wide">
              <span className="field-label">สถานะหนังสือ</span>
              <select
                value={String(isAvailable)}
                onChange={(event) =>
                  setIsAvailable(event.target.value === "true")
                }
                disabled={saving}
              >
                <option value="true">พร้อมให้อ่าน</option>
                <option value="false">ไม่พร้อมให้อ่าน</option>
              </select>
            </label>
          </div>

          {formError && (
            <div className="form-error" role="alert">
              {formError}
            </div>
          )}

          <div className="modal-actions">
            <button
              className="button button-quiet"
              type="button"
              onClick={onCancel}
              disabled={saving}
            >
              ยกเลิก
            </button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "กำลังบันทึก..." : book ? "บันทึกการแก้ไข" : "เพิ่มหนังสือ"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
