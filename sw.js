const CACHE = ‘aichat-v1’;
const ASSETS = [
‘./’,
‘./index.html’,
‘./manifest.json’,
‘https://fonts.googleapis.com/css2?family=Söhne:wght@300;400;500;600&display=swap’,
‘https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js’,
‘https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css’,
‘https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js’,
];

self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE).then(c => {
return Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})));
}).then(() => self.skipWaiting())
);
});

self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
).then(() => self.clients.claim())
);
});

self.addEventListener(‘fetch’, e => {
// Don’t intercept API calls
if (e.request.url.includes(‘googleapis.com’) ||
e.request.url.includes(‘openai.com’) ||
e.request.url.includes(‘anthropic.com’) ||
e.request.url.includes(‘mistral.ai’) ||
e.request.url.includes(‘api.’)) {
return;
}
e.respondWith(
caches.match(e.request).then(cached => {
if (cached) return cached;
return fetch(e.request).then(res => {
if (res && res.status === 200 && res.type === ‘basic’) {
const clone = res.clone();
caches.open(CACHE).then(c => c.put(e.request, clone));
}
return res;
}).catch(() => caches.match(’./index.html’));
})
);
});
