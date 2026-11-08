const {app,BrowserWindow,ipcMain,globalShortcut,Menu,dialog,shell,screen}=require('electron');
const fs=require('fs'),path=require('path');
const ROOT=__dirname,CONTENT=path.join(ROOT,'content');
const qaIndex=process.argv.indexOf('--qa-data');if(qaIndex>=0&&process.argv[qaIndex+1])app.setPath('userData',path.resolve(process.argv[qaIndex+1]));
let win,compact=false,pinned=false,normalBounds,closing=false,overlayBounds,wasMaximized=false,pinBeforeCompact=false,mousePassthrough=false,passthroughShortcutReady=false;
const storePath=()=>path.join(app.getPath('userData'),'progress.json');
const initial=()=>({schema:1,activeProfile:'comune',profiles:{comune:{name:'Comune · prima dei bivi',checks:{},quests:{},notes:{},fusionLevels:{}}},endings:{},fusionLevels:{},settings:{font:100,opacity:1,language:'it',personalContext:false},lastView:'home'});
let state;
function record(v){return v&&typeof v==='object'&&!Array.isArray(v);}
function validate(s){return s&&s.schema===1&&record(s.profiles)&&s.profiles[s.activeProfile]&&Object.values(s.profiles).every(p=>record(p)&&typeof p.name==='string'&&record(p.checks)&&record(p.quests)&&record(p.notes))&&record(s.endings)&&record(s.fusionLevels)&&record(s.settings)&&Number.isFinite(s.settings.font)&&Number.isFinite(s.settings.opacity)&&JSON.stringify(s).length<5000000;}
function readState(){for(const suffix of ['', '.bak'])try{const s=JSON.parse(fs.readFileSync(storePath()+suffix,'utf8'));if(validate(s))return s}catch{}return initial();}
function saveState(s){if(!validate(s))throw Error('File progressi non valido');fs.mkdirSync(path.dirname(storePath()),{recursive:true});const tmp=storePath()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(s,null,2),'utf8');if(fs.existsSync(storePath()))fs.copyFileSync(storePath(),storePath()+'.bak');fs.renameSync(tmp,storePath());state=s;return true;}
function windowState(){return {compact,pinned,mousePassthrough,canPassthrough:passthroughShortcutReady,opacity:win?.getOpacity()||1,visible:win?.isVisible()};}
function notify(){if(win&&!win.isDestroyed())win.webContents.send('window-state',windowState());}
function setMousePassthrough(value){
 if(value&&(!compact||!passthroughShortcutReady))throw Error('La scorciatoia per riattivare i clic non è disponibile.');
 mousePassthrough=compact&&Boolean(value);win.setIgnoreMouseEvents(mousePassthrough,{forward:true});win.setFocusable(!mousePassthrough);
 if(!mousePassthrough&&compact)win.focus();notify();
}
function toggleCompact(){
 if(!win)return;
 if(!compact){
  wasMaximized=win.isMaximized();normalBounds=wasMaximized?win.getNormalBounds():win.getBounds();pinBeforeCompact=pinned;
  if(wasMaximized)win.unmaximize();compact=true;
  const area=screen.getDisplayMatching(normalBounds).workArea;
  win.setMinimumSize(360,280);
  const wanted=overlayBounds||{x:area.x+area.width-460,y:area.y+35,width:440,height:Math.min(area.height-70,600)};
  win.setBounds({x:Math.max(area.x,Math.min(wanted.x,area.x+area.width-360)),y:Math.max(area.y,Math.min(wanted.y,area.y+area.height-280)),width:Math.min(wanted.width,area.width),height:Math.min(wanted.height,area.height)});
  pinned=true;win.setAlwaysOnTop(true,'floating');
 }else{
  overlayBounds=win.getBounds();setMousePassthrough(false);compact=false;pinned=pinBeforeCompact;win.setAlwaysOnTop(pinned,'floating');
  win.setMinimumSize(980,650);win.setBounds(normalBounds||{width:1360,height:900});if(wasMaximized)win.maximize();win.show();win.focus();
 }
 notify();
}
function togglePin(){pinned=!pinned;win.setAlwaysOnTop(pinned,'floating');notify();}
function toggleVisible(){if(win.isVisible()&&!win.isMinimized())win.hide();else{win.showInactive();if(win.isMinimized())win.restore();}notify();}
const safeRelative=p=>{if(typeof p!=='string'||p.includes('\0'))throw Error('Percorso non valido');const full=path.resolve(CONTENT,p);if(!full.startsWith(CONTENT+path.sep))throw Error('Percorso esterno alla guida');return full;};
function createWindow(){
 win=new BrowserWindow({width:1420,height:940,minWidth:980,minHeight:650,show:false,backgroundColor:'#111219',title:'P4G Companion',autoHideMenuBar:true,icon:path.join(ROOT,'build/icon.ico'),webPreferences:{preload:path.join(ROOT,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.setOpacity(Math.max(.65,Math.min(1,state.settings.opacity||1)));
 win.loadFile(path.join(ROOT,'src/index.html'));
 win.once('ready-to-show',()=>{if(!process.argv.includes('--self-test'))win.show();notify();if(process.argv.includes('--self-test'))setTimeout(async()=>{try{const result=await win.webContents.executeJavaScript(`({title:document.title,hero:document.querySelector('.hero h1')?.textContent||'',routes:document.querySelectorAll('.sidebar [data-nav^="ending:"]').length,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})`);fs.mkdirSync(app.getPath('userData'),{recursive:true});fs.writeFileSync(path.join(app.getPath('userData'),'self-test.json'),JSON.stringify({...result,packaged:app.isPackaged,version:app.getVersion()},null,2));}finally{app.quit()}},1500);});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(ev,url)=>{if(url!==win.webContents.getURL())ev.preventDefault()});
 win.on('close',()=>{closing=true;if(state)saveState(state)});
 const keys=[['Control+Shift+Space',toggleVisible],['Control+Shift+O',toggleCompact],['Control+Shift+T',togglePin],['Control+Shift+I',()=>{if(compact)setMousePassthrough(!mousePassthrough)}]];
 const shortcuts={};for(const[key,fn]of keys)shortcuts[key]=globalShortcut.register(key,fn);passthroughShortcutReady=!!shortcuts['Control+Shift+I'];
 win.webContents.on('did-finish-load',()=>win.webContents.send('shortcut-status',shortcuts));
}
app.whenReady().then(()=>{
 state=readState();Menu.setApplicationMenu(null);
 ipcMain.handle('data',()=>({guide:JSON.parse(fs.readFileSync(path.join(CONTENT,'data/guide_content.json'))),quests:JSON.parse(fs.readFileSync(path.join(CONTENT,'data/quests.json'))),saves:JSON.parse(fs.readFileSync(path.join(CONTENT,'data/save_plan.json'))),manifest:JSON.parse(fs.readFileSync(path.join(CONTENT,'data/manifest.json'))),margaret:JSON.parse(fs.readFileSync(path.join(CONTENT,'Margaret_Fusioni/data/guide_content.json'))),margaretManifest:JSON.parse(fs.readFileSync(path.join(CONTENT,'Margaret_Fusioni/data/manifest.json'))),fusion:JSON.parse(fs.readFileSync(path.join(CONTENT,'Margaret_Fusioni/data/fusion_data.json'))),state}));
 ipcMain.handle('endings-data',()=>JSON.parse(fs.readFileSync(path.join(CONTENT,'data/endings_research.json'))));
 ipcMain.handle('translations',()=>{const out={};for(const name of ['guide','quests','margaret','interface','core','overlay','workspace','dialogs']){const p=path.join(ROOT,'src/locales',name+'.en.json');if(fs.existsSync(p))Object.assign(out,JSON.parse(fs.readFileSync(p,'utf8')))}return out;});
 ipcMain.handle('save-state',(_,s)=>saveState(s));
 ipcMain.on('save-state-sync',(ev,s)=>{try{ev.returnValue={ok:saveState(s)}}catch(err){ev.returnValue={ok:false,error:err.message}}});
 ipcMain.handle('window',(_,action,value)=>{if(action==='compact')toggleCompact();if(action==='passthrough')setMousePassthrough(!mousePassthrough);if(action==='pin')togglePin();if(action==='hide')toggleVisible();if(action==='minimize')win.minimize();if(action==='opacity'){const v=Math.max(.65,Math.min(1,Number(value)||1));win.setOpacity(v);state.settings.opacity=v;saveState(state);notify();}return windowState();});
 ipcMain.handle('export-state',async()=>{const {filePath}=await dialog.showSaveDialog(win,{title:'Esporta tutti i progressi e i rami',defaultPath:'P4G_Companion_progressi.json',filters:[{name:'Progressi JSON',extensions:['json']}]});if(filePath){fs.writeFileSync(filePath,JSON.stringify(state,null,2));return true}return false;});
 ipcMain.handle('import-state',async()=>{const {filePaths}=await dialog.showOpenDialog(win,{title:'Importa progressi Companion',properties:['openFile'],filters:[{name:'Progressi JSON',extensions:['json']}]});if(!filePaths[0])return null;let next=JSON.parse(fs.readFileSync(filePaths[0],'utf8'));if(!validate(next))throw Error('Formato Companion non valido');saveState(next);return state;});
 ipcMain.handle('open-document',async(_,relative)=>{const src=safeRelative(relative);if(!['.pdf','.md','.txt','.csv','.json'].includes(path.extname(src).toLowerCase()))throw Error('Formato non supportato');const folder=path.join(app.getPath('userData'),'documenti');fs.mkdirSync(folder,{recursive:true});const dest=path.join(folder,path.basename(src));fs.copyFileSync(src,dest);return shell.openPath(dest);});
 ipcMain.handle('open-source',async(_,url)=>{if(typeof url==='string'&&/^https:\/\//.test(url))await shell.openExternal(url);});
 ipcMain.handle('progress-folder',()=>shell.openPath(app.getPath('userData')));
 createWindow();
});
app.on('window-all-closed',()=>app.quit());
app.on('will-quit',()=>globalShortcut.unregisterAll());
app.on('second-instance',()=>{if(win){win.show();win.focus()}});
if(!app.requestSingleInstanceLock())app.quit();
