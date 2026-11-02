# สร้าง Backend ใหม่ด้วย JavaScript + Express

[กลับ README](../README.md)

ตัวอย่างนี้สำหรับฝึกเปลี่ยน Backend โดยใช้ Frontend หนังสือเดิม **ข้อมูลเก็บใน array ปิดหรือรีสตาร์ตแล้วหาย และไม่มีอัปโหลดรูป** หากต้องการ DB ถาวรให้ต่อฐานข้อมูลแทน array อีกขั้น ไม่ได้ย้ายข้อมูลจาก NestJS เดิมให้อัตโนมัติ

ตัวอย่างในเอกสารยังไม่ได้แทนที่ Backend จริง ให้สร้างโฟลเดอร์ใหม่ เก็บ NestJS เดิมไว้กลับมาดูได้ ใช้ `npm`/`npx` บนเครื่องแล็ปที่ไม่บล็อก ถ้า PowerShell บล็อกใช้ `npm.cmd`/`npx.cmd` แทน

## 1. สร้างโปรเจกต์แยก

เปิด Terminal ที่โฟลเดอร์เก็บงาน (ไม่ใช่ใน app ของ Frontend):

```powershell
mkdir book-backend-js
cd book-backend-js
npm init -y
npm install express cors
```

package.json ใหม่จาก npm init ใช้รูปแบบ CommonJS ในตัวอย่างนี้ หากคุณสร้างไว้ก่อนแล้วมี `"type": "module"` ให้ใช้ชื่อ `server.cjs` แทน `server.js` และเปลี่ยนชื่อใน scripts ให้ตรง ไม่ผสม require กับ ES module โดยไม่ตั้งค่า

เปิด package.json เพิ่ม/แก้เฉพาะ scripts โดยเก็บ dependencies ที่ npm ติดตั้งไว้:

```json
"scripts": {
  "dev": "node --watch server.js",
  "start": "node server.js"
}
```

นี่เป็นเพียงส่วนหนึ่งของ package.json ไม่ใช่ทั้งไฟล์ ใช้ Node เวอร์ชันที่รองรับ --watch (Node ที่ใช้กับโปรเจกต์ Next.js นี้รองรับแล้ว)

## 2. สร้าง server.js

สร้าง `server.js` ที่ระดับเดียวกับ package.json ของ **book-backend-js**:

```js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

let books = [];
let nextBookId = 1;
let nextReviewId = 1;

function findBook(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'ID ต้องเป็นจำนวนเต็มมากกว่า 0' });
  }
  const book = books.find((item) => item.id === id);
  if (!book) return res.status(404).json({ message: 'ไม่พบหนังสือ' });
  req.book = book;
  next();
}

function bookData(input) {
  if (!input || typeof input.title !== 'string' || !input.title.trim()
      || typeof input.author !== 'string' || !input.author.trim()) {
    throw new Error('กรุณากรอกชื่อหนังสือและผู้แต่ง');
  }
  if (typeof input.isAvailable !== 'boolean') {
    throw new Error('isAvailable ต้องเป็น boolean');
  }
  if (input.publishedYear != null
      && (!Number.isInteger(input.publishedYear) || input.publishedYear < 0 || input.publishedYear > 9999)) {
    throw new Error('ปีที่พิมพ์ต้องเป็นจำนวนเต็ม 0–9999 หรือ null');
  }
  const date = input.publishedAt === undefined ? new Date() : new Date(input.publishedAt);
  if (input.publishedAt === null || Number.isNaN(date.getTime())) {
    throw new Error('วันที่พิมพ์ไม่ถูกต้อง');
  }
  return {
    title: input.title.trim(),
    author: input.author.trim(),
    publishedYear: input.publishedYear ?? null,
    publishedAt: date.toISOString(),
    isAvailable: input.isAvailable,
  };
}

app.get('/books', (_req, res) => res.json(books));

app.get('/books/:id', findBook, (req, res) => res.json(req.book));

app.post('/books', (req, res) => {
  try {
    const data = bookData({ isAvailable: true, ...req.body });
    const book = { ...data, id: nextBookId++, coverUrl: null, reviews: [] };
    books.push(book);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/books/:id', findBook, (req, res) => {
  try {
    const data = bookData({ ...req.book, ...req.body });
    Object.assign(req.book, data);
    res.json(req.book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/books/:id', findBook, (req, res) => {
  books = books.filter((item) => item.id !== req.book.id);
  res.json({ message: 'ลบหนังสือและรีวิวแล้ว' });
});

app.get('/books/:id/reviews', findBook, (req, res) => res.json(req.book.reviews));

app.post('/books/:id/reviews', findBook, (req, res) => {
  const { rating, content } = req.body || {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5
      || typeof content !== 'string' || !content.trim() || content.trim().length > 2000) {
    return res.status(400).json({ message: 'คะแนนต้องเป็น 1–5 และรีวิวมีข้อความไม่เกิน 2000 ตัวอักษร' });
  }
  const review = { id: nextReviewId++, bookId: req.book.id, rating, content: content.trim() };
  req.book.reviews.push(review);
  res.status(201).json(review);
});

app.use((error, _req, res, _next) => {
  const status = error.status >= 400 && error.status < 600 ? error.status : 500;
  res.status(status).json({ message: status === 500 ? 'เซิร์ฟเวอร์ทำงานผิดพลาด' : error.message });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API ready: http://localhost:${port}`));
```

bookData เลือกเฉพาะฟิลด์ที่อนุญาต ไม่ให้ผู้ใช้แก้ id/reviews ผ่าน PATCH ของหนังสือ ตัวอย่างใช้ JSON จริง ไม่รองรับ multipart/form-data

## 3. เปลี่ยน Frontend ให้ส่ง JSON

ใน **Frontend** `app/books/book-api.ts` แทนที่ saveBook ด้วยตัวอย่าง JSON ใน [README ข้อ 8](../README.md#8-เชื่อมและเปลี่ยน-backend) ทั้งฟังก์ชัน อย่าเก็บฟังก์ชันชื่อซ้ำไว้

ใน `app/books/book-form.tsx` เอาส่วนรูปที่ไม่รองรับออกให้ครบ:

1. ลบ import Image จาก next/image และเอา useEffect/useRef ออกจาก import React ถ้าไม่ได้ใช้ที่อื่น (เก็บ FormEvent/useState)
2. ลบ ALLOWED_IMAGE_TYPES และ MAX_IMAGE_SIZE
3. ลบ state cover, previewUrl, previewUrlRef, useEffect ที่คืน URL และ handleCoverChange
4. ลบเงื่อนไขตรวจชนิด/ขนาด cover ใน handleSubmit
5. ใน object ที่ส่ง onSave เปลี่ยน `cover,` เป็น `cover: null,` เพื่อยังตรงกับ BookFormValues เดิม
6. ลบตัวแปร coverSrc และ JSX ทั้งก้อน `<div className="cover-upload-row">...</div>` ให้ครบคู่เปิด/ปิด
7. เอา coverImageUrl ออกจาก import ในไฟล์ฟอร์มถ้าไม่ได้ใช้อีก

BookFormValues ยังเก็บ `cover: File | null` ได้โดยส่ง null เสมอ เพื่อให้ใช้ตัวอย่าง JSON จาก README ตรง ๆ หน้าอื่นที่แสดง BookCover ยังเก็บไว้ได้และจะแสดงรูปสำรอง เพราะ Backend นี้ตอบ coverUrl เป็น null

ตรวจ **Frontend** .env.local:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

หากอยากคงอัปโหลดรูป ต้องเพิ่ม middleware รับ multipart เช่น multer, ตรวจไฟล์/ขนาด, เก็บไฟล์, เปิด static URL และตอบ coverUrl ที่ใช้งานได้ แล้วเก็บ saveBook แบบ FormData เดิมไว้ การลง multer อย่างเดียวไม่ทำให้รับรูปได้ครบเอง

## 4. เปิดและทดสอบ

หยุด NestJS เดิมที่ใช้พอร์ต 3000 ก่อน เปิด Terminal ใน **book-backend-js**:

```powershell
npm run dev
```

เปิด `http://localhost:3000/books` ต้องได้ `[]` จากนั้นใน **Frontend**:

```powershell
npm run lint
npm run build
npm run dev
```

เปิด `http://localhost:3001/books` ลองเพิ่ม แก้ รายละเอียด รีวิว และลบ การรีเฟรชหน้าเว็บไม่ทำให้ข้อมูลหาย แต่ **แก้ server.js แล้ว --watch รีสตาร์ต หรือปิด Backend จะล้าง array ทั้งหมด**

ถ้ายังส่ง FormData เดิมอยู่ Backend JSON จะอ่านฟิลด์ไม่เจอและบันทึกไม่สำเร็จ ให้ตรวจ request ใน F12 → Network ก่อน

ถ้าจะกลับไป NestJS ให้หยุด Express เปิด NestJS แทน และย้อนการเปลี่ยน saveBook/ฟอร์มด้วย Git หรือแก้กลับตามโค้ดเดิม อย่ารันสอง Backend พอร์ตเดียวกัน

## 5. เก็บขึ้น Git และพัฒนาต่อ

สร้าง repository สำหรับ Backend ใหม่นี้แยกจาก Frontend เก็บ server.js, package.json, package-lock.json, README และ .gitignore โดยเพิ่มรายการ ignore เช่น:

```gitignore
node_modules/
.env*
!.env.example
uploads/
*.log
```

ถ้ายังไม่ได้ init Git ในโฟลเดอร์ใหม่นี้ ใช้ `git init` แล้ว add/commit/ตั้ง remote/push ตาม README หลัก เครื่องใหม่ clone แล้ว `npm ci` และ `npm run dev` ไม่ใช้ prisma:generate หรือ prisma:push กับตัวอย่างนี้ เพราะไม่ได้ติดตั้ง Prisma

หากจะเก็บข้อมูลถาวร ให้เลือก DB แล้วเปลี่ยน route ที่อ่าน/แก้ array ให้ใช้ query/client ของ DB พร้อม await และ error handling Prisma ก็ใช้ใน JavaScript ได้ แต่ต้องติดตั้ง/ตั้ง schema/generate ตามเวอร์ชันที่เลือก และมีแผนสำรองข้อมูล ไม่ใช่เปลี่ยนชื่อ array แล้วได้ฐานข้อมูลทันที

ตัวอย่างนี้ไม่ได้มี `/products` หากทำ CRUD สินค้าในคู่มืออีกเล่มแล้วเปลี่ยนมาใช้ Backend นี้ ต้องเพิ่ม routes สินค้าให้ครบด้วย
