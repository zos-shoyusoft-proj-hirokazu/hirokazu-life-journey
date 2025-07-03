// キャッシュ名の設定（タイムスタンプを追加してキャッシュを強制更新）
const CACHE_NAME = `hirokazu-game-v${Date.now()}`;
// キャッシュするファイルのリスト
const urlsToCache = [
  './',
  './index.html',
  './bundle.js',
  // 他のアセットファイルも必要に応じて追加
];

// Service Workerのインストール時にキャッシュを作成
self.addEventListener('install', function(event) {
  // 即座に新しいService Workerをアクティブにする
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// 新しいService Workerがアクティブになったときに古いキャッシュを削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ネットワーク優先戦略（開発時用）
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // ネットワークから取得できた場合、キャッシュを更新して返す
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(function() {
        // ネットワークがない場合のみキャッシュから返す
        return caches.match(event.request);
      })
  );
}); 