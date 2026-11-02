"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BookCover from "./book-cover";
import BookForm from "./book-form";
import {
  Book,
  BookFormValues,
  deleteBook,
  getBooks,
  getErrorMessage,
  getAverageRating,
  saveBook,
} from "./book-api";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBooks() {
      try {
        const result = await getBooks();
        if (active) {
          setBooks(result);
          setLoadError("");
        }
      } catch (error) {
        if (active) setLoadError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBooks();
    return () => {
      active = false;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th");
    return books.filter((book) => {
      const matchesQuery =
        !normalizedQuery ||
        `${book.title} ${book.author} ${book.publishedYear ?? ""}`
          .toLocaleLowerCase("th")
          .includes(normalizedQuery);
      const matchesAvailability =
        availability === "all" ||
        String(book.isAvailable) === availability;
      return matchesQuery && matchesAvailability;
    });
  }, [availability, books, query]);

  async function handleSave(values: BookFormValues) {
    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const savedBook = await saveBook(values, editingBook?.id);
      setBooks((currentBooks) =>
        editingBook
          ? currentBooks.map((book) =>
              book.id === savedBook.id ? savedBook : book,
            )
          : [...currentBooks, savedBook],
      );
      setShowForm(false);
      setEditingBook(null);
      setNotice(editingBook ? "บันทึกการแก้ไขเรียบร้อยแล้ว" : "เพิ่มหนังสือเรียบร้อยแล้ว");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book: Book) {
    const confirmed = window.confirm(
      `ต้องการลบ “${book.title}” หรือไม่? รีวิวของหนังสือเล่มนี้จะถูกลบไปด้วย`,
    );
    if (!confirmed) return;

    setActionError("");
    setNotice("");
    try {
      await deleteBook(book.id);
      setBooks((currentBooks) =>
        currentBooks.filter((currentBook) => currentBook.id !== book.id),
      );
      setNotice(`ลบ “${book.title}” เรียบร้อยแล้ว`);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  function openCreateForm() {
    setEditingBook(null);
    setShowForm(true);
  }

  function openEditForm(book: Book) {
    setEditingBook(book);
    setShowForm(true);
  }

  return (
    <>
      <section className="page-intro">
        <div>
          <span className="eyebrow">YOUR PERSONAL LIBRARY</span>
          <h1>คลังหนังสือ</h1>
          <p>จัดระเบียบหนังสือเล่มโปรด พร้อมเก็บทุกรีวิวไว้ในที่เดียว</p>
        </div>
        <button
          className="button button-primary add-book-button"
          type="button"
          onClick={openCreateForm}
        >
          <span className="plus-mark" aria-hidden="true">
            +
          </span>
          เพิ่มหนังสือ
        </button>
      </section>

      <section className="library-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h2>หนังสือของคุณ</h2>
          </div>
        </div>

        <div className="table-toolbar">
          <label className="search-box">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.8" cy="8.8" r="5.7" />
              <path d="m13 13 4 4" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาชื่อหนังสือหรือผู้แต่ง"
              aria-label="ค้นหาหนังสือ"
            />
          </label>
          <label className="filter-select">
            <span className="sr-only">กรองตามสถานะ</span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="true">พร้อมให้อ่าน</option>
              <option value="false">ไม่พร้อมให้อ่าน</option>
            </select>
          </label>
        </div>

        {loadError && (
          <div className="inline-error" role="alert">
            <div>
              <strong>โหลดรายการหนังสือไม่สำเร็จ</strong>
              <p>{loadError}</p>
            </div>
            <button
              className="button button-quiet button-small"
              type="button"
              onClick={() => window.location.reload()}
            >
              ลองใหม่
            </button>
          </div>
        )}
        {actionError && (
          <div className="inline-error" role="alert">
            <p>{actionError}</p>
          </div>
        )}
        {notice && (
          <div className="inline-success" role="status">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="table-state">กำลังเชื่อมต่อกับคลังหนังสือ...</div>
        ) : loadError ? null : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-book-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M11 8h20a5 5 0 0 1 5 5v27H16a5 5 0 0 1-5-5V8Z" />
                <path d="M11 34a5 5 0 0 1 5-5h20M18 16h11M18 21h11" />
              </svg>
            </span>
            <h3>{books.length ? "ไม่พบหนังสือที่ค้นหา" : "เริ่มต้นชั้นหนังสือของคุณ"}</h3>
            <p>
              {books.length
                ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ"
                : "เพิ่มหนังสือเล่มแรก พร้อมใส่รูปปกและข้อมูลที่ต้องการ"}
            </p>
            {books.length === 0 && (
              <button
                className="button button-primary"
                type="button"
                onClick={openCreateForm}
              >
                เพิ่มหนังสือเล่มแรก
              </button>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="book-table">
              <thead>
                <tr>
                  <th scope="col">หนังสือ</th>
                  <th scope="col">ปีที่พิมพ์</th>
                  <th scope="col">สถานะ</th>
                  <th scope="col">รีวิว</th>
                  <th scope="col" aria-label="การจัดการ" />
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => {
                  const rating = getAverageRating(book.reviews);
                  return (
                    <tr key={book.id}>
                      <td>
                        <div className="book-cell">
                          <Link
                            className="cover-link"
                            href={`/books/${book.id}`}
                            aria-label={`ดูรายละเอียด ${book.title}`}
                          >
                            <BookCover
                              coverUrl={book.coverUrl}
                              title={book.title}
                              className="table-cover"
                            />
                          </Link>
                          <div className="book-cell-copy">
                            <span className="book-index">
                              BOOK {String(index + 1).padStart(2, "0")}
                            </span>
                            <Link
                              className="book-title-link"
                              href={`/books/${book.id}`}
                            >
                              {book.title}
                            </Link>
                            <span className="book-author">{book.author}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-muted">
                          {book.publishedYear ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${book.isAvailable ? "status-available" : "status-unavailable"}`}
                        >
                          <span />
                          {book.isAvailable ? "พร้อมให้อ่าน" : "ไม่พร้อม"}
                        </span>
                      </td>
                      <td>
                        <div className="review-summary">
                          <span className="review-star" aria-hidden="true">
                            ★
                          </span>
                          <span>{rating ?? "—"}</span>
                          <span className="review-total">
                            ({book.reviews?.length ?? 0})
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link
                            className="text-action"
                            href={`/books/${book.id}`}
                          >
                            รายละเอียด
                          </Link>
                          <button
                            className="icon-button row-edit-button"
                            type="button"
                            onClick={() => openEditForm(book)}
                            aria-label={`แก้ไข ${book.title}`}
                            title="แก้ไข"
                          >
                            ✎
                          </button>
                          <button
                            className="icon-button row-delete-button"
                            type="button"
                            onClick={() => void handleDelete(book)}
                            aria-label={`ลบ ${book.title}`}
                            title="ลบ"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </section>

      {showForm && (
        <BookForm
          book={editingBook ?? undefined}
          saving={saving}
          onSave={handleSave}
          onCancel={() => {
            if (!saving) {
              setShowForm(false);
              setEditingBook(null);
            }
          }}
        />
      )}
    </>
  );
}
