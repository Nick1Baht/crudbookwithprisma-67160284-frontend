# เพิ่ม CRUD ชุดที่สอง: หนังสือ + สินค้า

[กลับ README](../README.md)

ตัวอย่างนี้ **เพิ่มสินค้า ไม่แทนที่หนังสือ** สินค้ามีชื่อ ราคา และสถานะขาย ไม่มีรูป/รีวิว ให้ทำหลังรันระบบเดิมได้แล้ว โค้ดในเอกสารเป็นตัวอย่างสำหรับคัดลอก ยังไม่ได้สร้าง feature สินค้าในโปรเจกต์จริง

ใช้คำสั่งปกติ `npm`/`npx` สำหรับเครื่องแล็ป ถ้า PowerShell บล็อกให้ใช้ `npm.cmd`/`npx.cmd` แทนทุกจุด

## 1. เตรียมก่อนแก้

สำรอง DB ก่อนเปลี่ยน schema และสร้าง branch ใน **ทั้งสอง repository** ที่จะแก้:

```powershell
git switch -c feature/products
```

เปิด VS Code แยก Backend/Frontend สังเกตว่าไฟล์ต่อไปนี้ต้องสร้าง **คนละโฟลเดอร์โปรเจกต์**

## 2. เพิ่ม model ใน Backend

เปิด **Backend** `prisma/schema.prisma` เพิ่มต่อท้าย โดยเก็บ model Book/Review เดิมไว้:

```prisma
model Product {
  id          Int     @id @default(autoincrement())
  name        String
  price       Float
  isAvailable Boolean @default(true)
}
```

ใช้ Float เพื่อให้ตัวอย่างเข้าใจง่าย งานการเงินจริงควรกำหนดความแม่นยำ เช่นเก็บจำนวนสตางค์เป็นจำนวนเต็มแล้วแปลงตอนแสดงผล

หยุด Backend ชั่วคราวแล้วรันใน **Backend**:

```powershell
npm run prisma:generate
npm run prisma:push
```

ถ้าโครงการเปลี่ยนมาใช้ migrations แล้ว ให้ใช้ workflow migrations ของโครงการแทน push ไม่ผสมสองแนวทางโดยไม่วางแผน

## 3. สร้างไฟล์ Backend สำหรับสินค้า

### ใช้ Nest CLI สร้างโครงอัตโนมัติ

เลือกได้สองทาง: **สร้างไฟล์เองตามตัวอย่างถัดไป** หรือ **ให้ CLI สร้างโครงแล้วแก้เนื้อหา** ไม่ต้องสร้างซ้ำสองรอบ คำสั่งต่อไปนี้รันใน Backend ที่ npm ci แล้ว (เครื่องแล็ปใช้ npx ปกติ ถ้าบล็อกใช้ npx.cmd)

เริ่มจากดูตัวอย่างผลโดยไม่เขียนไฟล์:

```powershell
npx nest g resource product --type rest --crud --no-spec --dry-run
```

สร้างจริงโดยเอา dry-run ออก:

```powershell
npx nest g resource product --type rest --crud --no-spec
```

คำสั่งนี้ระบุ REST/CRUD ไว้แล้ว จึงไม่ต้องเลือกจากเมนู หากใช้แบบสั้น `npx nest g resource product` แล้วมีคำถาม ให้เลือก REST API และตอบ Yes สำหรับ Generate CRUD entry points (แบบสั้นจะสร้างไฟล์ทดสอบตามค่าเริ่มต้นด้วย)

โครงที่ได้จากคำสั่งระบุ --no-spec:

```text
src/product/
├── product.controller.ts
├── product.service.ts
├── product.module.ts
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
└── entities/
    └── product.entity.ts
```

CLI เพิ่ม ProductModule ใน `src/app.module.ts` ของ Backend นี้ให้ด้วย ตรวจว่ามีแล้วก่อนเพิ่มเองอีกครั้ง ถ้าโฟลเดอร์ product มีไฟล์อยู่แล้วไม่ควรรันซ้ำ ใช้ไฟล์เดิมหรือเลือกชื่อ resource ที่ยังไม่มี

ถ้าต้องการเฉพาะ class ของ Entity โดยยังไม่มีไฟล์นั้น:

```powershell
npx nest g class product/entities/product.entity --flat --no-spec
```

จะได้ `src/product/entities/product.entity.ts` เป็น class เปล่า ให้ตรวจชื่อ class ที่ได้หากนำไป import ส่วนโครง resource สร้างไฟล์นี้ให้อยู่แล้ว ไม่ต้องสั่งซ้ำ `--flat` ป้องกันการสร้างโฟลเดอร์ซ้อน และ `--no-spec` ไม่สร้างไฟล์ทดสอบอัตโนมัติ

**Prisma model กับ Nest Entity คนละหน้าที่:** ในโปรเจกต์นี้ schema.prisma เป็นตัวกำหนด DB ส่วน entities/*.entity.ts เป็น class ฝั่งโค้ด อาจใช้บอกโครงสร้างผลลัพธ์ แต่ไม่สร้างตารางหรือเชื่อม Prisma ให้ ไม่ต้องทำ Entity ซ้ำทุกฟิลด์เพื่อให้ Prisma บันทึกได้

หลัง generate resource ยังต้องทำต่อ:

1. เพิ่ม model และ generate/push ตามข้อ 2 เพราะ CLI ไม่แก้ schema ให้
2. แก้ service ให้ใช้ Prisma แทนข้อความตัวอย่างที่ CLI สร้าง
3. แก้ DTO/controller ให้รับฟิลด์ที่ต้องการ และ import PrismaModule ใน ProductModule
4. เพิ่มหน้าเว็บ/API ฝั่ง Frontend ตามข้อ 4 เป็นต้นไป

**ถ้าต้องการใช้โค้ดถัดไปแบบคัดลอกตรง ๆ หลังสร้างด้วย CLI:** ให้สร้าง `product.dto.ts` เพิ่มตามตัวอย่าง แล้วแทนเนื้อหา controller/service/module ที่ CLI สร้างด้วยตัวอย่างในเอกสารนี้ DTO ใน dto/ และ entity ที่ generator สร้างจะไม่ได้ถูกใช้ในแนวทางนี้ สามารถเก็บไว้ศึกษาได้ และไม่เพิ่ม ProductModule ใน AppModule ซ้ำ

อีกทางคือเก็บโครง CLI เดิม แล้วเติมฟิลด์ใน CreateProductDto/UpdateProductDto และปรับโค้ดตัวอย่างให้ import/type ตรงกับสองชื่อนี้ แทน ProductDto ตัวเดียว อย่าคัดลอกสลับชื่อโดยไม่แก้ import

### สร้างไฟล์เองตามตัวอย่าง

หากไม่ใช้ CLI ให้สร้างไฟล์ตามขั้นตอนด้านล่างได้เลย ผลสุดท้ายยังทำ CRUD สินค้าได้เหมือนกัน ตัวอย่างนี้ใช้ ProductDto ร่วมสำหรับเพิ่ม/แก้ จึงมีโครง DTO ต่างจาก generator เล็กน้อย

### `src/product/product.dto.ts` — รูปร่างข้อมูลที่รับ

สร้างโฟลเดอร์ `src/product` แล้วสร้างไฟล์:

```ts
export class ProductDto {
  name?: string;
  price?: number;
  isAvailable?: boolean;
}
```

เครื่องหมาย `?` แปลว่าอาจไม่ส่งมา ตอนเพิ่มจะตรวจ name/price ใน service ส่วนตอนแก้จะเติมค่าที่ไม่ได้ส่งจากรายการเดิม TypeScript type ไม่ได้ตรวจข้อมูลจากผู้ใช้ให้เอง จึงต้องตรวจขณะทำงานด้วย

### `src/product/product.service.ts` — ทำงานกับ DB

```ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private data(input: ProductDto) {
    if (typeof input.name !== 'string' || !input.name.trim()) {
      throw new BadRequestException('กรุณากรอกชื่อสินค้า');
    }
    if (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0) {
      throw new BadRequestException('ราคาต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป');
    }
    if (input.isAvailable !== undefined && typeof input.isAvailable !== 'boolean') {
      throw new BadRequestException('สถานะต้องเป็น boolean');
    }
    return {
      name: input.name.trim(),
      price: input.price,
      isAvailable: input.isAvailable ?? true,
    };
  }

  findAll() {
    return this.prisma.product.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('ไม่พบสินค้า');
    return product;
  }

  create(input: ProductDto) {
    return this.prisma.product.create({ data: this.data(input) });
  }

  async update(id: number, input: ProductDto) {
    const current = await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: this.data({ ...current, ...input }),
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'ลบสินค้าแล้ว' };
  }
}
```

### `src/product/product.controller.ts` — ที่อยู่ API

```ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get()
  findAll() { return this.products.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.products.findOne(id);
  }

  @Post()
  create(@Body() input: ProductDto) { return this.products.create(input); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() input: ProductDto) {
    return this.products.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.products.remove(id); }
}
```

### `src/product/product.module.ts` — ลงทะเบียนชุดสินค้า

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
```

### แก้ `src/app.module.ts` เดิม

เพิ่ม import ด้านบน:

```ts
import { ProductModule } from './product/product.module';
```

แล้วแก้ imports เดิมเป็น `imports: [BookModule, ProductModule],` โดยเก็บ controllers/providers เดิมไว้ ไม่ลบ BookModule

ตรวจ compile และเปิด Backend:

```powershell
npm run build
npm run start:dev
```

เปิด `http://localhost:3000/products` ต้องได้ `[]` หรือรายการสินค้า และ `/books` ต้องยังทำงาน ถ้า products เป็น 404 ให้ตรวจ AppModule ถ้า prisma.product ไม่มีให้ตรวจ generate

## 4. สร้างไฟล์ API ใน Frontend

จากนี้ทำใน **Frontend** สร้างโฟลเดอร์ `app/products` แล้วสร้าง `app/products/product-api.ts`:

```ts
export interface Product {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export type ProductInput = Omit<Product, 'id'>;

const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
  .replace(/\/+$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${base}${path}`, { ...options, cache: 'no-store' });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : undefined; }
  catch { throw new Error(`API ไม่ได้ตอบ JSON (HTTP ${response.status})`); }
  if (!response.ok) {
    const message = data?.message;
    throw new Error(Array.isArray(message) ? message.join(', ') : message || `HTTP ${response.status}`);
  }
  return data as T;
}

export function getProducts() { return request<Product[]>('/products'); }

export function saveProduct(input: ProductInput, id?: number) {
  return request<Product>(id !== undefined ? `/products/${id}` : '/products', {
    method: id !== undefined ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: number) {
  return request<{ message: string }>(`/products/${id}`, { method: 'DELETE' });
}
```

ตัวอย่างแยก API สินค้าให้อ่านง่าย หากมีหลาย CRUD มากขึ้น ค่อยย้ายส่วน request/base ไป `app/lib/api.ts` แล้ว export/import ใช้ร่วมกัน โค้ด apiRequest ในหนังสือเดิมยังเป็น private จึง import มาใช้ตรง ๆ ไม่ได้

## 5. สร้างหน้าเพิ่ม/ดู/แก้/ลบสินค้า

สร้าง **Frontend** `app/products/products-page.tsx` คัดลอกทั้งหมดนี้ ฟอร์มฝังอยู่บนหน้าเพื่อให้อ่านตามง่าย ยังใช้ CSS เดิมได้:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { deleteProduct, getProducts, saveProduct } from "./product-api";
import type { Product } from "./product-api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    let active = true;
    getProducts()
      .then((data) => { if (active) setProducts(data); })
      .catch((reason) => { if (active) setError(String(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function reset() {
    setEditingId(undefined);
    setName("");
    setPrice("");
    setIsAvailable(true);
  }

  function edit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setIsAvailable(product.isAvailable);
    setError("");
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const amount = Number(price);
    if (!name.trim() || !price.trim() || !Number.isFinite(amount) || amount < 0) {
      setError("กรอกชื่อและราคาตั้งแต่ 0 ขึ้นไป");
      return;
    }
    setBusy(true);
    try {
      const saved = await saveProduct({ name: name.trim(), price: amount, isAvailable }, editingId);
      setProducts((current) => editingId !== undefined
        ? current.map((product) => product.id === saved.id ? saved : product)
        : [...current, saved]);
      reset();
      setNotice("บันทึกสินค้าแล้ว");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "บันทึกไม่สำเร็จ");
    } finally { setBusy(false); }
  }

  async function remove(product: Product) {
    if (!window.confirm(`ลบ ${product.name} หรือไม่?`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) reset();
      setNotice("ลบสินค้าแล้ว");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ลบไม่สำเร็จ");
    } finally { setBusy(false); }
  }

  return (
    <>
      <section className="page-intro"><h1>จัดการสินค้า</h1></section>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="inline-success" role="status">{notice}</p>}
      <section className="library-section">
        <h2>{editingId !== undefined ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h2>
        <form className="book-form" onSubmit={submit}>
          <div className="form-grid">
            <label className="form-field">
              <span>ชื่อสินค้า</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required disabled={busy || loading} />
            </label>
            <label className="form-field">
              <span>ราคา (บาท)</span>
              <input type="number" min="0" step="0.01" value={price}
                onChange={(event) => setPrice(event.target.value)} required disabled={busy || loading} />
            </label>
            <label>
              <input type="checkbox" checked={isAvailable}
                onChange={(event) => setIsAvailable(event.target.checked)} disabled={busy || loading} /> พร้อมขาย
            </label>
          </div>
          <div className="row-actions">
            <button className="button button-primary" disabled={busy || loading}>
              {busy ? "กำลังทำงาน..." : "บันทึก"}
            </button>
            <button className="button" type="button" onClick={reset} disabled={busy}>ยกเลิก/ล้างฟอร์ม</button>
          </div>
        </form>
      </section>
      {loading ? <p>กำลังโหลด...</p> : (
        <section className="library-section table-scroll">
          <h2>รายการสินค้า</h2>
          <table className="book-table">
            <thead><tr><th>ชื่อ</th><th>ราคา</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.price.toFixed(2)}</td>
                  <td>{product.isAvailable ? "พร้อมขาย" : "ไม่พร้อม"}</td>
                  <td><div className="row-actions">
                    <button className="text-action" onClick={() => edit(product)} disabled={busy}>แก้ไข</button>
                    <button className="text-action" onClick={() => void remove(product)} disabled={busy}>ลบ</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p>ยังไม่มีสินค้า</p>}
        </section>
      )}
    </>
  );
}
```

สร้าง `app/products/page.tsx` เพื่อให้ URL `/products` มีอยู่จริง:

```tsx
import ProductsPage from "./products-page";

export default function Page() {
  return <ProductsPage />;
}
```

สร้าง `app/products/layout.tsx` เพื่อใช้ header/footer เดิมร่วมกัน:

```tsx
export { default } from "../books/layout";
```

ไฟล์นี้ re-export layout จึงไม่ต้องคัดลอก header ทั้งก้อน แต่ชื่อแบรนด์ยังใช้ของเดิม หากต้องการชื่อกลางให้แก้ layout ต้นทาง เช่น “ระบบจัดการข้อมูล” ระยะยาวสามารถแยก layout กลางออกมาให้ชื่อสื่อความหมายได้

## 6. เพิ่มเมนูเชื่อมสอง CRUD

Frontend `app/books/layout.tsx` มี `import Link from "next/link";` แล้ว เพิ่ม **ภายใน `<div className="header-inner">`** เช่นหลัง Link แบรนด์:

```tsx
<nav className="row-actions" aria-label="เมนูหลัก">
  <Link className="text-action" href="/books">หนังสือ</Link>
  <Link className="text-action" href="/products">สินค้า</Link>
</nav>
```

layout สินค้าดึง layout เดียวกันจึงได้เมนูด้วย ถ้าจอแคบแล้ว header แน่นให้ปรับ CSS header/mobile และย่อข้อความ header-note ถ้าต้องการหน้าแรกเป็นสินค้าแก้ `app/page.tsx` เป็น `redirect("/products")`

## 7. ทดลองให้ครบ

ใน Frontend:

```powershell
npm run lint
npm run build
npm run dev
```

เปิด `/products` เพิ่ม “ปากกา” ราคา 10.50 แก้ราคา/สถานะ รีเฟรช และลบรายการทดลอง เปิด `/books` ตรวจว่ายังใช้ได้ หาก build ผ่านแต่ API ไม่ได้ให้ตรวจ `/products` ของ Backend, env และ CORS

## 8. ถ้าต้องการหน้ารายละเอียดสินค้า `/products/1`

ตัวอย่างข้างต้นทำ CRUD ครบในหน้าเดียวแล้ว ถ้าอยากมีหน้าแยกเหมือนหนังสือ ให้ทำเพิ่ม:

1. เพิ่ม `getProduct(id: string)` ใน product-api.ts ให้เรียก `request<Product>(\`/products/${encodeURIComponent(id)}\`)`
2. สร้าง `product-detail-page.tsx` เป็น Client Component ใช้ book-detail-page เป็นแบบ: รับ productId, โหลด getProduct, แสดง name/price/isAvailable และจัดการ loading/error; ไม่คัดลอกส่วนรีวิว/ปกที่สินค้าตัวอย่างไม่มี
3. สร้างโฟลเดอร์ `app/products/[id]` และไฟล์ page.tsx โดยคัดลอก `app/books/[id]/page.tsx` แล้วเปลี่ยน import/component/prop เป็น ProductDetailPage และ productId **คง params แบบ Promise และ Suspense ไว้**
4. ในตารางเพิ่ม Link ไป `/products/${product.id}` พร้อม import Link จาก next/link
5. ถ้าหน้ารายละเอียดแก้ไขได้ด้วย แยกฟอร์มจาก products-page เป็น product-form.tsx เพื่อใช้ร่วมกันเหมือน BookForm เดิม หรือเริ่มจากรายละเอียดอ่านอย่างเดียวก่อน
6. ทดสอบ ID ที่มีจริง ไม่มีจริง และไม่ใช่ตัวเลข

## 9. ใช้ระบบอื่นแทนสินค้า

เมื่อทำตัวอย่างนี้สำเร็จ เปลี่ยน Product → Student/Equipment ตามงาน และวางแผนฟิลด์ก่อน เปลี่ยนชื่อให้ครบทั้ง model, DTO, Service, Controller, Module, type, input, payload, ตาราง และ URL หากต้องการ CRUD ชุดที่สามให้ทำตามขั้นตอนเดิมอีกครั้ง อย่าเพิ่ม model อย่างเดียวแล้วคาดว่าหน้าเว็บจะถูกสร้างให้อัตโนมัติ
