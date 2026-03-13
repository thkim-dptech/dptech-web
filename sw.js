const CACHE_NAME = 'dptech-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // 여기에 아이콘 파일들도 추가하는 것이 좋습니다.
  './icon-192x192.png',
  './icon-512x512.png'
];

// 서비스 워커 설치: 필수 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시 오픈 및 리소스 저장 중');
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
        // 캐시에 있으면 반환, 없으면 네트워크에서 가져오고 캐시에 저장(선택적)
        return response || fetch(event.request).then((fetchResponse) => {
          return fetchResponse;
        });
      }).catch(() => {
        // 네트워크 연결이 끊겼을 때의 예외 처리
        return caches.match('./index.html');
      })
  );
});