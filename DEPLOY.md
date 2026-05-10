# SmartPOS Deployment

สแตกที่เหมาะกับโปรเจกต์นี้:

- Frontend: Vercel
- Backend: Render
- Database: Supabase Postgres

## 1. เตรียม Supabase

1. สร้างโปรเจกต์ใหม่ใน Supabase
2. ไปที่ `Project Settings -> Database`
3. คัดลอก `Connection string (URI)` แบบ password
4. ใช้ connection ที่ลงท้ายด้วย `?sslmode=require`

ตัวอย่าง:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

หมายเหตุ:

- โปรเจกต์นี้ใช้ Prisma กับ PostgreSQL
- `render.yaml` จะรัน `prisma migrate deploy` และ `prisma db seed` ให้ตอน backend start

## 2. Deploy Backend ไป Render

วิธีแนะนำคือใช้ Blueprint จากไฟล์ [render.yaml](/Users/somtah/Downloads/smartpos/render.yaml).

1. Push repo ขึ้น GitHub
2. ใน Render เลือก `New + -> Blueprint`
3. เลือก repo นี้
4. ตอนสร้าง service ให้ตรวจว่าชี้ไปที่ `render.yaml`
5. หลัง service ถูกสร้าง ไปที่ `Environment` แล้วใส่ค่าด้านล่าง

ค่าที่ต้องตั้งใน Render:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
JWT_ACCESS_SECRET=[random-long-secret]
JWT_REFRESH_SECRET=[another-random-long-secret]
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
DISABLE_AUTH=true
FRONTEND_ORIGIN=https://[your-frontend].vercel.app
```

หมายเหตุ:

- ถ้าต้องการเปิดหน้า login จริง ให้ตั้ง `DISABLE_AUTH=false`
- backend จะฟัง `PORT` จาก Render อัตโนมัติ
- Swagger จะอยู่ที่ `/docs`

หลัง deploy สำเร็จ ควรได้ URL ประมาณ:

```text
https://smartpos-api.onrender.com
```

ลองเช็ก:

- `GET /`
- `GET /docs`

## 3. Deploy Frontend ไป Vercel

1. ใน Vercel เลือก `Add New -> Project`
2. Import repo นี้
3. ตั้ง `Root Directory` เป็น `frontend`
4. Framework จะตรวจเป็น `Vite`
5. Build command ใช้ `npm run build`
6. Output directory ใช้ `dist`

Environment Variables ที่ต้องตั้งใน Vercel:

```env
VITE_API_BASE_URL=https://[your-render-service].onrender.com
VITE_DISABLE_AUTH=true
VITE_POS_EMAIL=admin@smartpos.local
VITE_POS_PASSWORD=admin1234
```

หมายเหตุ:

- ถ้าเปิด auth จริง (`DISABLE_AUTH=false` ที่ backend) ให้ตั้ง `VITE_DISABLE_AUTH=false`
- ค่า `VITE_API_BASE_URL` ต้องไม่มี `/` ท้าย URL

## 4. ผูก CORS ให้ครบ

หลังได้ URL ของ Vercel จริงแล้ว:

1. กลับไปที่ Render
2. แก้ `FRONTEND_ORIGIN` ให้เป็น URL จริงของ Vercel
3. Redeploy backend 1 รอบ

ตัวอย่าง:

```env
FRONTEND_ORIGIN=https://smartpos-frontend.vercel.app
```

ในโค้ด backend จะอ่านตัวแปรนี้ที่ [backend/src/main.ts](/Users/somtah/Downloads/smartpos/backend/src/main.ts:14)

## 5. ลำดับที่แนะนำในการขึ้นระบบ

1. สร้าง Supabase ก่อน
2. Deploy backend ไป Render พร้อมตั้ง `DATABASE_URL`
3. รอให้ Render รัน migrations และ seed สำเร็จ
4. Deploy frontend ไป Vercel โดยชี้ `VITE_API_BASE_URL` ไป Render
5. กลับมาตั้ง `FRONTEND_ORIGIN` ที่ Render เป็น URL จริงของ Vercel

## 6. สิ่งที่ควรรู้ก่อนใช้ production

- ระบบอัปโหลดรูปสินค้าเก็บไฟล์ไว้บน disk ของ backend ที่ `uploads/products`
- บน Render filesystem ไม่ใช่ storage ถาวรสำหรับไฟล์อัปโหลด
- ถ้ามีการ restart หรือ redeploy รูปที่อัปโหลดอาจหายได้

ถ้าจะใช้จริง ควรย้ายรูปไป object storage เช่น:

- Supabase Storage
- Cloudinary
- AWS S3

จุดที่เกี่ยวข้องอยู่ที่ [backend/src/products/product-image-upload.ts](/Users/somtah/Downloads/smartpos/backend/src/products/product-image-upload.ts:1)

## 7. ค่าเริ่มต้นที่ระบบ seed ให้

เมื่อ backend start บนฐานข้อมูลใหม่ จะมี:

- ผู้ใช้ `admin@smartpos.local`
- รหัสผ่าน `admin1234`
- สินค้าตัวอย่าง 3 รายการ

seed logic อยู่ที่ [backend/prisma/seed.ts](/Users/somtah/Downloads/smartpos/backend/prisma/seed.ts:1)
