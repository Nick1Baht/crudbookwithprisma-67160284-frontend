"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookCover from "./book-cover";
import BookForm from "./book-form";
import {
  Book,
  BookFormValues,
  createReview,
  deleteBook,
  formatBookDate,
  getAverageRating,
  getBook,
  getErrorMessage,
  Review,
  saveBook,
} from "./book-api";

export default function BookDetailPage({ bookId }: { bookId: string }) {
  const router = useRouter();
  const isValidId = Number.isInteger(Number(bookId)) && Number(bookId) > 0;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [postingReview, setPostingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let active = true;
    if (!isValidId) return;

    async function loadBook() {
      try {
        const result = await getBook(bookId);
        if (active) {
          setBook(result);
          setLoadError("");
        }
      } catch (error) {
        if (active) setLoadError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBook();
    return () => {
      active = false;
    };
  }, [bookId, isValidId]);

  async function handleSaveBook(values: BookFormValues) {
    if (!book) return;
    setSavingBook(true);
    try {
      const updatedBook = await saveBook(values, book.id);
      setBook(updatedBook);
      setShowForm(false);
    } finally {
      setSavingBook(false);
    }
  }

  async function handlePostReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!book || !reviewContent.trim()) return;

    setPostingReview(true);
    setReviewError("");
    setReviewNotice("");
    try {
      const savedReview = await createReview(book.id, {
        rating,
        content: reviewContent.trim(),
      });
      setBook((currentBook) =>
        currentBook
          ? {
              ...currentBook,
              reviews: [...(currentBook.reviews ?? []), savedReview],
            }
          : currentBook,
      );
      setReviewContent("");
      setRating(5);
      setReviewNotice("เพิ่มรีวิวเรียบร้อยแล้ว ขอบคุณที่แบ่งปัน");
    } catch (error) {
      setReviewError(getErrorMessage(error));
    } finally {
      setPostingReview(false);
    }
  }

  async function handleDeleteBook() {
    if (!book) return;
    const confirmed = window.confirm(
      `ต้องการลบ “${book.title}” หรือไม่? รีวิวของหนังสือเล่มนี้จะถูกลบไปด้วย`,
    );
    if (!confirmed) return;

    setDeleteError("");
    try {
      await deleteBook(book.id);
      router.push("/books");
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    }
  }

  if (!isValidId) {
    return (
      <section className="error-page">
        <span className="eyebrow">BOOK NOT FOUND</span>
        <h1>เปิดหนังสือเล่มนี้ไม่ได้</h1>
        <p>รหัสหนังสือไม่ถูกต้อง</p>
        <Link className="button button-primary" href="/books">
          กลับไปคลังหนังสือ
        </Link>
      </section>
    );
  }

  if (loading) {
    return <div className="page-message">กำลังโหลดรายละเอียดหนังสือ...</div>;
  }

  if (loadError || !book) {
    return (
      <section className="error-page">
        <span className="eyebrow">BOOK NOT FOUND</span>
        <h1>เปิดหนังสือเล่มนี้ไม่ได้</h1>
        <p>{loadError || "ไม่พบข้อมูลหนังสือ"}</p>
        <Link className="button button-primary" href="/books">
          กลับไปคลังหนังสือ
        </Link>
      </section>
    );
  }

  const reviews: Review[] = book.reviews ?? [];
  const averageRating = getAverageRating(reviews);

  return (
    <>
      <div className="breadcrumbs">
        <Link href="/books">คลังหนังสือ</Link>
        <span aria-hidden="true">/</span>
        <span>{book.title}</span>
      </div>

      <section className="detail-hero">
        <div className="detail-cover-wrap">
          <BookCover
            coverUrl={book.coverUrl}
            title={book.title}
            className="detail-cover"
          />
          <span className="cover-shadow" aria-hidden="true" />
        </div>
        <div className="detail-main">
          <span className="eyebrow">BOOK NO. {String(book.id).padStart(4, "0")}</span>
          <h1>{book.title}</h1>
          <p className="detail-author">โดย {book.author}</p>
          <p className="detail-meta">
            <span>ปีที่พิมพ์: {book.publishedYear ?? "ไม่ได้ระบุ"}</span>
            <span>วันที่พิมพ์: {formatBookDate(book.publishedAt)}</span>
          </p>
          <div className="detail-rating">
            <span className="rating-stars" aria-label="คะแนนเฉลี่ย">
              {"★".repeat(Math.round(Number(averageRating ?? 0)))}
              {"☆".repeat(5 - Math.round(Number(averageRating ?? 0)))}
            </span>
            <strong>{averageRating ?? "—"}</strong>
            <span>จาก {reviews.length} รีวิว</span>
          </div>
          <div
            className={`detail-status ${book.isAvailable ? "detail-status-available" : "detail-status-unavailable"}`}
            role="status"
          >
            <span className="detail-status-dot" aria-hidden="true" />
            <span className="detail-status-label">สถานะ</span>
            <strong>
              {book.isAvailable ? "พร้อมให้อ่าน" : "ไม่พร้อมให้อ่าน"}
            </strong>
          </div>
          <div className="detail-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => setShowForm(true)}
            >
              แก้ไขข้อมูล
            </button>
            <button
              className="button button-outline-danger"
              type="button"
              onClick={() => void handleDeleteBook()}
            >
              ลบหนังสือ
            </button>
          </div>
          {deleteError && (
            <p className="form-error detail-delete-error" role="alert">
              {deleteError}
            </p>
          )}
        </div>
        <span className="hero-decoration hero-decoration-one" aria-hidden="true" />
        <span className="hero-decoration hero-decoration-two" aria-hidden="true" />
      </section>

      <section className="reviews-section" id="reviews">
        <div className="reviews-heading">
          <div>
            <span className="eyebrow">THOUGHTS & IMPRESSIONS</span>
            <h2>รีวิวจากผู้อ่าน</h2>
            <p>ทุกความคิดเห็นช่วยให้หนังสือมีชีวิตขึ้นอีกครั้ง</p>
          </div>
          <div className="review-count-bubble">
            <strong>{reviews.length}</strong>
            <span>รีวิว</span>
          </div>
        </div>

        <div className="reviews-layout">
          <div className="review-list">
            {reviews.length === 0 ? (
              <div className="review-empty">
                <span aria-hidden="true">✎</span>
                <h3>ยังไม่มีรีวิว</h3>
                <p>มาเป็นคนแรกที่เขียนความรู้สึกหลังอ่านหนังสือเล่มนี้</p>
              </div>
            ) : (
              reviews.map((review, index) => (
                <article className="review-card" key={review.id}>
                  <div className="review-avatar" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="review-card-content">
                    <div className="review-card-top">
                      <strong>รีวิว #{review.id}</strong>
                      <span className="review-date-label">ผู้อ่าน</span>
                    </div>
                    <div
                      className="review-card-stars"
                      aria-label={`ให้คะแนน ${review.rating} จาก 5`}
                    >
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <p>{review.content}</p>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="review-form-card">
            <span className="eyebrow">LEAVE A NOTE</span>
            <h3>แบ่งปันรีวิวของคุณ</h3>
            <p className="review-form-copy">ชอบหนังสือเล่มนี้แค่ไหน?</p>
            <form onSubmit={handlePostReview}>
              <div className="rating-picker" aria-label="ให้คะแนนหนังสือ">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      className={
                        value <= rating ? "rating-star is-selected" : "rating-star"
                      }
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} ดาว`}
                      aria-pressed={rating === value}
                      disabled={postingReview}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <label className="form-field review-content-field">
                <span className="field-label">รีวิวของคุณ</span>
                <textarea
                  value={reviewContent}
                  onChange={(event) => setReviewContent(event.target.value)}
                  placeholder="เล่าความรู้สึกหรือประโยคที่ประทับใจ..."
                  rows={5}
                  maxLength={2000}
                  required
                  disabled={postingReview}
                />
                <span className="textarea-counter">
                  {reviewContent.length}/2000
                </span>
              </label>
              {reviewError && (
                <div className="form-error" role="alert">
                  {reviewError}
                </div>
              )}
              {reviewNotice && (
                <div className="inline-success" role="status">
                  {reviewNotice}
                </div>
              )}
              <button
                className="button button-primary review-submit"
                type="submit"
                disabled={postingReview || !reviewContent.trim()}
              >
                {postingReview ? "กำลังส่งรีวิว..." : "ส่งรีวิว"}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </aside>
        </div>
      </section>

      {showForm && (
        <BookForm
          book={book}
          saving={savingBook}
          onSave={handleSaveBook}
          onCancel={() => {
            if (!savingBook) setShowForm(false);
          }}
        />
      )}
    </>
  );
}
