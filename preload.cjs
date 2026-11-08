const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('p4g',{
 getData:()=>ipcRenderer.invoke('data'),getEndings:()=>ipcRenderer.invoke('endings-data'),getTranslations:()=>ipcRenderer.invoke('translations'),saveState:s=>{const r=ipcRenderer.sendSync('save-state-sync',s);return r.ok?Promise.resolve(true):Promise.reject(new Error(r.error));},
 window:(a,v)=>ipcRenderer.invoke('window',a,v),
 exportState:()=>ipcRenderer.invoke('export-state'),importState:()=>ipcRenderer.invoke('import-state'),
 openDocument:p=>ipcRenderer.invoke('open-document',p),openSource:u=>ipcRenderer.invoke('open-source',u),
 progressFolder:()=>ipcRenderer.invoke('progress-folder'),
 onWindow:fn=>ipcRenderer.on('window-state',(_,s)=>fn(s)),onShortcuts:fn=>ipcRenderer.on('shortcut-status',(_,s)=>fn(s))
});
