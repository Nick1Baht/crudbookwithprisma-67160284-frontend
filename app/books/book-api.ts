export interface Review {
  id: number;
  rating: number;
  content: string;
  bookId: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  publishedYear?: number | null;
  publishedAt?: string;
  isAvailable: boolean;
  coverUrl?: string | null;
  reviews?: Review[];
}

export interface BookFormValues {
  title: string;
  author: string;
  publishedYear: string;
  publishedAt: string;
  isAvailable: boolean;
  cover: File | null;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

function getApiError(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }

  if (typeof payload === "string" && payload.trim()) return payload;
  return `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (รหัส ${status})`;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: "no-store",
  });
  const responseText = await response.text();
  let payload: unknown;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(getApiError(payload, response.status));
  }

  return payload as T;
}

export function getBooks(): Promise<Book[]> {
  return apiRequest<Book[]>("/books");
}

export function getBook(id: string): Promise<Book> {
  return apiRequest<Book>(`/books/${encodeURIComponent(id)}`);
}

export function saveBook(
  values: BookFormValues,
  id?: number,
): Promise<Book> {
  const formData = new FormData();
  formData.append("title", values.title.trim());
  formData.append("author", values.author.trim());
  formData.append("isAvailable", String(values.isAvailable));

  if (values.publishedYear.trim()) {
    formData.append("publishedYear", values.publishedYear.trim());
  }
  if (values.publishedAt) {
    formData.append("publishedAt", values.publishedAt);
  }
  if (values.cover) {
    formData.append("cover", values.cover);
  }

  return apiRequest<Book>(id ? `/books/${id}` : "/books", {
    method: id ? "PATCH" : "POST",
    body: formData,
  });
}

export function deleteBook(id: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/books/${id}`, {
    method: "DELETE",
  });
}

export function createReview(
  id: number,
  values: { rating: number; content: string },
): Promise<Review> {
  return apiRequest<Review>(`/books/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function coverImageUrl(coverUrl?: string | null): string | null {
  if (!coverUrl) return null;
  return new URL(coverUrl, `${API_BASE_URL}/`).toString();
}

export function formatBookDate(value?: string): string {
  if (!value) return "ไม่ได้ระบุ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่ได้ระบุ";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getAverageRating(reviews: Review[] = []): string | null {
  if (reviews.length === 0) return null;
  const average =
    reviews.reduce((total, review) => total + review.rating, 0) /
    reviews.length;
  return average.toFixed(1);
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองอีกครั้ง";
}
