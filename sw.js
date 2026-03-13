const CACHE_NAME = 'dptech-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 서비스 워커 설치: 필수 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 새로운 서비스 워커 활성화 시 구버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 안드로이드 크롬의 '설치 가능' 판단 기준인 fetch 이벤트 리스너
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 반환, 없으면 네트워크에서 가져옴
        return response || fetch(event.request);
      })
  );
});