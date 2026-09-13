import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist'),assets={};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.bin':'application/octet-stream','.txt':'text/plain; charset=utf-8'};
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(item.name==='server'||item.name==='.openai')continue;const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else assets['/'+path.relative(root,p).replaceAll('\\','/')]={type:types[path.extname(p)]||'application/octet-stream',data:fs.readFileSync(p).toString('base64')};}}
walk(root);
const ids=[...JSON.parse(fs.readFileSync('dist/skeleton.json')).meshes.map(m=>m.name),...JSON.parse(fs.readFileSync('dist/shoulder.json')).meshes.map(m=>m.id)];
const strip=s=>s.replace(/^import .*;\n/gm,'').replaceAll('export ','');
const code=[strip(fs.readFileSync('dist/lesson-data.js','utf8')),strip(fs.readFileSync('worker/progress.js','utf8')),strip(fs.readFileSync('worker/notes.js','utf8')),strip(fs.readFileSync('worker/index.js','utf8')),`const assets=${JSON.stringify(assets)};\nexport default createWorker(assets,new Set(${JSON.stringify(ids)}));`].join('\n');
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});fs.writeFileSync('dist/server/index.js',code);fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log(`Built Worker with ${Object.keys(assets).length} assets and account-scoped progress.`);
