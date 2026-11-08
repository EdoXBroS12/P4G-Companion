// Build the app archive, then ZIP Electron's documented manual distribution.
// The shipped runtime is byte-identical to upstream; Windows policy is unchanged.
const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const cli=require.resolve('electron-builder/cli.js');
function run(file,args=[]){const r=cp.spawnSync(process.execPath,[file,...args],{cwd:root,stdio:'inherit',windowsHide:true});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
run(cli,['--win','--dir','--x64','--publish','never']);
run(path.join(__dirname,'prepare-manual-distribution.cjs'));
run(path.join(__dirname,'archive-manual-distribution.cjs'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(path.join(root,'node_modules/electron/dist/electron.exe')),hash(path.join(root,'native-repair/runtime-preserved/P4G Companion.exe')),'Packaging mutated the upstream runtime.');
assert.equal(hash(path.join(root,'dist/win-unpacked/resources/app.asar')),hash(path.join(root,'native-repair/runtime-preserved/resources/app.asar')),'Packaging changed app contents.');
console.log('Windows ZIP verified: original runtime, unchanged app archive, no self-extracting launcher.');
