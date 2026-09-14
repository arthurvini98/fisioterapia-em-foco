export function readPreferences(storage){
 try{const data=JSON.parse(storage.getItem('embryology-preferences'));return {speed:[.5,1,2].includes(data?.speed)?data.speed:1,cut:typeof data?.cut==='boolean'?data.cut:true};}catch{return {speed:1,cut:true};}
}
export function savePreferences(storage,speed,cut){try{storage.setItem('embryology-preferences',JSON.stringify({speed,cut}));return true;}catch{return false;}}
export function shortcutAction(event){
 if(event.defaultPrevented||event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||event.target?.closest?.('input,select,textarea,button,a,summary,[contenteditable="true"]'))return null;
 return {ArrowRight:'next',ArrowLeft:'prev',' ':'play',Home:'reset'}[event.key]||null;
}
