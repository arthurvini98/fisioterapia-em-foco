export class NotesStore {
 constructor(onChange=()=>{}){this.entries=new Map();this.onChange=onChange;}
 entry(id){if(!this.entries.has(id))this.entries.set(id,{text:'',saved:'',version:0,loaded:false,loading:false,saving:false,error:'',conflict:null});return this.entries.get(id);}
 emit(id){this.onChange(id,this.entry(id));}
 async load(id){const e=this.entry(id);if(e.loaded||e.loading)return;e.loading=true;e.error='';this.emit(id);try{const r=await fetch('/api/notes?structure='+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)throw new Error('Não foi possível carregar a anotação. Tente novamente.');const data=await r.json();e.text=e.saved=data.body;e.version=data.version;e.loaded=true;}catch(error){e.error='Não foi possível carregar a anotação. Tente novamente.';}finally{e.loading=false;this.emit(id);}}
 edit(id,text){const e=this.entry(id);if(!e.loaded)return;e.text=text;this.emit(id);}
 async save(id){const e=this.entry(id);if(!e.loaded||e.saving||e.conflict)return false;e.saving=true;e.error='';const body=e.text;this.emit(id);
 try{const r=await fetch('/api/notes?structure='+encodeURIComponent(id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({body,version:e.version})});const data=await r.json();if(r.status===409){e.conflict=data.note;throw new Error('Há uma versão diferente salva na sua conta. Escolha qual texto manter.');}if(!r.ok)throw new Error('Não foi possível salvar. Seu texto continua aqui para tentar novamente.');e.saved=body;e.version=data.version;return true;}catch(error){e.error=e.conflict?'Há uma versão diferente salva na sua conta. Escolha qual texto manter.':'Não foi possível salvar. Seu texto continua aqui para tentar novamente.';return false;}finally{e.saving=false;this.emit(id);}}
 useServer(id){const e=this.entry(id);if(!e.conflict)return;e.text=e.saved=e.conflict.body;e.version=e.conflict.version;e.conflict=null;e.error='';this.emit(id);}
 keepDraft(id){const e=this.entry(id);if(!e.conflict)return;e.version=e.conflict.version;e.saved=e.conflict.body;e.conflict=null;e.error='';return this.save(id);}
 get hasUnsaved(){return [...this.entries.values()].some(e=>e.text!==e.saved||e.saving);}
}
