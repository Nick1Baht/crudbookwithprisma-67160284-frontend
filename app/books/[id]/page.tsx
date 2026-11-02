import { Suspense } from "react";
import BookDetailPage from "../book-detail-page";

async function BookDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetailPage bookId={id} />;
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="page-message">กำลังเปิดหนังสือ...</div>}>
      <BookDetailRoute params={params} />
    </Suspense>
  );
}
