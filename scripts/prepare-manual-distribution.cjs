// Electron's documented manual app.asar distribution: leave runtime bytes intact.
// This does not change Windows policy, certificate stores, fuses or app code.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {getCurrentFuseWire}=require('@electron/fuses');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'node_modules/electron/dist');
const output=path.join(root,'native-repair/runtime-preserved');
const archive=path.join(root,'dist/win-unpacked/resources/app.asar');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
  assert.ok(fs.existsSync(archive),'Build the app archive before packaging.');
  const originalWire=await getCurrentFuseWire(path.join(source,'electron.exe'));
  const previousWire=await getCurrentFuseWire(path.join(root,'dist/win-unpacked/P4G Companion.exe'));
  assert.deepEqual(previousWire,originalWire,'Do not discard security-fuse settings from the app.');
  fs.mkdirSync(output,{recursive:true});
  fs.cpSync(source,output,{recursive:true,force:true});
  fs.renameSync(path.join(output,'electron.exe'),path.join(output,'P4G Companion.exe'));
  fs.copyFileSync(archive,path.join(output,'resources/app.asar'));
  const binaries=[];
  function check(dir,relative=''){
    for(const item of fs.readdirSync(dir,{withFileTypes:true})){
      const rel=path.join(relative,item.name),src=path.join(dir,item.name);
      if(item.isDirectory())check(src,rel);
      else if(/\.(exe|dll)$/i.test(item.name)){
        const target=rel==='electron.exe'?'P4G Companion.exe':rel;
        const got=hash(path.join(output,target)),expected=hash(src);assert.equal(got,expected,rel);binaries.push({file:target,sha256:got});
      }
    }
  }
  check(source);
  assert.equal(hash(path.join(output,'P4G Companion.exe')),hash(path.join(source,'electron.exe')));
  const report={status:'PASS',method:'Electron manual distribution with app.asar',runtime_version:fs.readFileSync(path.join(source,'version'),'utf8').trim(),runtime_sha256:hash(path.join(source,'electron.exe')),archive_sha256:hash(archive),security_fuses_unchanged:true,windows_security_changes:false,binaries};
  fs.writeFileSync(path.join(root,'native-repair/PACKAGING.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,output,runtime_sha256:report.runtime_sha256,binaries:binaries.length,security_fuses_unchanged:true},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
