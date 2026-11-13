const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..') + '/';
const ts = require('typescript');
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(root + file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(js,{exports,require:name=>dependencies[name]??require(name),URL,Buffer,Date,...globals});
  return exports;
}
const storage = new Map(), pushed=[];
const localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
let consent={analytics:false,marketing:false};
const commerce=load('src/lib/tracking/ecommerce.ts',{'./dataLayer':{pushDataLayer:event=>pushed.push(event)},'./consent':{getTrackingConsent:()=>consent}},{localStorage});
const item={item_id:'a1b2c3d4-e5f6-7890-abcd-ef1234567890',item_name:'Phone',price:100.25,quantity:2};
assert.equal(commerce.trackEcommerce('view_item',[item]),false);
assert.equal(pushed.length,0);
consent={analytics:true,marketing:false};
assert.equal(commerce.trackEcommerce('add_to_cart',[item]),true);
assert.equal(pushed[0].ecommerce,null);
assert.equal(pushed[1].ecommerce.value,200.5);
assert.equal(pushed[1].ecommerce.currency,'LKR');
for(const invalid of [{...item,item_id:'sku'}, {...item,price:NaN}, {...item,quantity:0}, {...item,quantity:1.5}]) assert.equal(commerce.trackEcommerce('view_item',[invalid]),false);
commerce.trackSearch('iphone');assert.equal(pushed.at(-2).ecommerce,null);assert.equal(pushed.at(-1).search_term,'iphone');
const purchase={currency:'LKR',value:200.5,items:[item],transaction_id:'TEST-UNIT-ONLY',shipping:490};
assert.equal(commerce.trackPurchaseOnce(purchase),true);
assert.equal(pushed.at(-1).ecommerce.value,200.5); // Excludes shipping.
assert.equal(commerce.trackPurchaseOnce(purchase),false);
const reload=load('src/lib/tracking/ecommerce.ts',{'./dataLayer':{pushDataLayer:event=>pushed.push(event)},'./consent':{getTrackingConsent:()=>consent}},{localStorage});
assert.equal(reload.trackPurchaseOnce(purchase),false);
console.log('PASS: consent gating, UUID/numeric validation, ecommerce reset, search payload, shipping exclusion, and persistent purchase deduplication.');

const browser={localStorage,dataLayer:[],dispatchEvent:()=>{}};
const privacy=load('src/lib/tracking/consent.ts',{}, {window:browser,Event:class {constructor(type){this.type=type;}}});
assert.equal(privacy.getTrackingConsent().analytics,false);
vm.runInNewContext(privacy.CONSENT_BOOTSTRAP,{window:browser});
assert.equal(browser.dataLayer[0][2].analytics_storage,'denied');
privacy.saveTrackingConsent({analytics:true,marketing:false});
assert.equal(browser.dataLayer[1][2].analytics_storage,'granted');
assert.equal(browser.dataLayer[1][2].ad_storage,'denied');
assert.equal(browser.dataLayer.at(-1).event,'tracking_analytics_granted');
privacy.saveTrackingConsent({analytics:false,marketing:false});
assert.equal(privacy.getTrackingConsent().analytics,false);
console.log('PASS: optional storage denied by default, separate explicit choices, and consent withdrawal.');

let now=Date.now();
class Clock extends Date {static now(){return now;}}
const receipt=load('src/lib/tracking/receipt.server.ts',{}, {process:{env:{TRACKING_RECEIPT_SECRET:'unit-test-secret-never-used-outside-tests'}},Date:Clock});
const orderId='11111111-1111-4111-8111-111111111111';
const token=receipt.issueTrackingReceipt(orderId);
assert.equal(receipt.verifyTrackingReceipt(token),orderId);
assert.equal(receipt.verifyTrackingReceipt(token+'tampered'),null);
assert.equal(receipt.verifyTrackingReceipt('orderNumber=TEST'),null);
now+=8*86400000;assert.equal(receipt.verifyTrackingReceipt(token),null);now=Date.now();
assert.equal(load('src/lib/tracking/receipt.server.ts',{}, {process:{env:{}}}).issueTrackingReceipt(orderId),null);
console.log('PASS: signed receipt integrity, expiry, URL forgery rejection, and missing-config safety.');

const catalog=load('src/lib/tracking/catalog.server.ts',{'@/integrations/supabase/client':{supabase:{}}});
const product={id:item.item_id,slug:'phone-plus',name:'Phone & Plus',description:'<p>Original</p>',short_description:null,price:200,discount_price:150,stock_quantity:0,sku:null,brands:{name:'Brand'},categories:{name:'Phones'},product_images:[{url:'https://example.com/phone.jpg',sort_order:0}],product_variants:[{stock_quantity:2}],flash_sales:[{sale_price:125,is_active:true,start_at:new Date(now-1000).toISOString(),end_at:new Date(now+1000).toISOString()}]};
const rows=catalog.catalogRows([product],now);
assert.equal(rows[0].id,item.item_id);assert.equal(rows[0].price,'125.00 LKR');assert.equal(rows[0].availability,'in stock');
const xml=catalog.renderCatalog([product],'xml');assert.ok(xml.includes('Phone &amp; Plus'));assert.ok(xml.includes('<g:id>'+item.item_id+'</g:id>'));
assert.equal(catalog.catalogRows([{...product,product_images:[]}]).length,0);
console.log('PASS: catalog/event UUID parity, active sale pricing, variant availability, XML escaping, and missing-image exclusion.');

(async()=>{
  let order={order_number:'TEST-UNIT-ONLY',status:'pending',payment_method:'cod',payment_status:'pending',shipping_fee:490,total:690.5,order_items:[{product_id:item.item_id,price:100.25,quantity:2,products:{name:'Phone'}}]};
  const serverFn={createServerFn:()=>({inputValidator:()=>({handler:fn=>fn})})};
  const api=load('src/lib/api/purchases.functions.ts',{'@tanstack/react-start':serverFn,'@/lib/tracking/receipt.server':receipt,'@/integrations/supabase/client.server':{supabaseAdmin:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:order,error:null})})})})}}});
  assert.equal((await api.confirmedPurchase({data:{receipt:token}})).value,200.5);
  order={...order,status:'cancelled'};assert.equal(await api.confirmedPurchase({data:{receipt:token}}),null);
  order={...order,status:'pending',payment_method:'card'};assert.equal(await api.confirmedPurchase({data:{receipt:token}}),null);
  order={...order,payment_status:'paid'};assert.equal((await api.confirmedPurchase({data:{receipt:token}})).transaction_id,'TEST-UNIT-ONLY');
  order={...order,total:999};assert.equal(await api.confirmedPurchase({data:{receipt:token}}),null);
  assert.equal(await api.confirmedPurchase({data:{receipt:'not-a-signed-receipt'}}),null);
  console.log('PASS: server purchase policy rejects cancelled/unpaid/inconsistent orders and accepts verified COD/paid fixtures. No database writes or real conversions.');
})().catch(error=>{console.error(error);process.exitCode=1;});

const subscription = load('src/lib/tracking/ideamart.ts', {'./dataLayer':{pushDataLayer:event=>pushed.push(event)},'./consent':{getTrackingConsent:()=>consent}});
consent={analytics:false,marketing:false};
assert.equal(subscription.trackIdeamartSubscription(item.item_id,'private-ref',true),false);
consent={analytics:true,marketing:false};
assert.equal(subscription.trackIdeamartSubscription(item.item_id,'private-ref',true),true);
assert.equal(pushed.at(-1).event,'ideamart_subscription_1');
assert.equal(pushed.at(-1).event_label,'Ideamart Subscription 1');
assert.equal(JSON.stringify(pushed.at(-1)).includes('private-ref'),false);
assert.equal(subscription.trackIdeamartSubscription(item.item_id,'private-ref',true),false);
assert.equal(subscription.trackIdeamartSubscription('invalid','new-ref',true),false);
console.log('PASS: Ideamart verified event label, privacy gating, UUID validation and reference deduplication without transmitting the reference.');

assert.equal(subscription.trackIdeamartSubscription(item.item_id,'unconfirmed',false),false);
assert.equal(subscription.trackIdeamartStage(item.item_id,'phone_submitted'),true);
assert.equal(pushed.at(-1).event,'ideamart_phone_submitted');
assert.equal(subscription.trackIdeamartStage(item.item_id,'otp_submitted'),true);
assert.equal(pushed.at(-1).event,'ideamart_otp_submitted');
assert.equal(Object.keys(pushed.at(-1)).sort().join(','),'event,event_label,funnel_step,item_id,method,placement');
console.log('PASS: phone/OTP attempt stages and explicit provider registration confirmation gate.');
