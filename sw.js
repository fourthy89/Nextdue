// FX Journal Service Worker
// ⚠️ ทุกครั้งที่แก้ index.html ต้อง bump เลขเวอร์ชันนี้ ไม่งั้นเบราว์เซอร์จะยังใช้ไฟล์แคชเก่าอยู่
const APP_VERSION = 'v5.44';
const CACHE_NAME = 'fxjournal-' + APP_VERSION;

// ไฟล์ static ที่ precache ตอนติดตั้ง (ไม่รวมข้อมูลเทรดใดๆ)
const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith('fxjournal-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ⚠️ ห้าม cache request ที่ยิงไป Supabase เด็ดขาด — ข้อมูลเทรดต้องสดเสมอ ปล่อยผ่าน network ตรงๆ
  if (url.hostname.endsWith('.supabase.co')) {
    return; // ไม่ intercept เลย ปล่อยให้ browser จัดการเอง
  }

  // หน้า HTML หลัก: network-first กันแอปค้างเวอร์ชันเก่า ถ้าเน็ตหลุดค่อย fallback ไป cache
  if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // ไฟล์ static อื่นๆ (ฟอนต์, Chart.js CDN, ไอคอน, manifest): cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        // เฉพาะ response ที่ปกติ (กัน error / opaque บาง edge case พัง)
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
