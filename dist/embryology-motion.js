export function motionCaption(kind){
 if(kind.startsWith('meiosis'))return 'Separação esquemática das células-filhas. Não representa o fuso, a segregação cromossômica ou todas as fases da divisão.';
 if(kind==='approach')return 'Aproximação do espermatozoide às camadas externas. A travessia das barreiras não está representada nesta animação.';
 if(kind==='fusion')return 'Aproximação à membrana após a travessia das barreiras. A fusão molecular não é representada.';
 if(kind==='activation')return 'Destaque dos grânulos corticais e do corpúsculo polar; não representa o tempo real de liberação.';
 if(kind==='route')return 'Destaque sequencial do trajeto esquemático; não representa velocidade ou escala reais.';
 return 'Rotação guiada para observar o interior. Você também pode pausar e girar manualmente.';
}
export function applyMotion(model,kind,value){
 const t=Math.max(0,Math.min(1,value)),ease=t*t*(3-2*t);
 model.root.rotation.y=(kind==='cell'||kind==='zygote')?ease*Math.PI*.65:0;
 for(const mesh of model.root.children){
  if(!mesh.userData.motionBase)mesh.userData.motionBase={position:mesh.position.clone(),scale:mesh.scale.clone(),emissive:mesh.material.emissive.clone()};
  const base=mesh.userData.motionBase,name=mesh.userData.label;
  mesh.position.copy(base.position);mesh.scale.copy(base.scale);
  if(mesh.userData.cellCenter){const p=mesh.userData.cellCenter;mesh.position.x-=p[0]*(1-ease)*.35;mesh.position.y-=p[1]*(1-ease)*.35;}
  if((kind==='approach'||kind==='fusion')&&['Cabeça do espermatozoide','Acrossomo','Cauda do espermatozoide'].includes(name))mesh.position.x+=(1-ease)*.8;
  if(kind==='activation'&&(name==='Grânulos corticais'||name==='Segundo corpúsculo polar'))mesh.scale.multiplyScalar(.35+.65*ease);
  if(kind==='route'&&name==='Trajeto dos espermatozoides'){const threshold=(base.position.y+1.6)/1.8;mesh.scale.multiplyScalar(t>=threshold?1:.3);}
 }
}
