# context.md — Nextdue

อัปเดตล่าสุด: 23 ส.ค. 2026 (รอบดึก — เพิ่มระบบเทอม + รหัสวิชา + แก้ UI หลายจุด)
สถานะ: ใช้งานได้จริงแล้ว (มีโปรเจกต์ Supabase จริงเชื่อมต่ออยู่แล้ว) พัฒนาต่อได้ทันที

---

## ⚠️ กติกาการทำงานที่ต้องทำตามเสมอ (สำคัญที่สุด)

1. **ห้ามยุ่งกับระบบหลักเด็ดขาด** — ก่อนแก้อะไรที่อาจกระทบระบบอื่นนอกโปรเจกต์นี้ ต้องถามยืนยันก่อน
2. **ทุกครั้งที่จะสร้าง/แก้ไขอะไร** ให้บอก: รายละเอียดสิ่งที่สร้าง, ความปลอดภัยที่เกี่ยวข้อง, ผลลัพธ์ที่จะได้ ก่อนลงมือทำ แล้วรอ user คอนเฟิร์ม (ยกเว้นงานแก้ bug เล็กๆ ที่ user สั่งตรงๆ อยู่แล้ว)
3. **ส่งเฉพาะไฟล์ที่แก้ไข/สร้างใหม่เท่านั้น ห้ามส่ง zip ทั้งโปรเจกต์** — ใช้ `present_files` ส่งทีละไฟล์แยกกัน พร้อมบอกตำแหน่งปลายทางให้ชัดเจนว่าแต่ละไฟล์ต้องวางที่ path ไหนในเครื่อง user (เช่น `src/components/XXX.jsx`) — user เคยบ่นว่าได้ zip ใหญ่มา 2 ครั้งแล้วไม่พอใจ ต้องระวังเรื่องนี้เป็นพิเศษ
   - ข้อยกเว้นเดียว: ถ้าต้องสร้างไฟล์ binary ใหม่จำนวนมากในโฟลเดอร์ใหม่ (เช่น ไอคอนหลายขนาด) ให้ส่งเป็นไฟล์แยกเหมือนเดิม แต่ทำตารางสรุปตำแหน่งปลายทางให้ชัดเจนเป็นพิเศษ เพราะ user ใช้ Windows ซึ่งซ่อนนามสกุลไฟล์ไว้ ทำให้สับสนไฟล์ชื่อซ้ำ (เช่น "index" ที่จริงคือคนละไฟล์กัน .html กับ .css) ได้ง่าย
4. **ทุก edit ต้องรัน `npm run build` ทดสอบให้ผ่านก่อนส่งไฟล์** (ใช้ placeholder Supabase env ชั่วคราวตอน build ทดสอบได้ ไม่ต้องรอ credentials จริง)
5. ก่อนส่งไฟล์ที่มีการเปลี่ยนแปลง UI สำคัญ ควรลอง mock auth/data ชั่วคราว (backup ไฟล์ที่จะ mock ไว้ที่ `/tmp` ก่อน, mock, screenshot ตรวจสอบ, แล้ว **ต้อง revert กลับเป็นโค้ดจริงเสมอ** ก่อนส่งให้ user — เคยพลาดส่งไฟล์ที่ยัง mock อยู่มาก่อน ต้อง diff เช็คให้ชัวร์ทุกครั้งว่า revert สำเร็จจริง)

---

## แอปคืออะไร

**Nextdue** — ปฏิทินการเรียนสำหรับนักศึกษาไทย ใส่ตารางเรียนของแต่ละวิชา/section ครั้งเดียว จากนั้นเวลาอาจารย์สั่งงาน/มีสอบ ก็เพิ่มเข้าไปโดยเลือก section ที่มีอยู่ ระบบขึ้นในปฏิทินอัตโนมัติ พร้อมตัวนับถอยหลังสำหรับงานที่ปักหมุด

---

## สถาปัตยกรรม

- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Backend**: **Supabase** (Postgres + Auth + Storage) ← เป็นตัวสุดท้ายที่ใช้จริง (ดูประวัติด้านล่าง)
- **Deploy target**: ยังไม่ได้ deploy จริง — แผนคือ push ขึ้น GitHub แล้วเชื่อมกับ Vercel/Netlify

### ประวัติการเปลี่ยน backend (สำคัญ อย่าเสนอให้เปลี่ยนอีกโดยไม่จำเป็น)
1. เริ่มต้นด้วย Supabase
2. ย้ายไป **Firebase** ชั่วคราว เพราะ user คิดว่า Supabase free tier เต็ม (จริงๆ แค่ org เดิมเต็ม 2 โปรเจกต์)
3. เจอว่า Firebase Storage บังคับอัปเกรดเป็นแผน Blaze (ต้องผูกบัตรเครดิต) แม้จะใช้ในโควตาฟรีก็ตาม — user ไม่ต้องการผูกบัตร
4. **ย้ายกลับมา Supabase** โดยสร้างบัญชี/organization ใหม่ (ชื่อ org: "FOTY'Org") เพื่อเลี่ยงข้อจำกัดโปรเจกต์เต็ม — เป็นสถานะปัจจุบัน ห้ามเสนอเปลี่ยนอีกเว้นแต่ user ขอเอง

## สถานะ Supabase จริงที่ user ตั้งค่าไว้แล้ว
- โปรเจกต์ Supabase ชื่อ "Nextdue" สร้างเสร็จแล้ว (region: Oceania/Sydney, status Healthy)
- รัน `supabase/schema.sql` สำเร็จแล้ว (ตาราง subjects, schedule_slots, assignments + RLS + storage bucket "attachments" ครบ)
- **รัน `supabase/migration_terms_and_code.sql` แล้ว** (เพิ่ม 23 ส.ค. 2026) — เพิ่มตาราง `terms` + คอลัมน์ `subjects.code`, `subjects.term_id` + ย้ายวิชาเดิมเข้าเทอม "ปี 2 เทอม 1" อัตโนมัติ — **ถ้ายังไม่ได้รัน migration นี้ในเครื่อง/โปรเจกต์ Supabase ไหน ต้องรันก่อนใช้ฟีเจอร์เทอม/รหัสวิชา ไม่งั้น insert/update subjects จะ error เพราะคอลัมน์ยังไม่มี**
- user มี Project URL (`https://fhprcwsyokqtcqfbwyuj.supabase.co`) และ anon/publishable key (`sb_publishable_...`) ตั้งค่าใน `.env` ในเครื่องตัวเองแล้ว
- **ไม่ต้องให้ user ทำ Supabase setup ซ้ำอีก** ถ้าถามมาว่า "ทำไมยังไม่มีข้อมูล" ให้ดูว่าเป็นปัญหาโค้ด ไม่ใช่ปัญหา setup

---

## โครงสร้างไฟล์ปัจจุบัน

```
nextdue/
├── design/
│   ├── icon-source.svg          # ดีไซน์ไอคอนสไตล์ Nextdue (ตราปั๊ม) — สร้างไว้แต่ "ไม่ได้ใช้จริง" ตอนนี้ (ดูหมายเหตุไอคอนด้านล่าง)
│   └── favicon-source.svg       # เวอร์ชันย่อของไอคอนด้านบน (ตัว N หนา ไม่มีรายละเอียด) — ก็ไม่ได้ใช้จริงเช่นกัน
├── public/
│   ├── favicon.svg              # ⚠️ เป็นไอคอนสายฟ้าม่วง-ฟ้า "ตัวเดิม" ของ Vite scaffold — user ขอให้ revert กลับมาใช้อันนี้แบบจงใจ อย่าเปลี่ยนโดยไม่ถาม
│   ├── favicon-16.png, favicon-32.png, apple-touch-icon.png  # เจนจาก favicon.svg ตัวเดิมเช่นกัน
│   ├── icons/icon-192.png, icons/icon-512.png                # PWA icons เจนจาก favicon.svg ตัวเดิมเช่นกัน (ทุกไอคอนตอนนี้ใช้ดีไซน์เดียวกันหมด = ไอคอนสายฟ้า Vite)
│   └── manifest.json            # PWA manifest (name: Nextdue, theme_color: #212A3D)
├── supabase/
│   ├── schema.sql                # ตาราง subjects, schedule_slots, assignments + RLS + storage policy (รันไปแล้วจริงบน Supabase)
│   └── migration_terms_and_code.sql  # เพิ่มตาราง terms + subjects.code + subjects.term_id + ย้ายข้อมูลเดิม (รันแล้วจริง, เพิ่ม 23 ส.ค. 2026)
├── src/
│   ├── lib/supabaseClient.js    # อ่าน env vars, สร้าง client
│   ├── lib/colors.js            # ระบบสีอิสระ: PRESET_COLORS (6 สีแนะนำ) + colorStyles(hexValue) คืน inline style ไม่ใช่ tailwind class แล้ว
│   ├── lib/subjects.js          # subjectLabel(subject) — ป้ายชื่อวิชาร่วม "รหัส · ชื่อ" ใช้ทุกจุดที่โชว์ชื่อวิชา (เพิ่ม 23 ส.ค. 2026)
│   ├── context/AuthContext.jsx  # session state จาก Supabase Auth
│   ├── hooks/useCountdown.js    # คำนวณเวลานับถอยหลังแบบ live
│   ├── components/
│   │   ├── Stamp.jsx            # ตราปั๊มนับถอยหลัง (signature design element, สีแดง #C1432A) — คนละเรื่องกับไอคอนแอป
│   │   ├── TimeText.jsx         # ช่องพิมพ์เวลาแบบ HH:MM บังคับ 24 ชม. เอง (ไม่ใช้ native <input type=time> เพราะโดน AM/PM ตามการตั้งค่าเครื่อง), มี min-w-0 กัน overflow, normalizeTime() ตัดวินาทีทิ้งถ้าค่าที่รับมาเป็น HH:MM:SS จาก Postgres (เพิ่ม 23 ส.ค. 2026), **ไม่ใช้ font-mono แล้ว** ใช้ฟอนต์เดียวกับทั้งเว็บ (เปลี่ยน 23 ส.ค. 2026 ตามที่ user ขอ — อย่าใส่ font-mono กลับเข้าไปที่ตัวเลขเวลาอีกโดยไม่ถาม)
│   │   ├── WeekSchedule.jsx     # ตารางเรียนรายสัปดาห์ 8:00-20:00, time gutter sticky ซ้าย, เส้นบรรทัดคำนวณจาก HOUR_HEIGHT เดียวกับตำแหน่ง label (กันเหลื่อม), scrollbar ซ่อนด้วย .no-scrollbar, แตะ 2 ครั้งที่การ์ดวิชา (manual double-tap, ไม่ใช้ onDoubleClick เพราะ iOS Safari ตีความเป็นซูม) เพื่อเปิดฟอร์มแก้ไขวิชานั้น, การ์ดวิชาโชว์รหัสวิชาตัวหนา+ชื่อวิชา (wrap แทน truncate บรรทัดเดียว, เพิ่ม 23 ส.ค. 2026), ตัวเลขชั่วโมงไม่ใช้ font-mono แล้ว, **มี `overflow-y-hidden` คู่กับ `overflow-x-auto` เสมอ** — ถ้าตั้งแค่ overflow-x-auto เบราว์เซอร์จะ auto-infer overflow-y เป็น auto ไปด้วยและไปดักจับ wheel scroll event ทำให้ scroll หน้าเว็บทั้งหน้าไม่ได้ตอนเมาส์ชี้ที่ตาราง (แก้บั๊กนี้ไปแล้ว 23 ส.ค. 2026 — อย่าลบ overflow-y-hidden ออก)
│   │   ├── PinnedRail.jsx       # แถบงานปักหมุด ใช้ colorStyles ใหม่, โชว์ subjectLabel (รหัส+ชื่อ) แทนแค่ชื่อ (เพิ่ม 23 ส.ค. 2026)
│   │   ├── AssignmentCard.jsx   # การ์ดงานในลิสต์ ใช้ colorStyles ใหม่, วันที่แสดงแบบไทย (date-fns locale th, ไม่ใช้ font-mono แล้ว), มีปุ่ม "แก้ไข" (onEdit) ข้างปุ่มลบ (เพิ่ม 23 ส.ค. 2026), โชว์ subjectLabel (รหัส+ชื่อ)
│   │   ├── AddSubjectModal.jsx  # ฟอร์มเดียวทำทั้งเพิ่ม/แก้ไขวิชา (prop `subject` มีค่า = โหมดแก้ไข), มีปุ่ม "ลบวิชานี้" ในฟอร์มตอนแก้ไข (เรียก onDelete prop), สีเลือกอิสระ (preset 6 สี + input type=color + พิมพ์ hex เอง, ช่อง hex มี autoComplete=off กัน Chrome เข้าใจผิดเป็นบัตร ID), เวลาใช้ TimeText แบบ fixed width w-[4.5rem] ไม่ใช่ flex-1 (กัน overflow ล้น popup), **เพิ่มช่อง "รหัสวิชา" (code) แยกจากชื่อวิชา + dropdown เลือก "เทอม" (บังคับเลือก, prop `terms`/`defaultTermId`)** (เพิ่ม 23 ส.ค. 2026) — ถ้า `terms` ว่างเปล่าตอนสร้างวิชาใหม่ จะโชว์ข้อความให้ไปสร้างเทอมก่อน
│   │   ├── AddAssignmentModal.jsx # ฟอร์มเดียวทำทั้งเพิ่ม/แก้ไขงาน (prop `assignment` มีค่า = โหมดแก้ไข, เพิ่ม 23 ส.ค. 2026), แนบไฟล์ขึ้น Supabase Storage (แก้ไข/แทนที่/ลบไฟล์แนบเดิมได้), ใช้ TimeText เช่นกัน, มีปุ่ม "ลบงานนี้" ในโหมดแก้ไข, dropdown เลือกวิชาโชว์ subjectLabel (รหัส+ชื่อ)
│   │   ├── ManageTermsModal.jsx # จัดการเทอม: เพิ่ม/แก้ชื่อ(inline, พิมพ์ชื่อเองอิสระ)/ลบ — ลบเทอมส่งผ่าน onDelete ไปให้ Dashboard ยืนยันด้วย ConfirmDialog ก่อน ไม่ลบตรงในนี้ (เพิ่ม 23 ส.ค. 2026)
│   │   ├── DueSoonBanner.jsx    # แจ้งเตือนงานใกล้ถึงกำหนดใน 48 ชม. (in-app banner ตอนเปิดแอป)
│   │   ├── Header.jsx           # โลโก้ Nextdue + ปุ่มออกจากระบบ
│   │   ├── Modal.jsx            # wrapper กลาง, ล็อก scroll ของหน้าพื้นหลังตอนเปิด (document.body.style.overflow = 'hidden')
│   │   └── ConfirmDialog.jsx    # popup ยืนยัน (ลบวิชา/ลบงาน/ลบเทอม) สไตล์แอปเอง แทน native window.confirm() (เพิ่ม 23 ส.ค. 2026)
│   ├── pages/Login.jsx          # เข้าสู่ระบบ/สมัครสมาชิก (Supabase Auth, email+password)
│   └── pages/Dashboard.jsx      # หน้าหลัก: DueSoonBanner + PinnedRail + WeekSchedule + assignment list, dropdown ใช้ custom arrow SVG แทน native เพราะทรงกลม rounded-full บีบลูกศรเดิมจนเบี้ยว. **เพิ่ม 23 ส.ค. 2026**: dropdown filter เทอม ("ทุกเทอม" + รายชื่อเทอม) กรอง subjects/slots/assignments ทั้งหมด (ผ่าน `termSubjects`/`termSlots`/`termSubjectIds`), ปุ่ม "จัดการเทอม" เปิด ManageTermsModal, filter สถานะงานแบบ pill 3 ปุ่ม (ทั้งหมด/ยังไม่ทำ/ทำแล้ว), **filter ทั้ง 3 ตัว (เทอม, วิชา, สถานะ) persist ผ่าน `localStorage` คีย์ `nextdue:selectedTermId` / `nextdue:filterSubject` / `nextdue:filterStatus`** ไม่รีเซ็ตตอนรีเฟรช (เก็บฝั่ง browser เท่านั้น ไม่ sync ข้ามเครื่อง), เปลี่ยนเทอมแล้ว filterSubject จะ reset เป็น 'all' อัตโนมัติกันเลือกวิชาที่ไม่อยู่ในเทอมนั้นค้างอยู่, ลบเทอม = ลบวิชา/ตาราง/งานทั้งหมดในเทอมนั้น (cascade ผ่าน FK) มี ConfirmDialog บอกจำนวนก่อนเสมอ
├── index.html                   # meta tags PWA ครบ (manifest, apple-touch-icon, theme-color, viewport-fit=cover สำหรับ notch), lang="th"
└── src/index.css                # design tokens (CSS vars), font stack เป็น -apple-system (iOS system font) ทั้งเว็บ, scrollbar ซ่อนทั้งหน้า (html + .no-scrollbar utility), safe-area padding สำหรับ notch/home indicator
```

### ไฟล์ที่เคยมีแต่ลบไปแล้ว (อย่าสร้างใหม่โดยไม่จำเป็น)
- `src/components/SubjectList.jsx` — เคยเป็นแถบ chip แสดงรายวิชาเหนือตาราง มีปุ่มแก้ไข/ลบ แต่ user ขอเอาออก เพราะเปลี่ยนไปใช้วิธี "แตะสองครั้งที่การ์ดในตาราง" + ปุ่มลบอยู่ในฟอร์มแก้ไขแทนแล้ว
- `src/context/db.js` (Firestore data layer) และ `src/lib/firebaseClient.js` — ถูกลบตอนย้ายกลับจาก Firebase มา Supabase
- ฟอนต์ Fraunces/IBM Plex Sans Thai (Google Fonts) — เอาออกแล้ว เปลี่ยนเป็น system font (`-apple-system` stack) ทั้งเว็บตามที่ user ขอ

---

## Database schema (Supabase, ใช้งานจริงแล้ว)

```
terms (id, user_id, name, created_at)  -- เพิ่ม 23 ส.ค. 2026, ชื่อเทอมพิมพ์เองอิสระ (เช่น "ปี 2 เทอม 1")
subjects (id, user_id, name, code[text, nullable, รหัสวิชาแยกจากชื่อ เช่น "CS454"], section, color[text, เก็บ hex string เช่น "#4C6480"], term_id[FK → terms, ON DELETE CASCADE], created_at)
schedule_slots (id, user_id, subject_id, day_of_week[0=อาทิตย์], start_time, end_time, room, created_at)
assignments (id, user_id, subject_id, title, note, due_at, pinned, done, attachment_path, created_at)
```
ทุกตารางเปิด Row Level Security (auth.uid() = user_id) — แยกข้อมูลแต่ละคนอัตโนมัติ
Storage bucket: `attachments` (private) path pattern `<user_id>/<filename>`, policy ผูก user_id จาก path

**สำคัญ**: `color` เป็น free-form hex string ธรรมดา ไม่มี CHECK constraint จำกัดค่า (ไม่ใช่ enum) — โค้ดฝั่ง frontend (`src/lib/colors.js`) เป็นคนกำหนดกฎเอง ไม่ใช่ database

**เทอม (terms)**: `subjects.term_id` มี `ON DELETE CASCADE` — ลบเทอม → ลบ subjects ในเทอมนั้น → cascade ต่อไปลบ schedule_slots + assignments ของ subjects นั้นด้วย (ผ่าน FK เดิมใน schema.sql) ลบทีเดียวหมดทั้งสาย ไม่ต้องลบเองทีละตาราง แต่ฝั่ง frontend (Dashboard.jsx) ก็ลบ local state เองคู่กันไปด้วยเพื่อ UI อัปเดตทันทีไม่ต้องรอ refetch

**รหัสวิชา (code)**: nullable — วิชาที่สร้างก่อนมีฟีเจอร์นี้จะมี `code = NULL` (ยังใช้ `name` เป็นชื่อเต็มแบบเดิม จนกว่าจะเข้าไปแก้แยกเอง) ใช้ `subjectLabel()` จาก `src/lib/subjects.js` แสดงผลรวม "รหัส · ชื่อ" ทุกจุดในแอป

---

## ฟีเจอร์ที่ทำเสร็จแล้ว

- **Auth**: สมัคร/เข้าสู่ระบบด้วยอีเมล-รหัสผ่าน (Supabase Auth)
- **ตารางเรียน**: เพิ่มวิชา + section + สี(อิสระ) + เวลาเรียนได้หลายคาบ/วิชา → render เป็นตารางสัปดาห์ 8:00-20:00 อัตโนมัติ
- **แก้ไข/ลบวิชา**: แตะ (หรือคลิก) 2 ครั้งติดกันที่การ์ดวิชาในตาราง → เปิดฟอร์มเดิมพร้อมข้อมูลเดิม แก้ไขได้ทุกอย่าง มีปุ่มลบในฟอร์มนั้นเลย (ลบแล้ว cascade ลบ schedule_slots + assignments ที่ผูกกับวิชานั้นด้วย พร้อม confirm เตือนก่อนเสมอ)
- **งาน/โปรเจกต์/สอบ**: เลือก section ที่มีอยู่ ใส่ชื่อ วันเวลาส่ง โน้ต แนบไฟล์ (Supabase Storage) ปักหมุดได้
- **ปักหมุด + นับถอยหลัง**: Stamp component แสดงวัน/ชม.ที่เหลือแบบ live
- **แจ้งเตือนในแอป**: banner งานใกล้ถึงกำหนดใน 48 ชม.
- **PWA**: ติดตั้งลงหน้าจอโฮมได้ทั้ง iOS/Android, ไอคอนแอป = ไอคอนสายฟ้า Vite ตัวเดิม (ตามที่ user ขอ revert กลับมา)
- **Touch/มือถือ**: double-tap (ไม่ใช่ native dblclick), safe-area insets, ปุ่มขนาดกดง่ายด้วยนิ้ว
- **เวลา 24 ชม. เสมอ**: ไม่มี AM/PM โผล่มาที่ไหนในแอป (แก้ปัญหา native time picker ตามการตั้งค่า OS)
- **สีอิสระ**: เลือกสีวิชาได้ทุกสี ไม่ใช่แค่ 4-6 สีคงที่
- **UI polish รอบหลัง**: ซ่อน scrollbar ทั้งแอป, ล็อก scroll พื้นหลังตอนเปิด modal, แก้ dropdown arrow เบี้ยว, แก้ autofill Chrome เข้าใจผิดเป็นบัตร ID, แก้เส้นตารางเหลื่อมกับตัวเลขเวลา, sticky time gutter, time input ไม่ล้น popup
- **แก้ไข/ลบ assignment แบบเต็มรูปแบบ** (เพิ่ม 23 ส.ค. 2026): ปุ่ม "แก้ไข" ในการ์ดงาน (`AssignmentCard.jsx`) เปิด `AddAssignmentModal.jsx` แบบเดียวกับ AddSubjectModal — prop `assignment` มีค่า = โหมดแก้ไข, prefill ทุกช่องรวมวันเวลา (แปลงกลับจาก ISO ผ่าน `splitDueAt`), แก้ไฟล์แนบได้ 3 แบบ (เก็บของเดิม / อัปโหลดใหม่แทนที่ / ลบทิ้ง — อัปโหลดไฟล์ใหม่ก่อนแล้วค่อยลบไฟล์เก่า กันไฟล์หายถ้าอัปโหลดพัง), มีปุ่ม "ลบงานนี้" ในฟอร์ม. ไปพร้อมกันนี้แก้ `deleteAssignment` ใน Dashboard.jsx ให้ลบไฟล์ Storage ด้วยตอนลบงาน (เดิมลบแค่แถวข้อมูล ไฟล์ค้างอยู่ในบัคเก็ต)
- **Popup ยืนยันในสไตล์แอปเอง** (เพิ่ม 23 ส.ค. 2026): แทนที่ native `window.confirm()` (เดิมโชว์เป็น browser dialog "localhost:5173 says" ไม่เข้ากับดีไซน์แอป) ด้วย `ConfirmDialog.jsx` — ใช้ตอนลบวิชา (`deleteSubject`), ลบงาน (`deleteAssignment`), และลบเทอม (`deleteTerm`) ใน Dashboard.jsx ผ่าน state `confirmDialog` (เก็บ message + onConfirm callback)
- **ระบบเทอม (terms)** (เพิ่ม 23 ส.ค. 2026): แยกวิชา/ตาราง/งานเป็นรายเทอม (เช่น "ปี 2 เทอม 1", "ปี 2 เทอม 2") ตั้งชื่อเองอิสระ ไม่ต้องลบของเก่าตอนขึ้นเทอมใหม่ — dropdown filter ที่หน้า Dashboard เลือกดูทีละเทอมหรือ "ทุกเทอม" พร้อมกัน, ปุ่ม "จัดการเทอม" เปิด `ManageTermsModal.jsx` (เพิ่ม/แก้ชื่อ/ลบ), ลบเทอม cascade ลบทุกอย่างในเทอมนั้น มี ConfirmDialog เตือนจำนวนก่อนเสมอ. วิชาเดิมที่มีก่อนฟีเจอร์นี้ถูกย้ายเข้า "ปี 2 เทอม 1" อัตโนมัติผ่าน migration แล้ว
- **รหัสวิชาแยกจากชื่อวิชา** (เพิ่ม 23 ส.ค. 2026): ฟอร์มเพิ่ม/แก้วิชามีช่อง "รหัสวิชา" (เช่น `CS454`) แยกจาก "ชื่อวิชา" เต็ม แสดงผลรวมกันเป็น "รหัส · ชื่อ" ทุกจุดในแอปผ่าน `subjectLabel()` (`src/lib/subjects.js`), การ์ดในตารางเรียนโชว์รหัสตัวหนาก่อน ชื่อเต็มบรรทัดรอง (wrap แทน truncate บรรทัดเดียว กันตัดจนอ่านไม่รู้เรื่อง)
- **Filter สถานะงาน + จำค่า filter ข้ามรีเฟรช** (เพิ่ม 23 ส.ค. 2026): ปุ่ม pill "ทั้งหมด / ยังไม่ทำ / ทำแล้ว" กรองรายการงาน, filter ทั้ง 3 ตัว (เทอม, วิชา, สถานะ) เก็บใน `localStorage` ของ browser ไม่รีเซ็ตตอนรีเฟรชหน้า (ไม่ sync ข้ามเครื่อง/บัญชี — เก็บแค่ฝั่ง browser)
- **แก้บั๊ก scroll ค้างที่ตารางเรียน** (เพิ่ม 23 ส.ค. 2026): เดิม `overflow-x-auto` ทำให้เบราว์เซอร์ infer `overflow-y: auto` ไปด้วยและดักจับ wheel scroll ทำให้เลื่อนหน้าเว็บไม่ได้ตอนเมาส์อยู่บนตาราง — แก้ด้วยการระบุ `overflow-y-hidden` ชัดเจนคู่กัน
- **แก้บั๊กช่องเวลาโชว์วินาทีเกิน** (เพิ่ม 23 ส.ค. 2026): ค่าจาก Postgres `time` column เป็น `HH:MM:SS` แต่ TimeText ออกแบบไว้สำหรับ `HH:MM` เท่านั้น ทำให้ตัวเลขล้นถูกตัดกลางคำ — เพิ่ม `normalizeTime()` ตัดวินาทีทิ้งตั้งแต่รับค่าเข้ามา
- **เอา font-mono ออกจากตัวเลขเวลา** (เพิ่ม 23 ส.ค. 2026): เดิมช่องเวลา/ตัวเลขชั่วโมงในตาราง/วันที่กำหนดส่งใช้ `font-mono` (`SF Mono` เป็นอันดับแรก) ดูเป็นฟอนต์ Apple ชัดเจนเกินไป — เอาออกจาก `TimeText.jsx`, `WeekSchedule.jsx` (ตัวเลขชั่วโมง), `AssignmentCard.jsx` (ข้อความกำหนดส่ง) ให้ใช้ฟอนต์เดียวกับทั้งเว็บ (`-apple-system` stack ปกติ) — **ยังคง font-mono ไว้ที่ 2 จุดที่ไม่ใช่ตัวเลขเวลา**: ช่องกรอกโค้ดสี `#RRGGBB` ใน AddSubjectModal กับ tagline หัวเว็บใน Header.jsx (ไม่ได้ถูกขอให้เปลี่ยน)

## ฟีเจอร์ที่ยังไม่ได้ทำ
- Deploy จริงขึ้น GitHub/hosting
- Sync filter preference (เทอม/วิชา/สถานะ) ข้ามเครื่อง/บัญชี — ตอนนี้เก็บแค่ localStorage ฝั่ง browser เดียว

## ตัดออกจากขอบเขต (out of scope — ตัดเมื่อ 23 ส.ค. 2026, อย่าเสนอทำใหม่โดยไม่ถาม)
- Push notification จริง (แค่ in-app banner ตอนนี้)
- Offline support / service worker
- Import ตารางเรียนจากระบบมหาวิทยาลัย

## Design system
- สีหลัก: กระดาษเย็น `#F6F5F1`, การ์ด `#FFFFFF`, หมึกกรมท่า `#212A3D` (ตัวหนังสือ/โครงสร้าง), แดงตรายาง `#C1432A` (เฉพาะ due-date stamp)
- สีวิชา: อิสระ (hex ใดก็ได้) — มี preset 6 สีแนะนำใน `PRESET_COLORS` (`src/lib/colors.js`)
- ฟอนต์หลัก: **iOS system font** (`-apple-system, BlinkMacSystemFont, "SF Pro Display/Text", "Segoe UI", ...`) ทั้งเว็บ ไม่โหลดฟอนต์นอกแล้ว
- ฟอนต์ monospace (`--font-mono`, มี `SF Mono` เป็นอันดับแรก): **ห้ามใช้กับตัวเลขเวลา/วันที่แล้ว** (เอาออกจาก TimeText, ตัวเลขชั่วโมงใน WeekSchedule, วันที่กำหนดส่งใน AssignmentCard เมื่อ 23 ส.ค. 2026 ตามที่ user ขอ เพราะรู้สึกว่าเป็นฟอนต์ Apple ชัดเกินไป) ยังใช้อยู่แค่ 2 จุด: ช่องกรอกโค้ดสี `#RRGGBB` (AddSubjectModal) กับ tagline หัวเว็บ (Header.jsx) — อย่าใส่ font-mono กลับไปที่ตัวเลขเวลาโดยไม่ถามก่อน
- องค์ประกอบเด่น: "ตราปั๊มวันครบกำหนด" (`.stamp` class ใน index.css) หมุนเอียง -6deg ใช้ทุกจุดที่แสดงตัวนับถอยหลัง
- ไอคอนแอป/favicon: **ไม่ใช่ดีไซน์ Nextdue** — เป็นไอคอนสายฟ้าไล่สีม่วง-ฟ้าของ Vite scaffold ตัวเดิม (user ขอ revert กลับมาแบบตั้งใจ อย่าไปเปลี่ยนเองอีกโดยไม่ถามก่อน)
