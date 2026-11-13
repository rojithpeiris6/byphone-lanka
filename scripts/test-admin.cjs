const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
let header = null, user = null, role = null, roleReads = 0, continued = 0;
const deps = {
  '@tanstack/react-start': {createMiddleware:()=>({server:handler=>handler})},
  '@tanstack/react-start/server': {getRequest:()=>({headers:{get:()=>header}})},
  '@/integrations/supabase/client.server': {supabaseAdmin:{
    auth:{getUser:async()=>({data:{user},error:null})},
    from:()=>{roleReads++; const query={select:()=>query,eq:()=>query,maybeSingle:async()=>({data:role,error:null})};return query;}
  }}
};
const exportsForTest = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/lib/api/admin-middleware.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsForTest,require:name=>deps[name]});
(async()=>{
 const run=()=>exportsForTest.requireAdmin({next:async()=>{continued++;}});
 await assert.rejects(run,/Unauthorized/); assert.equal(roleReads,0);
 header='Bearer invalid'; await assert.rejects(run,/Unauthorized/); assert.equal(roleReads,0);
 user={id:'verified-user'}; await assert.rejects(run,/Forbidden/); assert.equal(continued,0);
 role={role:'admin'}; await run(); assert.equal(continued,1);
 for(const file of ['admin-reports.functions.ts','settings.functions.ts']) {
   const source=fs.readFileSync(path.join(root,'src/lib/api',file),'utf8');
   assert.equal((source.match(/createServerFn\(/g)||[]).length,(source.match(/\.middleware\(\[requireAdmin\]\)/g)||[]).length);
 }
 console.log('PASS: privileged report/settings handlers reject missing/invalid tokens and non-admin users before allowing verified admins.');
})().catch(error=>{console.error(error);process.exitCode=1;});
