export async function collectStudy(fetcher=fetch){
 const responses=await Promise.all(['/api/progress','/api/notes?export=1'].map(url=>fetcher(url,{cache:'no-store'})));
 if(responses.some(response=>!response.ok))throw new Error('Export failed');
 const [progress,notes]=await Promise.all(responses.map(response=>response.json()));
 if(!Array.isArray(notes.notes)||!progress.lessons||!Array.isArray(progress.reviews))throw new Error('Invalid export data');
 return {format:'anatomia-em-foco-study',version:1,exportedAt:new Date().toISOString(),progress,notes:notes.notes};
}
export async function downloadStudy(){
 const data=await collectStudy();
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=`meus-estudos-${data.exportedAt.slice(0,10)}.json`;
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
