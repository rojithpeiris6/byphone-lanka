const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..') + '/';
const ts = require(root + 'node_modules/typescript');
function load(file, dependencies, globals = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(root + file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(js, { exports, require: name => dependencies[name], URL, ...globals });
  return exports;
}
const listeners = new Map();
const window = { addEventListener: (name,fn)=>listeners.set(name,fn), removeEventListener: (name)=>listeners.delete(name), location: { origin: 'http://localhost:5173' }, dataLayer: [] };
const helper = load('src/lib/tracking/dataLayer.ts', {}, { window });
assert.equal(helper.sanitizeTrackedUrl('/shop?q=iphone&email=test%40example.com&token=secret#secret'), 'http://localhost:5173/shop?q=iphone');
assert.equal(helper.sanitizeTrackedUrl('/search?q=test%40example.com'), 'http://localhost:5173/search');
assert.equal(helper.sanitizeTrackedUrl('javascript:alert(1)'), null);
helper.trackVirtualPageView({ page_path: '/wrong', page_location: '/shop?phone=0771234567', page_title: 'Shop' });
assert.equal(window.dataLayer[0].page_path, '/shop');
assert.equal(window.dataLayer[0].page_location, 'http://localhost:5173/shop');
helper.pushDataLayer({ event: 'test', nested: { customerEmail: 'private', shipping_address: 'private', item_id: 'uuid' }, search_term: 'test@example.com' });
assert.deepEqual(JSON.parse(JSON.stringify(window.dataLayer[1])), { event: 'test', nested: { item_id: 'uuid' }, search_term: '[redacted]' });
const cyclic = { event: 'test' }; cyclic.self = cyclic;
assert.doesNotThrow(() => helper.pushDataLayer(cyclic));
window.dataLayer = { push() { throw Error('blocked'); } };
assert.doesNotThrow(() => helper.pushDataLayer({ event: 'test' }));
assert.doesNotThrow(() => load('src/lib/tracking/dataLayer.ts', {}).pushDataLayer({ event: 'ssr' }));

let state, effect, cleanup, observer;
const ref = { current: null }, frames = new Map(), sent = [];
let frameId = 0;
const document = { title: 'Home', head: {} };
const hook = load('src/lib/tracking/usePageTracking.ts', {
  react: { useRef: () => ref, useEffect: fn => { effect = fn; } },
  '@tanstack/react-router': { useRouterState: ({ select }) => select(state) },
  './consent': { getTrackingConsent: () => ({analytics:true,marketing:false}), CONSENT_EVENT: 'consent' },
  './dataLayer': { sanitizeTrackedUrl: helper.sanitizeTrackedUrl, trackVirtualPageView: event => sent.push(event) },
}, {
  window, document,
  MutationObserver: class { constructor(fn) { this.fn = fn; observer = this; } observe() {} disconnect() {} },
  requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
  cancelAnimationFrame: id => frames.delete(id),
});
function render(path, title, ready = true) {
  if (cleanup) cleanup();
  state = { location: { href: path, pathname: path.split('?')[0] }, status: ready ? 'idle' : 'pending', isLoading: !ready, matches: [{ meta: [{ title }] }] };
  hook.usePageTracking(); cleanup = effect();
}
function flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); }
render('/', 'Home'); flush(); assert.equal(sent.length, 1);
render('/', 'Home'); flush(); assert.equal(sent.length, 1);
render('/shop', 'Shop', false); flush(); assert.equal(sent.length, 1);
render('/shop', 'Shop'); flush(); assert.equal(sent.length, 1);
document.title = 'Shop'; observer.fn(); flush(); assert.equal(sent.length, 2); assert.equal(sent[1].page_title, 'Shop');
render('/', 'Home'); document.title = 'Home'; observer.fn(); flush(); assert.equal(sent.length, 3);
render('/admin/orders', 'Admin'); flush(); assert.equal(sent.length, 3);
render('/', 'Home'); flush(); assert.equal(sent.length, 4);
render('/brands', 'Brands'); render('/contact', 'Contact'); document.title = 'Contact'; observer.fn(); flush();
assert.equal(sent.length, 5); assert.equal(sent[4].page_path, '/contact');
console.log('PASS: URL filtering, nested privacy filtering, SSR/failure isolation, initial load, same-route deduplication, idle/title timing, Back navigation, admin exclusion, and cancelled navigation.');
const rootSource=fs.readFileSync(root+'src/routes/__root.tsx','utf8');
const loader=rootSource.match(/__html: `([\s\S]*?)`/)[1];
for (const gateway of [false,true]) {
  let inserted=0;
  const win=gateway?{google_tags_first_party:['GTM-5NC48789']}:{ };
  const doc={getElementsByTagName:()=>[{parentNode:{insertBefore:()=>inserted++}}],createElement:()=>({})};
  const ctx=vm.createContext({window:win,document:doc});
  vm.runInContext(loader,ctx); vm.runInContext(loader,ctx);
  assert.equal(inserted,gateway?0:1);
  assert.equal(win.dataLayer?.length??0,gateway?0:1);
}
console.log('PASS: GTM loads once locally and skips the original loader when Cloudflare gateway owns the container.');
