const CACHE_NAME = 'dptech-cache-v6';
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
        console.log('캐시 오픈 및 리소스 저장 중...');
        return cache.addAll(urlsToCache)
          .then(() => console.log('모든 리소스 캐싱 완료 (안드로이드 설치 준비 완료)'))
          .catch(err => {
            console.error('캐싱 실패! 일부 파일이 서버에 없는 것 같습니다:', err);
          });
      })
  );
  self.skipWaiting();
});

// 활성화 시 구버전 캐시 정리 및 즉시 제어권 획득
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('구버전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 페치 이벤트: 설치 가능 조건 충족 및 오프라인 대응
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      }).catch(() => {
        // 네트워크와 캐시 모두 실패 시 기본 페이지 반환
        return caches.match('./index.html');
      })
  );
});