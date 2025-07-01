// キャッシュ名の設定
const CACHE_NAME = 'hirokazu-game-v1';
// キャッシュするファイルのリスト
const urlsToCache = [
  '/',
  '/src/index.html',
  '/src/index.js',
  // 他のアセットファイルも必要に応じて追加
];

// Service Workerのインストール時にキャッシュを作成
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// ネットワークリクエスト時にキャッシュを優先して返す
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュがあればそれを返す。なければネットワークから取得
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
}); 