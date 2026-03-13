const CACHE_NAME = 'dptech-cache-v5';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// 서비스 워커 설치: 필수 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 오픈 중...');
        return cache.addAll(urlsToCache)
          .then(() => console.log('모든 리소스 캐싱 완료 (안드로이드 설치 준비 완료)'))
          .catch(err => console.error('캐싱 실패! 아이콘 파일이 서버에 있는지 확인하세요:', err));
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
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 안드로이드 크롬의 '설치 가능' 판단 기준인 fetch 이벤트 리스너
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      }).catch(() => {
        return caches.match('./index.html');
      })
  );
});