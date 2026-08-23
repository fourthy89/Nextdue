# Nextdue

ปฏิทินการเรียนสำหรับนักศึกษา — ใส่ตารางเรียนของแต่ละวิชา/section ครั้งเดียว
จากนั้นเวลาอาจารย์สั่งงานก็เพิ่มเข้าไปในไม่กี่คลิก ระบบจะขึ้นบนปฏิทิน พร้อมตัวนับถอยหลังสำหรับงานที่ปักหมุดไว้

## Stack
- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Deploy**: Static build → GitHub → hosting ที่เชื่อมกับ GitHub (เช่น Vercel/Netlify/GitHub Pages)

## เริ่มต้นใช้งาน (local)

### 1. ติดตั้ง dependencies
```bash
npm install
```

### 2. ตั้งค่า Supabase
1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com) (ใช้บัญชี/อีเมลไหนก็ได้ — free tier จำกัด 2 โปรเจกต์ต่อ organization)
2. เปิด **SQL Editor** ในโปรเจกต์ แล้ววางเนื้อหาไฟล์ `supabase/schema.sql` ทั้งหมด กด Run
   - ไฟล์นี้จะสร้างตาราง `subjects`, `schedule_slots`, `assignments`
   - เปิด Row Level Security ให้อัตโนมัติ (แต่ละคนเห็นข้อมูลตัวเองเท่านั้น)
   - สร้าง Storage bucket ชื่อ `attachments` แบบ private สำหรับรูปโจทย์/ไฟล์แนบ — **ไม่ต้องผูกบัตรเครดิต** ใช้ได้เลยในแผนฟรี
3. ไปที่ Project Settings → API คัดลอกค่า `Project URL` และ `anon public key`

### 3. ตั้งค่า environment variables
```bash
cp .env.example .env
```
แก้ไฟล์ `.env` ใส่ค่า `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` ที่คัดลอกมา

### 4. รันตอนพัฒนา
```bash
npm run dev
```

### 5. Build สำหรับ deploy จริง
```bash
npm run build
```
ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/`

## Deploy ผ่าน GitHub
1. Push โปรเจกต์นี้ขึ้น GitHub repo
2. เชื่อม repo กับ Vercel หรือ Netlify (auto-deploy ทุกครั้งที่ push ขึ้น `main`)
3. ตั้งค่า environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) ในหน้า settings ของ hosting นั้นๆ ด้วย — ห้ามลืม ไม่งั้น build จะเชื่อมต่อ Supabase ไม่ได้

## โครงสร้างฟีเจอร์
- **ตารางเรียน** — เพิ่มวิชา + section + วันเวลาเรียน (เพิ่มได้หลายคาบต่อวิชา) ระบบ generate เป็นตารางสัปดาห์ให้อัตโนมัติ
- **งาน/โปรเจกต์/สอบ** — เลือก section ที่มีอยู่ ใส่ชื่องาน วันเวลาส่ง แนบรูปโจทย์/โน้ตได้ (เก็บใน Supabase Storage)
- **ปักหมุด + นับถอยหลัง** — งานที่ปักหมุดจะมีตัวนับถอยหลัง (วัน/ชั่วโมง) แสดงแยกไว้ด้านบน
- **แจ้งเตือนในแอป** — banner แจ้งงานที่ใกล้ถึงกำหนดส่งภายใน 48 ชั่วโมง เมื่อเปิดแอป

## ความปลอดภัย
- ใช้ Supabase Auth (email/password) — 1 คนต่อ 1 บัญชี ข้อมูลแยกกันด้วย Row Level Security (RLS) เพื่อไม่ให้เห็นข้อมูลข้ามบัญชี
- Storage bucket ตั้งเป็น private + policy ผูกกับ user_id เจ้าของไฟล์เท่านั้น
- ไม่มีการเก็บ API key ใน client-side โดยตรง (ใช้ Supabase anon key ที่ปลอดภัยสำหรับ client ร่วมกับ RLS)
