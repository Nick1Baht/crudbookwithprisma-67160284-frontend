import Link from "next/link";

export default function BooksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/books" aria-label="ชั้นหนังสือ ไปหน้ารายการ">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M7 6.5h13.5A4.5 4.5 0 0 1 25 11v14H11.5A4.5 4.5 0 0 1 7 20.5v-14Z" />
                <path d="M7 19.5h13.5A4.5 4.5 0 0 1 25 24M12 11h8M12 15h8" />
              </svg>
            </span>
            <span className="brand-name">ชั้นหนังสือ</span>
          </Link>
          <div className="header-note">
            <span className="header-note-dot" />
            จัดการคลังหนังสือ
          </div>
        </div>
      </header>
      <main className="page-shell">{children}</main>
      <footer className="site-footer">
        <span>อ่านดี มีเรื่องเล่า</span>
        <span>Book collection manager</span>
      </footer>
    </>
  );
}
