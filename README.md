# คู่มือใช้และดัดแปลง CRUD หนังสือ สำหรับผู้เริ่มต้น

โปรเจกต์นี้เป็น **Frontend (หน้าเว็บ)** สำหรับเพิ่ม ดู แก้ไข ลบหนังสือ อัปโหลดรูปปก และเพิ่มรีวิว ใช้เป็นฐานทำระบบสินค้า นักเรียน อุปกรณ์ ฯลฯ ได้ คู่มือนี้อ้างอิงไฟล์ปัจจุบัน และตรวจโครงสร้าง Backend คู่กันในโฟลเดอร์ `crudbookwithprisma-67160284` แล้ว

**เพิ่งดึงจาก Git ให้ทำข้อ 2–5 ก่อน** เมื่อรันของเดิมได้แล้วค่อยดัดแปลงทีละส่วน ไม่จำเป็นต้องอ่านและทำทุกตัวอย่างพร้อมกัน

## สารบัญ

1. [เข้าใจระบบ](#1-เข้าใจระบบ)
2. [เตรียมเครื่อง](#2-เตรียมเครื่อง)
3. [ดึงจาก Git และไฟล์ที่ไม่ได้ตามมา](#3-ดึงจาก-git-และไฟล์ที่ไม่ได้ตามมา)
4. [ติดตั้งและรัน Backend](#4-ติดตั้งและรัน-backend)
5. [ติดตั้งและรัน Frontend](#5-ติดตั้งและรัน-frontend)
6. [คำสั่งที่ใช้บ่อย](#6-คำสั่งที่ใช้บ่อย)
7. [แก้หน้าเว็บตรงไหน](#7-แก้หน้าเว็บตรงไหน)
8. [เชื่อมและเปลี่ยน Backend](#8-เชื่อมและเปลี่ยน-backend)
9. [เพิ่มฟิลด์หรือเปลี่ยนระบบ](#9-เพิ่มฟิลด์หรือเปลี่ยนระบบ)
10. [เพิ่ม CRUD ชุดที่สอง](#10-เพิ่ม-crud-ชุดที่สอง)
11. [เปลี่ยนฐานข้อมูล](#11-เปลี่ยนฐานข้อมูล)
12. [ใช้ JavaScript เป็น Backend](#12-ใช้-javascript-เป็น-backend)
13. [ทำงานข้ามเครื่องและสำรองข้อมูล](#13-ทำงานข้ามเครื่องและสำรองข้อมูล)
14. [แก้ปัญหา](#14-แก้ปัญหา)
15. [ตรวจงานก่อนส่ง](#15-ตรวจงานก่อนส่ง)

ตัวอย่างเต็มแยกไว้ให้อ่านตามงาน:

- [เพิ่ม CRUD สินค้าชุดที่สอง ทั้ง Backend และ Frontend](docs/add-second-crud.md)
- [สร้าง Backend ใหม่ด้วย JavaScript + Express](docs/javascript-backend.md)

## 1. เข้าใจระบบ

```text
ผู้ใช้เปิด http://localhost:3001/books
       ↓
Frontend: Next.js + React + TypeScript
       ↓ ส่ง HTTP request เช่น GET /books
Backend: NestJS + TypeScript ที่ http://localhost:3000
       ↓ ใช้ Prisma อ่าน/เขียนข้อมูล
Database: SQLite ไฟล์ prisma/dev.db ใน Backend

รูปปก: เก็บแยกใน uploads/ ของ Backend
```

| คำ | ความหมาย |
| --- | --- |
| CRUD | Create เพิ่ม, Read ดู, Update แก้ไข, Delete ลบ |
| Frontend | หน้าเว็บ ปุ่ม ตาราง ฟอร์ม สี และการแสดงข้อมูล |
| Backend | รับคำขอ ตรวจข้อมูล และสั่งฐานข้อมูล |
| Database / DB | ที่เก็บข้อมูลถาวร ปิดเว็บแล้วข้อมูลยังอยู่ |
| API / Endpoint | ช่องทาง/ที่อยู่ที่ใช้คุยกับ Backend เช่น `/books` |
| Port | หมายเลขแยกบริการ เช่น 3000 กับ 3001 |
| localhost | เครื่องที่กำลังเปิดโปรแกรมนั้นอยู่ |
| Dependency | ไลบรารีที่ต้องใช้ ติดตั้งด้วย npm |
| Schema / Model | แบบโครงสร้างข้อมูล เช่น หนังสือมีชื่อและผู้แต่ง |
| Migration | ประวัติการเปลี่ยนโครงสร้างฐานข้อมูล |
| Component | ชิ้นส่วนหน้าเว็บ เช่น ฟอร์มหรือรูปปก |

**Repository นี้ไม่มีตัว Backend หรือข้อมูลหนังสือรวมมาด้วย** ต้อง clone Backend อีก repository หรือสร้างใหม่ตามตัวอย่าง ไม่จำเป็นต้องวางสองโฟลเดอร์ข้างกันเพื่อให้ API ทำงาน แต่คำสั่ง `cd ../...` ในคู่มือสมมติว่าวางข้างกัน

เวอร์ชัน Frontend ใน `package.json`: Next.js `16.4.2`, React `19.3.0` ส่วน Backend ที่ตรวจเป็น NestJS 11 และ Prisma 6 ตัวอย่าง Prisma ด้านล่างใช้รูปแบบ **Prisma 6 ของ Backend เดิม** อย่าอัปเกรดข้ามรุ่นโดยไม่ตรวจวิธีย้ายเวอร์ชัน

## 2. เตรียมเครื่อง

ติดตั้งบน **ทุกเครื่อง** ที่จะใช้ทำงาน:

1. [Node.js](https://nodejs.org/) ซึ่งมี npm มาด้วย ใช้ Node รุ่นเดียวกันระหว่างเครื่องเพื่อลดความต่าง (Next.js ในโปรเจกต์ต้องการอย่างน้อย Node 20.9)
2. [Git](https://git-scm.com/downloads) สำหรับดึงและส่งโค้ด
3. [VS Code](https://code.visualstudio.com/) สำหรับเปิดโฟลเดอร์และแก้ไฟล์

หลังติดตั้งปิดแล้วเปิด VS Code ใหม่ เลือก **File → Open Folder** เปิดโปรเจกต์ แล้ว **Terminal → New Terminal**

คู่มือนี้ใช้ **PowerShell บน Windows** เครื่องแล็ปที่ไม่บล็อกใช้ `npm` / `npx` ตามปกติได้เลย ไม่ต้องเปลี่ยนการตั้งค่าเครื่อง ตัวอย่างยาวบางส่วนเขียน `npm.cmd` / `npx.cmd` เพื่อให้ใช้ได้ทั้ง Windows ที่บล็อกและไม่บล็อก ทั้งสองแบบเรียกเครื่องมือเดียวกัน ไม่ต้องติดตั้งเพิ่ม ส่วน macOS/Linux ใช้ `npm` / `npx` และเปลี่ยนคำสั่งจัดการไฟล์ให้ตรงระบบ

### เครื่องแล็ปที่ไม่บล็อก: ใช้คำสั่งปกติได้เลย

ตรวจเครื่อง:

```powershell
node --version
npm --version
git --version
```

หลัง clone แล้ว เปิด Terminal ใน **โฟลเดอร์ Backend**:

```powershell
npm ci
npm run prisma:generate
npm run prisma:push
npm run start:dev
```

ปล่อย Backend เปิดไว้ แล้วเปิดอีก Terminal ใน **โฟลเดอร์ Frontend** (คัดลอก env เฉพาะครั้งแรกที่ยังไม่มีไฟล์):

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

เปิด `http://localhost:3001/books` ตรวจงานด้วย `npm run lint` และ `npm run build` ถ้าใช้ Command Prompt แทน PowerShell ให้เปลี่ยนคำสั่งคัดลอกเป็น `copy .env.example .env.local` ส่วน macOS/Linux ใช้ `cp .env.example .env.local`

| เครื่องแล็ปไม่บล็อก | Windows ที่ PowerShell บล็อก |
| --- | --- |
| `npm ci` | `npm.cmd ci` |
| `npm install` | `npm.cmd install` |
| `npm run dev` | `npm.cmd run dev` |
| `npm run start:dev` | `npm.cmd run start:dev` |
| `npm run build` | `npm.cmd run build` |
| `npm start` | `npm.cmd start` |
| `npx prisma studio` | `npx.cmd prisma studio` |

**ตัวอย่างถัดไปทุกจุดที่เห็น `npm.cmd` / `npx.cmd` เครื่องแล็ปเปลี่ยนเป็น `npm` / `npx` ได้ทั้งหมด** ถ้ารันคำสั่งปกติได้อยู่แล้ว ไม่ต้องแก้ execution policy และไม่ต้องเปิดแบบ Administrator หากเครื่องแล็ปไม่ให้ติดตั้ง Node/Git ให้ใช้เครื่องมือที่แล็ปเตรียมไว้หรือขอผู้ดูแลติดตั้ง

### ถ้าเครื่องไหนบล็อก npm.ps1

ลองคำสั่งต่อไปนี้แทน ไม่ต้องเปลี่ยนนโยบายความปลอดภัยของเครื่อง:

```powershell
node --version
npm.cmd --version
git --version
```

ทั้งสามคำสั่งต้องแสดงเวอร์ชัน ถ้า `not recognized` ให้ตรวจการติดตั้งและเปิด Terminal ใหม่

**วิธีอ่านคำสั่ง:** คัดลอกเฉพาะในกรอบ รันทีละบรรทัด รอให้สำเร็จก่อน คำว่า `YOUR_...` ต้องแทนด้วยค่าของคุณ ไม่พิมพ์ตามตัวอย่างตรง ๆ Terminal ที่กำลังรันเซิร์ฟเวอร์ต้องปล่อยไว้ ถ้าจะใช้คำสั่งอื่นให้เปิด Terminal ใหม่ หรือกด `Ctrl+C` หยุดก่อน

ตรวจว่าอยู่โฟลเดอร์ถูกต้อง:

```powershell
Get-Location
Get-ChildItem
Get-Content package.json
```

ต้องเห็น `package.json` ของฝั่งที่จะรัน ถ้าพาธมีช่องว่าง/ภาษาไทยให้ใส่เครื่องหมายคำพูด เช่น `cd "D:\Projects\my frontend"`

## 3. ดึงจาก Git และไฟล์ที่ไม่ได้ตามมา

### ครั้งแรกบนเครื่องนั้น

สร้างโฟลเดอร์เก็บงาน เปิด Terminal ที่โฟลเดอร์นั้น ใช้ URL จาก **Code → HTTPS** บน GitHub ของแต่ละ repository:

```powershell
git clone https://github.com/YOUR_ACCOUNT/YOUR_BACKEND_REPO.git crudbookwithprisma-67160284
git clone https://github.com/YOUR_ACCOUNT/YOUR_FRONTEND_REPO.git crudbookwithprisma-67160284-frontend
```

แทนบัญชีและชื่อ repo ก่อน ถ้าเป็น repo ส่วนตัวให้ลงชื่อเข้าใช้บัญชีที่มีสิทธิ์ จะได้:

```text
โฟลเดอร์เก็บงาน/
├── crudbookwithprisma-67160284/           ← Backend
└── crudbookwithprisma-67160284-frontend/  ← Frontend นี้
```

Download ZIP จะไม่มีประวัติ Git จึงใช้ `git pull` ไม่ได้ ถ้าจะทำข้ามเครื่องให้ใช้ clone

### ทำไมบางไฟล์หาย? ต้องลงอะไรเพิ่ม?

`.gitignore` ตั้งใจไม่เก็บไฟล์ที่สร้างใหม่ได้หรือมีข้อมูลส่วนตัว:

| ไฟล์/โฟลเดอร์ | อยู่ฝั่ง | วิธีได้กลับมาบนเครื่องใหม่ |
| --- | --- | --- |
| `node_modules/` | ทั้งคู่ | `npm.cmd ci` แยกแต่ละโฟลเดอร์ |
| `.next/` | Frontend | `npm.cmd run dev` หรือ `npm.cmd run build` |
| `next-env.d.ts` | Frontend | Next.js สร้างตอน dev/build/typegen |
| `.env.local` | Frontend | คัดลอกจาก `.env.example` แล้วแก้ค่าตามเครื่อง |
| `.env` ถ้าเพิ่มภายหลัง | Backend | สร้างค่าต่อ DB/ค่าลับบนเครื่องนั้น |
| Prisma Client ที่ generate | Backend | `npm.cmd run prisma:generate` |
| `prisma/dev.db` | Backend | สร้าง DB ว่างด้วย `prisma:push` หรือกู้สำรอง DB เดิม |
| `uploads/` | Backend | สร้างตอนอัปโหลดครั้งแรก รูปเก่าต้องคัดลอกสำรองเอง |
| `dist/` | Backend | `npm.cmd run build` ใน Backend |

**`npm install` ติดตั้งไลบรารี ไม่ได้กู้ข้อมูลหนังสือหรือรูปเก่า** อ่านข้อ 13 ถ้าต้องย้ายข้อมูลด้วย

ควรเก็บใน Git: `app/` ทั้งหมด (รวม `app/books/`), `public/`, `docs/`, `package.json`, **`package-lock.json`**, config, `.gitignore`, `.env.example`, `README.md`, `AGENTS.md` ส่วน Backend ต้องมี `src/`, `prisma/schema.prisma` และ migrations ถ้ามี

## 4. ติดตั้งและรัน Backend

เริ่มจากโฟลเดอร์เก็บงาน:

```powershell
cd crudbookwithprisma-67160284
npm.cmd ci
npm.cmd run prisma:generate
npm.cmd run prisma:push
npm.cmd run start:dev
```

ถ้าเปิด Backend อยู่แล้วไม่ต้อง `cd` ซ้ำ ถ้าเริ่มจาก Frontend ใช้ `cd ../crudbookwithprisma-67160284`

- `ci` ติดตั้งตาม `package-lock.json` เหมาะกับการดึงจาก Git
- `prisma:generate` สร้างตัวเชื่อม DB ที่โค้ดต้องใช้
- `prisma:push` สร้าง/ปรับตารางตาม schema เหมาะกับฐานพัฒนา ถ้าแก้ schema ของ DB ที่มีข้อมูลให้สำรองก่อน เพราะอาจกระทบข้อมูล
- `start:dev` เปิด Backend และดูการแก้โค้ด ปล่อย Terminal นี้เปิดไว้

Backend เดิมระบุ `url = "file:./dev.db"` ตรง ๆ ใน `prisma/schema.prisma` จึง **ยังไม่ต้องสร้าง DATABASE_URL หรือติดตั้ง MySQL** ไฟล์ DB อยู่ `prisma/dev.db`

เปิด [http://localhost:3000/books](http://localhost:3000/books) ควรได้ `[]` เมื่อข้อมูลว่าง หรือรายการ JSON ถ้ามีข้อมูลแล้ว หรือใช้ Terminal ใหม่:

```powershell
Invoke-RestMethod http://localhost:3000/books | ConvertTo-Json -Depth 10
```

ได้ `[]` คือ API ทำงานแต่ยังไม่มีข้อมูล ไม่ใช่ข้อผิดพลาด หน้า `/` ของ Backend ไม่ใช่หน้าเว็บจัดการหนังสือ

ถ้าไม่มี lockfile ใช้ `npm.cmd install` แทน `ci` แล้วเก็บ lockfile ลง Git ถ้า `ci` บอก lockfile ไม่ตรง package.json ให้ผู้แก้ dependencies รัน `npm.cmd install` ตรวจงาน และส่ง **ทั้งสองไฟล์** ขึ้น Git

## 5. ติดตั้งและรัน Frontend

เปิด **อีก Terminal** ที่โฟลเดอร์เก็บงาน โดยปล่อย Backend รันอยู่:

```powershell
cd crudbookwithprisma-67160284-frontend
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

ถ้าเริ่มใน Backend ใช้ `cd ../crudbookwithprisma-67160284-frontend` ถ้าอยู่ Frontend แล้วข้าม `cd`

**คัดลอก env เฉพาะเมื่อยังไม่มี `.env.local`** เพราะคัดลอกซ้ำจะทับค่าที่ตั้งไว้ เปิดไฟล์แล้วตรวจ:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

ไฟล์ต้องอยู่ระดับเดียวกับ `package.json` ชื่อเป็น `.env.local` ไม่ใช่ `.env.local.txt` ไม่ต้องติดตั้ง dotenv เพิ่มใน Frontend

เปิด [http://localhost:3001/books](http://localhost:3001/books) หรือ [http://localhost:3001](http://localhost:3001) ซึ่งส่งต่อมาหน้าหนังสือ ลองเพิ่มหนึ่งเล่ม ดูรายละเอียด แก้ชื่อ เพิ่มรีวิว แล้วรีเฟรช ถ้าข้อมูลยังอยู่แสดงว่าต่อ DB ได้ จากนั้นลองลบรายการทดลอง (Backend เดิมลบรีวิวที่เกี่ยวข้องด้วย)

หลังแก้ `.env.local` ให้หยุด Frontend ด้วย `Ctrl+C` แล้ว `npm.cmd run dev` ใหม่ ถ้า production ให้ build ใหม่ด้วย เพราะค่า **`NEXT_PUBLIC_` ถูกฝังตอน build และผู้ใช้เว็บอ่านได้ ห้ามใส่รหัสผ่าน DB หรือ secret**

## 6. คำสั่งที่ใช้บ่อย

### Frontend — รันในโฟลเดอร์ Frontend

| คำสั่ง | ใช้เมื่อไร |
| --- | --- |
| `npm.cmd ci` | ติดตั้งตาม lockfile เมื่อ clone/pull dependencies ใหม่ ติดตั้งทับ node_modules เดิม |
| `npm.cmd install` | ปรับ dependencies/lockfile ให้สอดคล้องเมื่อแก้แพ็กเกจ |
| `npm.cmd run dev` | พัฒนาหน้าเว็บพอร์ต **3001** |
| `npm.cmd run lint` | ตรวจด้วย ESLint |
| `npm.cmd run build` | ตรวจและสร้างเวอร์ชันพร้อมใช้จริง |
| `npm.cmd start` | เปิด build ที่พอร์ต **3001** ต้อง build ผ่านก่อน |
| `npx.cmd next typegen` | สร้าง route types ของ Next.js |
| `npx.cmd tsc --noEmit` | ตรวจ TypeScript หลังสร้าง route types แล้ว |
| `npm.cmd install PACKAGE_NAME` | เพิ่มไลบรารี แทนชื่อแพ็กเกจก่อน |
| `npm.cmd install -D PACKAGE_NAME` | เพิ่มเครื่องมือพัฒนา |
| `npm.cmd uninstall PACKAGE_NAME` | ถอนแพ็กเกจ |
| `Ctrl+C` | หยุดเซิร์ฟเวอร์ใน Terminal นั้น |

Scripts จริงคือ `dev: next dev --port 3001`, `build: next build`, `start: next start --port 3001`, `lint: eslint` จึงใช้ **`npm run dev` ไม่ใช่ `npm dev`**

### Backend เดิม — รันในโฟลเดอร์ Backend

| คำสั่ง | ใช้ทำอะไร |
| --- | --- |
| `npm.cmd ci` | ติดตั้ง dependencies |
| `npm.cmd run prisma:generate` | สร้าง Prisma Client หลังติดตั้ง/เปลี่ยน schema |
| `npm.cmd run prisma:push` | ปรับ DB พัฒนาตาม schema โดยไม่สร้าง migration |
| `npx.cmd prisma studio` | เปิดเครื่องมือดู/แก้ข้อมูล DB |
| `npm.cmd run start:dev` | พัฒนาที่พอร์ต 3000 |
| `npm.cmd run build` | สร้างไฟล์ใน dist |
| `npm.cmd run start:prod` | เปิด Backend ที่ build แล้ว |
| `npm.cmd test` | รัน unit tests |

ไม่ต้องลง Next.js, React, Nest CLI หรือ Prisma แบบ global เพื่อเปิดงานเดิม npm ci ติดตั้งเครื่องมือของโปรเจกต์ให้แล้ว

## 7. แก้หน้าเว็บตรงไหน

```text
Frontend/
├── app/
│   ├── layout.tsx                 HTML, ภาษา, metadata, ฟอนต์
│   ├── page.tsx                   หน้า / ส่งต่อไป /books
│   ├── globals.css                สี ระยะห่าง ตาราง ฟอร์ม จอมือถือ
│   ├── favicon.ico                ไอคอนแท็บ
│   └── books/
│       ├── layout.tsx             หัวและท้ายเว็บของ /books ทั้งหมด
│       ├── page.tsx               จุดเข้าหน้า /books เรียก BooksPage
│       ├── books-page.tsx         ตาราง ค้นหา กรอง ปุ่มเพิ่ม/แก้/ลบ
│       ├── book-form.tsx          ฟอร์มเพิ่มและแก้ไข
│       ├── book-api.ts            ชนิดข้อมูล URL และคำสั่งเรียก API
│       ├── book-cover.tsx         รูปปก/รูปสำรอง
│       ├── book-detail-page.tsx   รายละเอียด รีวิว แก้/ลบจากหน้ารายละเอียด
│       └── [id]/page.tsx          จุดเข้าหน้า /books/1, /books/2 ฯลฯ
├── public/                        รูปคงที่ เช่น logo.png เรียกด้วย /logo.png
├── docs/                          ตัวอย่างดัดแปลง
├── .env.example                   ตัวอย่างตั้งค่า เก็บ Git ได้
├── .env.local                     ค่าจริงเฉพาะเครื่อง ไม่เก็บ Git
├── package.json                   dependencies และ scripts
├── package-lock.json              ล็อกเวอร์ชัน ต้องส่ง Git
├── next.config.ts                 ตั้งค่า Next.js/Turbopack
├── tsconfig.json                  ตั้ง TypeScript และ alias @/
├── eslint.config.mjs              กฎตรวจโค้ด
└── .gitignore                     สิ่งที่ Git ไม่ต้องเก็บ
```

| อยากแก้อะไร | เปิดไฟล์และหาจุดนี้ |
| --- | --- |
| ชื่อบนแท็บเว็บ | `app/layout.tsx` → `metadata.title`, `description` |
| ชื่อแบรนด์/หัวท้ายเว็บ | `app/books/layout.tsx` → `brand-name`, `header-note`, `site-footer` |
| หัวข้อ “คลังหนังสือ” | `app/books/books-page.tsx` → `<h1>` และย่อหน้าข้างใต้ |
| ปุ่มเพิ่ม | `books-page.tsx` → ปุ่มเรียก `openCreateForm` |
| คอลัมน์ตาราง | `books-page.tsx` → `<thead>` และ `<tbody>` แก้คู่กัน |
| ค้นหาฟิลด์อื่น | `books-page.tsx` → `filteredBooks`, `matchesQuery` |
| ตัวกรอง | `books-page.tsx` → `availability`, `matchesAvailability`, `<select>` |
| เพิ่มช่อง/บังคับกรอก | `book-form.tsx` → `useState`, `handleSubmit`, `<input>` |
| หน้ารายละเอียด/รีวิว | `book-detail-page.tsx` → `detail-main`, `reviews-section` |
| ชนิด/ขนาดรูป | `book-form.tsx` → `ALLOWED_IMAGE_TYPES`, `MAX_IMAGE_SIZE`, `accept` และแก้ Backend ด้วย |
| สีหลัก | `globals.css` → `:root` เช่น `--purple`, `--background` |
| ปุ่มและ hover | `globals.css` → `.button-primary` / `:hover` |
| ความกว้าง/มือถือ | `globals.css` → `.page-shell`, `.book-table`, `.table-scroll`, `@media` |
| หน้าแรก | `app/page.tsx` → `redirect("/books")` หรือแทนด้วยหน้าเมนู |
| URL Backend | `.env.local` → `NEXT_PUBLIC_API_URL` |

ตัวอย่างเปลี่ยนธีม: เปลี่ยนตัวแปรเดิมใน `globals.css` เป็น `--purple: #2563eb;`, `--purple-dark: #1d4ed8;`, `--purple-light: #eff6ff;` แล้วบันทึก ส่วนสีที่เขียน `rgba(...)` ตรง ๆ ต้องค้นแล้วแก้เพิ่มหากต้องการ

กด `Ctrl+Shift+F` ใน VS Code ค้นทั้งโปรเจกต์ เช่น `คลังหนังสือ` หรือ `/books`; `Ctrl+F` ค้นเฉพาะไฟล์ เปลี่ยนข้อความผู้ใช้เห็นได้ แต่ **ชื่อฟิลด์/ฟังก์ชันต้องเปลี่ยนทุกจุดที่อ้างถึง**

`page.tsx` เป็นจุดทำให้ URL มีจริง ส่วน `books-page.tsx` เป็น component ที่แยกมา ดังนั้นแก้หน้า `/books` ส่วนใหญ่ต้องแก้ `books-page.tsx` อย่าลบ `"use client"` ในไฟล์ที่ใช้ปุ่ม, state, effect หรือ window ส่วน route `[id]` รุ่นนี้รับ `params` เป็น Promise และโค้ดเดิมอ่านภายใน Suspense ให้ทำตามรูปแบบเดิมเมื่อคัดลอกหน้า

## 8. เชื่อมและเปลี่ยน Backend

### ข้อมูลเดินทางอย่างไร

```text
เปิดรายการ → BooksPage → getBooks() → GET /books → setBooks() → ตาราง
บันทึก → BookForm.handleSubmit → onSave → handleSave → saveBook()
       → POST หรือ PATCH → Backend/DB → object ที่บันทึกแล้ว → ปรับตาราง
ลบ → ยืนยัน → deleteBook() → DELETE /books/:id → เอาแถวออกจากหน้าจอ
```

จุดรวมการเชื่อมต่อคือ [`app/books/book-api.ts`](app/books/book-api.ts) ฟังก์ชัน `apiRequest()` ต่อ URL, เรียก fetch, อ่านผล และโยน error เมื่อ HTTP ไม่สำเร็จ เว็บนี้เรียก Backend **จากเบราว์เซอร์โดยตรง** จึงต้องตั้ง CORS ใน Backend

### สัญญา API ที่หน้าเว็บเดิมต้องการ

| งาน | Method | Path | ส่งอะไร | ผลเมื่อสำเร็จ |
| --- | --- | --- | --- | --- |
| รายการ | GET | `/books` | ไม่มี body | array หนังสือ `[...]` |
| รายละเอียด | GET | `/books/:id` | ไม่มี body | object หนังสือหนึ่งเล่ม |
| เพิ่ม | POST | `/books` | FormData | object หนังสือที่มี id |
| แก้ | PATCH | `/books/:id` | FormData | object หนังสือหลังแก้ที่มี id |
| ลบ | DELETE | `/books/:id` | ไม่มี body | เดิมตอบ `{ "message": "..." }` |
| เพิ่มรีวิว | POST | `/books/:id/reviews` | JSON rating, content | object รีวิว id, bookId, rating, content |

Backend เดิมมี `GET /books/:id/reviews` ด้วย แต่หน้าเว็บอ่านรีวิวที่แนบใน object หนังสือ ไม่ได้เรียก endpoint นี้แยก

ตัวอย่างผลหนังสือ:

```json
{
  "id": 1,
  "title": "หนังสือตัวอย่าง",
  "author": "ผู้เขียน",
  "publishedYear": 2026,
  "publishedAt": "2026-01-01T00:00:00.000Z",
  "isAvailable": true,
  "coverUrl": "/uploads/example.jpg",
  "reviews": []
}
```

`id`, `publishedYear`, `rating` เป็นตัวเลข; `isAvailable` เป็น boolean จริง ไม่ใช่ข้อความ `"false"` ซึ่งเข้าเงื่อนไขเป็นค่าจริงใน JavaScript; `reviews` เป็น array; `coverUrl` เป็น URL หรือ null

ช่อง `publishedYear` ไม่แปลง พ.ศ./ค.ศ. อัตโนมัติ ให้ใช้แบบเดียวกันทั้งระบบ ส่วน `publishedAt` แสดงวันที่ตามรูปแบบไทยผ่าน `formatBookDate()`

### เปลี่ยน URL/พอร์ต

สมมติ Backend ย้ายเป็น `http://localhost:4000`:

1. `.env.local` เปลี่ยนเป็น `NEXT_PUBLIC_API_URL=http://localhost:4000`
2. ตั้ง Backend ให้ใช้พอร์ตนั้น ใน PowerShell ใช้ `$env:PORT="4000"` แล้ว `npm.cmd run start:dev` (มีผลเฉพาะ Terminal นั้น)
3. Backend `src/main.ts` ต้องอนุญาต origin ของ Frontend เช่น `http://localhost:3001`
4. restart ทั้งสองฝั่ง ทดสอบ `http://localhost:4000/books` ก่อนทดสอบเว็บ

ถ้ามี prefix `/api` ตั้งฐานเป็น `http://localhost:4000/api` และ path ใน `book-api.ts` เป็น `/books` จะได้ `/api/books` ตรวจไม่ให้ prefix ซ้ำ และตรวจ `coverImageUrl()` ด้วย: รูป `/uploads/...` อ้างจากรากโดเมน แต่รูปสัมพัทธ์ที่ไม่ขึ้นต้น `/` จะอ้าง path ของฐาน URL

### ถ้า Backend เปลี่ยนรูปแบบ

| สิ่งที่เปลี่ยน | จุดแก้ Frontend |
| --- | --- |
| `/books` → `/products` | paths ในไฟล์ API; routes และลิงก์เมื่อเปลี่ยน URL หน้าเว็บด้วย |
| PATCH → PUT | method ในฟังก์ชันบันทึก โดย PUT อาจต้องส่งข้อมูลครบ |
| ผลเป็น `{ data: [...] }` | ฟังก์ชันรับผลต้องดึง `.data` ก่อนส่งให้หน้าเว็บ |
| `title` → `name` | type, ฟอร์ม, payload, ตาราง, รายละเอียด, ค้นหา |
| ID เป็น UUID/string | type id, พารามิเตอร์ฟังก์ชัน และเลิกตรวจว่าเป็นเลขใน `book-detail-page.tsx` |
| รับ JSON ไม่มีรูป | saveBook และเอาช่องอัปโหลดออก |
| เพิ่มล็อกอิน | ส่ง token/cookie ตามสัญญา API และจัดการสถานะล็อกอิน |

ตัวอย่าง **แทนที่** getBooks เมื่อ API ห่อด้วย data:

```ts
export async function getBooks(): Promise<Book[]> {
  const result = await apiRequest<{ data: Book[] }>("/books");
  return result.data;
}
```

ตัวอย่าง **แทนที่** saveBook ภายใน `book-api.ts` เมื่อ Backend ใหม่รับ JSON ไม่มีอัปโหลด:

```ts
export function saveBook(values: BookFormValues, id?: number): Promise<Book> {
  return apiRequest<Book>(id !== undefined ? `/books/${id}` : "/books", {
    method: id !== undefined ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: values.title.trim(),
      author: values.author.trim(),
      publishedYear: values.publishedYear.trim()
        ? Number(values.publishedYear)
        : null,
      ...(values.publishedAt ? { publishedAt: values.publishedAt } : {}),
      isAvailable: values.isAvailable,
    }),
  });
}
```

ตัวอย่างสมมติ Backend ยอมรับ `publishedYear: null` และใช้ค่าเริ่มต้นเมื่อไม่ส่งวันที่ ต้องปรับ Backend ให้ตรงกัน และเอา cover/preview ออกจากฟอร์ม ไม่ให้ผู้ใช้เลือกรูปที่ไม่ถูกส่ง

**ใช้ FormData เดิมอย่าตั้ง Content-Type เอง** เบราว์เซอร์ต้องสร้าง multipart boundary ให้ และ Backend ต้องแปลงข้อความ `"true"`, `"123"` เป็น boolean/number ก่อนบันทึก

## 9. เพิ่มฟิลด์หรือเปลี่ยนระบบ

### เพิ่ม “หมวดหมู่” (`category`) ให้หนังสือ

เริ่มแบบไม่บังคับเพื่อให้ข้อมูลเก่ายังใช้ได้:

1. **Backend** `prisma/schema.prisma` เพิ่ม `category String?` ใน model Book
2. **Backend** `src/book/dto/create-book.dto.ts` เพิ่ม `category?: string;` ส่วน UpdateBookDto เดิมสืบทอดด้วย PartialType แล้ว service เดิมส่ง DTO ทั้งก้อนให้ Prisma
3. สำรอง DB แล้วใน Backend รัน `npm.cmd run prisma:generate`, `npm.cmd run prisma:push` และ restart
4. **Frontend** `book-api.ts` เพิ่ม `category?: string | null;` ใน Book และ `category: string;` ใน BookFormValues
5. **Frontend** `book-form.tsx` เพิ่ม state ภายใน BookForm: `const [category, setCategory] = useState(book?.category ?? "");`
6. เพิ่มใน `<div className="form-grid">`:

   ```tsx
   <label className="form-field form-field-wide">
     <span className="field-label">หมวดหมู่</span>
     <input
       value={category}
       onChange={(event) => setCategory(event.target.value)}
       disabled={saving}
     />
   </label>
   ```

7. เพิ่ม `category,` ใน object ที่ส่งเข้า `await onSave({ ... })` พร้อมฟิลด์เดิม
8. `book-api.ts` ใน saveBook หลังสร้าง FormData เพิ่ม `formData.append("category", values.category.trim());` ส่งแม้ว่างเพื่อให้ล้างค่าเดิมได้
9. `books-page.tsx` เพิ่ม `<th>หมวดหมู่</th>` กับ `<td>{book.category || "—"}</td>` ตำแหน่งตรงกัน ถ้าต้องการค้นหมวดหมู่เพิ่ม `${book.category ?? ""}` ในข้อความ matchesQuery
10. `book-detail-page.tsx` ในรายละเอียดเพิ่ม `<p>หมวดหมู่: {book.category || "—"}</p>`
11. ลองเพิ่ม แก้ ล้างค่า รีเฟรช และเปิดข้อมูลเก่าที่ไม่มีหมวดหมู่ จากนั้น lint/build

ต้องครบ **DB → Backend → type → state → input → payload → การแสดงผล** เพิ่ม type อย่างเดียวไม่สร้างตาราง และเพิ่ม input อย่างเดียวไม่ส่งข้อมูล

### เปลี่ยนทั้งระบบ เช่น หนังสือ → นักเรียน

1. สร้าง branch ก่อน: `git switch -c feature/student-crud`
2. เขียนฟิลด์ใหม่และชนิด เช่น name, studentCode, classroom, isActive
3. ทำ Backend `/students` และทดสอบ API ก่อน ใช้ Controller/Service/DTO/Prisma เดิมเป็นตัวอย่าง
4. จะเก็บ URL `/books` ชั่วคราวหรือสร้าง `app/students/` ใหม่ก็ได้ วิธีคัดลอกดูคู่มือ CRUD ชุดที่สอง
5. ปรับ type, state, input, validation, payload, ตาราง, ค้นหา/กรอง และรายละเอียดให้ใช้ฟิลด์ใหม่
6. ปรับลิงก์ `/books`, redirect ใน `app/page.tsx`, แบรนด์ และ metadata
7. ไม่ใช้รีวิว: เอา type/import ของ Review, คำนวณคะแนน, คอลัมน์รีวิว, state/handler/JSX รีวิวออกด้วย ไม่ใช่ซ่อนหัวข้ออย่างเดียว
8. ไม่ใช้รูป: เอา file state/input/preview/BookCover และเปลี่ยน FormData เป็น JSON ทั้งสองฝั่ง
9. ทดสอบก่อนลบโค้ดเก่า และสำรอง DB ก่อนเปลี่ยนชื่อ/ลบ model

การ rename model/table อาจถูกมองเป็นลบตารางแล้วสร้างใหม่ ต้องมีแผนย้ายข้อมูล ไม่ใช้ `db push --accept-data-loss` ข้ามคำเตือนกับข้อมูลที่ต้องเก็บ

### กรณีอื่นที่ควรรู้

- **ลบช่อง:** เอาออกจาก input, state, validation, onSave, type, payload, ตาราง/รายละเอียด/ค้นหา และ DTO/schema เมื่อพร้อมลบข้อมูลจริง
- **เพิ่มช่องบังคับ:** ข้อมูลเก่าต้องมีค่า เริ่มเป็น optional/default แล้วเติมข้อมูลก่อนปรับ required
- **ล้างช่องว่าง:** เดิม saveBook ไม่ส่ง publishedYear/publishedAt เมื่อว่าง ตอน PATCH จึงไม่เปลี่ยนค่าเก่า ถ้าจะล้างต้องกำหนดสัญญา null และปรับ Backend/schema ให้รับได้
- **ตัวเลข/วันที่:** input ให้ string ตรวจค่าว่างก่อน Number เพราะ `Number("")` ได้ 0 ส่วนวันที่ input เป็น YYYY-MM-DD ให้กำหนดการแปลงและเขตเวลาให้ตรงความต้องการ

## 10. เพิ่ม CRUD ชุดที่สอง

ระบบ “หนังสือ + สินค้า” ต้องเพิ่ม **API `/products` และหน้า `/products`** โดยยังเก็บ `/books` ไว้ ทำตาม [คู่มือเพิ่ม CRUD สินค้าครบชุด](docs/add-second-crud.md) มี schema, Controller, Service, Module และหน้าเว็บเพิ่ม/ดู/แก้/ลบได้จริง พร้อมเมนูและแนวทางเพิ่มรายละเอียด

`app/books/layout.tsx` ใช้เฉพาะ URL ใต้ `/books` การสร้าง `app/products/page.tsx` เฉย ๆ ไม่ได้ header/footer ของหนังสืออัตโนมัติ ตัวอย่างมีวิธีใช้ layout ร่วมให้ด้วย

## 11. เปลี่ยนฐานข้อมูล

Frontend ไม่ต้องรู้ว่าใช้ SQLite/MySQL/PostgreSQL ถ้า API ยังตอบรูปเดิม การเปลี่ยน DB ทำใน **Backend** ไม่ต้องติดตั้ง Prisma ใน Frontend และห้ามเชื่อม DB จาก component ที่มี `"use client"`

### SQLite เดิม แต่เปลี่ยนไฟล์

Backend `prisma/schema.prisma` เปลี่ยน `url = "file:./dev.db"` เป็น `url = "file:./school.db"` แล้วรัน:

```powershell
npm.cmd run prisma:generate
npm.cmd run prisma:push
npm.cmd run start:dev
```

จะสร้าง `prisma/school.db` ใหม่ **ไม่ย้ายข้อมูลอัตโนมัติ** เพิ่มไฟล์ DB ใหม่และ journal/WAL ของมันใน `.gitignore` Backend ด้วย เพราะเดิม ignore เฉพาะ dev.db และไฟล์ประกอบ

### ตัวอย่าง PostgreSQL (Prisma 6 ของ Backend เดิม)

1. สำรอง DB/รูป ถ้าต้องเก็บข้อมูลให้วางแผน export/import แยก
2. เตรียม PostgreSQL server, database และ user ที่มีสิทธิ์ให้พร้อม อาจใช้บริการ DB ที่มีอยู่ `npm install` ไม่ได้ติดตั้ง DB server ให้
3. เปลี่ยนบล็อก datasource ใน Backend `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. สร้าง `.env` ที่ราก **Backend** ระดับเดียวกับ package.json:

   ```dotenv
   DATABASE_URL="postgresql://APP_USER:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE?schema=public"
   ```

   แทน user/password/database ถ้ารหัสมีอักขระพิเศษให้ URL-encode ส่วนรหัสผ่าน ห้ามส่งค่าลับขึ้น Git หรือใช้ชื่อ NEXT_PUBLIC_DATABASE_URL

5. รันใน Backend สำหรับฐานพัฒนาใหม่:

   ```powershell
   npm.cmd run prisma:generate
   npm.cmd run prisma:push
   npm.cmd run start:dev
   ```

6. ทดสอบรายการ/เพิ่ม/แก้/ลบ/รีวิว/รูป ข้อมูล SQLite ยังอยู่ไฟล์เก่า ไม่ตามไป PostgreSQL

MySQL ใช้ `provider = "mysql"` และ URL `mysql://APP_USER:YOUR_PASSWORD@localhost:3306/YOUR_DATABASE` ต้องเตรียม server/database/user ก่อนเช่นกัน

### เมื่อเริ่มใช้ migrations

- สำหรับ DB พัฒนาใหม่ที่เริ่มใช้ migrations: `npx.cmd prisma migrate dev --name init` แล้วส่ง `prisma/migrations/` ขึ้น Git
- เครื่องอื่น/ระบบจริงที่มี migrations แล้ว: `npx.cmd prisma migrate deploy` แล้ว `npm.cmd run prisma:generate`
- DB ที่มีข้อมูลจาก db push อยู่แล้วต้องทำ baseline ก่อน ไม่ตอบตกลง reset ทันทีเมื่อเครื่องมือถาม
- migrations SQLite ใช้ข้าม provider ไป PostgreSQL/MySQL ตรง ๆ ไม่ได้ ต้องเตรียมชุดเริ่มต้นสำหรับ DB ใหม่และย้ายข้อมูลแยก
- MongoDB ไม่ใช่เปลี่ยน URL อย่างเดียว ต้องปรับ ID, relation และ schema รวมถึง type หน้าเว็บตามจริง

`prisma migrate reset`, การลบ DB และ `--accept-data-loss` ไม่ใช่คำสั่งซ่อมทั่วไป อย่าใช้กับข้อมูลที่ต้องเก็บ

## 12. ใช้ JavaScript เป็น Backend

ทำได้ ภาษา Backend ไม่ต้องตรง Frontend ถ้า API ตรงตามข้อ 8 จะใช้ JavaScript + Express หรือภาษาอื่นก็ได้ NestJS เดิมก็รันเป็น JavaScript หลัง compile แต่ source เป็น TypeScript

ดู [ตัวอย่าง JavaScript + Express พร้อมติดตั้ง](docs/javascript-backend.md) ซึ่งใช้ JSON และเก็บ array ในหน่วยความจำ **ปิด/รีสตาร์ต Backend แล้วข้อมูลหาย และไม่รับไฟล์รูป** มีขั้นตอนปรับ Frontend ให้ตรงกัน ถ้าต้องการถาวรให้ต่อ DB แทน array

ไม่ต้องเปลี่ยน Frontend .tsx เป็น .jsx เพียงเพราะ Backend เป็น JavaScript และไม่ควร rename NestJS .ts เป็น .js เฉย ๆ เพราะ type, decorators และขั้นตอน build ต่างกัน

## 13. ทำงานข้ามเครื่องและสำรองข้อมูล

### ก่อนเลิกทำเครื่อง A

ทำแยก **ทั้งสอง repository** ถ้าแก้ทั้ง Frontend/Backend:

```powershell
git status
git diff
git add .
git diff --cached
git commit -m "Update CRUD base and guide"
git push
```

ตรวจ staged diff ก่อน commit ว่าไม่มีค่าลับ `git add .` รวมไฟล์ใหม่ untracked ด้วย สำคัญสำหรับ `app/books/` ที่เพิ่งสร้าง `.gitignore` ไม่ทำให้ไฟล์ที่เคย commit ไปแล้วหยุดถูกติดตาม ถ้าเคยส่ง secret ขึ้น Git ต้องเปลี่ยน secret และจัดการประวัติให้เหมาะสม

ถ้า Git ไม่รู้จักผู้ commit:

```powershell
git config --global user.name "YOUR_NAME"
git config --global user.email "YOUR_EMAIL"
```

ถ้ามี Git แล้วแต่ยังไม่มี remote ให้ตรวจ `git remote -v` และ `git branch --show-current` สร้าง repository ว่างบน GitHub แล้ว `git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPO.git` (ถ้ามี origin แล้วไม่ต้อง add ซ้ำ) จากนั้น `git push -u origin YOUR_BRANCH` โดยใช้ URL/branch จริง clone มี remote ให้อยู่แล้ว

### เริ่มทำเครื่อง B ที่เคย clone

```powershell
git status
git pull --ff-only
npm.cmd ci
```

ถ้ามีงานค้างให้ commit/เก็บงานก่อน pull อย่า `git reset --hard` เพื่อแก้แบบไม่อ่าน `--ff-only` หยุดเมื่อประวัติแยกกัน ให้ตรวจความต่างและแก้ conflict ก่อนต่อ

- **Backend:** generate Prisma แล้วถ้า schema เปลี่ยนใช้แนวทาง DB ที่เลือก (push สำหรับพัฒนา หรือ migrate deploy เมื่อใช้ migrations แล้ว) ก่อน start:dev
- **Frontend:** ตรวจ/สร้าง .env.local แล้ว run dev
- ไม่ต้อง clone ซ้ำหรือสร้าง DB ใหม่ทุกครั้งที่รัน
- อย่าแก้ฟีเจอร์เดียวกันสองเครื่องโดยยังไม่ push/pull เพราะจะชนกันง่าย

### เอาข้อมูลและรูปเดิมไปด้วย

1. หยุด Backend และปิด Prisma Studio/โปรแกรมที่เปิด DB ก่อนสำรอง
2. สำรอง `prisma/dev.db` และ `uploads/` ใน Backend ไปพื้นที่ส่วนตัวที่ปลอดภัย ถ้ายังมี dev.db-wal ให้ใช้วิธี backup ของ SQLite หรือสำรองชุด DB/journal ให้สอดคล้องกัน ไม่คัดลอก DB อย่างเดียวขณะมีการเขียนอยู่
3. เครื่องใหม่ติดตั้งและ generate Prisma ให้เสร็จ หยุด Backend แล้ววาง DB ที่ `prisma/dev.db` และรูปใน `uploads/`
4. ตรวจ schema ให้ตรง DB สำรอง ถ้ามี schema ใหม่ให้สำรองอีกชุดและจัดการ migration ก่อนเปิด
5. เปิดระบบและตรวจข้อมูล/รูป

PostgreSQL/MySQL ใช้เครื่องมือ backup/restore ของ DB นั้น ไม่คัดลอก dev.db ถ้าใช้ DB กลางเดียวกัน สองเครื่องจะเห็นข้อมูลเดียวกันเมื่อมี credentials ถูกต้อง แต่รูปต้องอยู่ storage ที่เข้าถึงร่วมกันด้วย

**Git sync โค้ด ไม่ sync DB รูป และค่าลับให้อัตโนมัติ**

## 14. แก้ปัญหา

| อาการ | ตรวจ/แก้ |
| --- | --- |
| npm/node/git not recognized | ติดตั้งโปรแกรม แล้วเปิด Terminal/VS Code ใหม่ |
| npm.ps1 cannot be loaded | ใช้ npm.cmd / npx.cmd ไม่ต้องเปลี่ยน execution policy ทั้งเครื่อง |
| ENOENT package.json | อยู่ผิดโฟลเดอร์ ตรวจ Get-Location และ Get-ChildItem |
| Missing script: dev | อาจอยู่ Backend ซึ่งใช้ start:dev ตรวจ scripts ใน package.json |
| next is not recognized / โมดูลหาย | npm ci ใน Frontend และติดตั้ง Backend แยก |
| npm ci ติด lockfile | lockfile ต้องมีและตรง package.json ให้ผู้แก้ dependencies ใช้ npm install แล้วส่งทั้งคู่ |
| ติดตั้งติด network/proxy | ตรวจอินเทอร์เน็ตและ registry ของเครือข่าย ไม่ลบ lockfile/ปิด SSL เพื่อข้าม error |
| เปิด 3000 ไม่เห็นเว็บ | 3000 เป็น API เปิดเว็บ 3001/books |
| Failed to fetch / CONNECTION_REFUSED | Backend เปิดอยู่ไหม เปิด API /books ตรง ตรวจ env แล้ว restart Frontend |
| เปิด API ตรงได้ แต่เว็บ CORS | src/main.ts Backend ต้องอนุญาต protocol + hostname + port ตรงกับหน้าเว็บ แล้ว restart |
| localhost/127.0.0.1 สลับแล้ว CORS | เป็นคนละ origin ใช้ให้ตรงกันหรือกำหนด origin ที่ต้องใช้ใน Backend |
| 404 | ตรวจ path, prefix, method, ID; URL หน้าเว็บกับ URL API เป็นคนละส่วน |
| 400/422 | ดู response ใน Network ตรวจชื่อฟิลด์ ฟิลด์บังคับ และชนิดข้อมูล |
| 401/403 | ต้องล็อกอิน/ส่งสิทธิ์ตามระบบใหม่ |
| 500 | ดู Terminal Backend ตรวจ DB/Prisma/schema |
| books.filter is not a function | API ไม่ตอบ array เช่นห่อด้วย data ต้องแกะใน getBooks |
| บันทึกแล้ว savedBook ไม่มี id | API ต้องตอบ object ครบ ไม่ใช่ message อย่างเดียว หรือปรับหน้าเว็บให้โหลดใหม่ |
| Prisma Client not initialized | Backend npm ci → prisma:generate → restart |
| Table does not exist | ต่อ DB ผิดตัวหรือยังไม่สร้างตาราง ตรวจ URL/schema แล้ว push/migrate ตามแนวทาง |
| ข้อมูลเก่า/รูปหาย | restore DB/uploads จากสำรอง การ install ไม่กู้ข้อมูล |
| รูปไม่ขึ้น | เปิด URL รูปตรง ตรวจ coverUrl, API host, uploads และ static assets ของ Backend |
| รูป Unexpected field / 413 | ชื่อ field เป็น cover, รูปชนิดรองรับ, ไม่เกิน 5 MB และตรวจ proxy limit |
| ล้างช่องแล้วค่าเก่าอยู่ | PATCH เดิมไม่ส่ง optional ที่ว่าง อ่านข้อ 9 เรื่อง null |
| LayoutProps/route types หาย | run dev หรือ npx next typegen ก่อนตรวจ tsc |
| next start ไม่มี production build | หยุด dev แล้ว build ให้ผ่านก่อน start |
| build ติดดาวน์โหลด Google Fonts | app/layout.tsx ใช้ next/font/google ต้องมีเน็ตตอน build ถ้าต้อง offline ให้ใช้ฟอนต์ระบบและเอาการเรียก Geist/Geist_Mono กับ class ที่อ้างตัวแปรออก |
| อีกเครื่องไม่เห็นโค้ดใหม่ | ตรวจ branch, untracked, commit/push เครื่องต้นทาง และ pull ปลายทาง |
| ภาษาไทยแสดงผิด | ตรวจ encoding UTF-8 ของไฟล์/Terminal อย่าบันทึกทับเมื่อเพียง Terminal แสดงผิด |

### พอร์ตถูกใช้แล้ว (EADDRINUSE)

หยุด Terminal เก่าด้วย Ctrl+C ก่อน ตรวจพอร์ตด้วย:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000,3001
```

อย่าปิด process อื่นที่ยังไม่รู้จัก ถ้าต้องเปลี่ยน Frontend ชั่วคราวใช้ `npx.cmd next dev --port 3002` หรือแก้ `--port 3001` ใน scripts dev/start ของ package.json และ **แก้ CORS Backend ให้ตรง origin ใหม่** ถ้าเปลี่ยนพอร์ต Backend ให้แก้ .env.local Frontend ด้วย

### ล้าง cache Frontend

หยุด Frontend ก่อน ใช้ Get-Location ยืนยันว่าอยู่ราก Frontend แล้ว:

```powershell
Remove-Item -LiteralPath .next -Recurse -Force
npm.cmd run dev
```

ถ้าไม่มี .next ให้ข้าม ลบเฉพาะ cache ที่สร้างใหม่ได้ ไม่ลบ DB, uploads, lockfile หรือทั้งโปรเจกต์เพื่อแก้ทั่วไป

### อ่าน error ให้เจอจุด

กด F12 → Network ทำรายการที่ผิด คลิก request ดู URL, Method, Status, Payload/Form Data และ Response แล้วดู Console/Terminal สองฝั่งประกอบ ถ้าขอความช่วยเหลือให้ส่ง error และสิ่งที่ทำก่อนเกิดปัญหา โดยลบ password/token ก่อน

### เปิดจากมือถือ/เครื่องอื่น

ให้ dev server ฟังเครือข่าย เช่น `npx.cmd next dev --hostname 0.0.0.0 --port 3001` ตั้ง API URL เป็น IP เครื่อง Backend ที่อุปกรณ์นั้นเข้าถึงได้ อนุญาต origin จริงใน CORS และเปิด firewall เฉพาะที่จำเป็น `localhost` บนมือถือหมายถึงมือถือเอง

## 15. ตรวจงานก่อนส่ง

ใน Frontend:

```powershell
npm.cmd run lint
npm.cmd run build
```

หลัง build ลอง npm start โดยหยุด dev ที่ใช้พอร์ตเดียวกัน และให้ Backend รันอยู่ **build ผ่านไม่ได้ยืนยันว่า API/DB เชื่อมได้** ต้องทดสอบด้วย:

- clone ใหม่แล้วติดตั้งตามคู่มือได้
- เปิดรายการว่าง/มีข้อมูล ค้นหา/กรองได้
- เพิ่ม แก้ ยกเลิกฟอร์ม รีเฟรชแล้วข้อมูลตรงกัน
- ยกเลิกยืนยันลบแล้วไม่ลบ ลบรายการทดลองได้
- รายละเอียด ID มีจริง/ไม่มีจริง/ไม่ถูกต้องแสดงเหมาะสม
- อัปโหลดรูปได้ ไม่มีรูป/รูปเสียแสดงสำรอง
- รีวิว 1–5 ทำงาน CRUD ชุดใหม่ไม่ทำให้หนังสือเสีย
- จอมือถือใช้งานได้ และ Backend หยุดแล้วแสดง error เข้าใจได้

เมื่อขึ้นระบบจริงตั้ง HTTPS, API URL ที่ผู้ใช้เข้าถึงได้, CORS ของโดเมนจริง, ค่าลับฝั่งเซิร์ฟเวอร์, การยืนยันตัวตน/สิทธิ์ และ storage ถาวรสำหรับ DB/รูป npm run dev มีไว้พัฒนา SQLite/uploads บนดิสก์ชั่วคราวของ hosting อาจหายหลัง redeploy

ลำดับฝึกที่แนะนำ: **รันเดิม → แก้ข้อความ/สี → เพิ่มช่องเดียว → ทดสอบ → เพิ่ม CRUD → ทดสอบ → ค่อยเปลี่ยน DB/Backend** และ commit ทุกช่วงที่ทำงานได้
