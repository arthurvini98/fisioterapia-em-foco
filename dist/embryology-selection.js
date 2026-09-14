export function highlightPart(model,name=null){
 for(const [label,meshes] of model.parts)for(const mesh of meshes){
  const material=mesh.material;
  if(!mesh.userData.originalAppearance)mesh.userData.originalAppearance={color:material.color.clone(),emissive:material.emissive.clone(),opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite,renderOrder:mesh.renderOrder};
  const base=mesh.userData.originalAppearance,selected=label===name;
  material.color.copy(base.color);material.emissive.copy(base.emissive);
  material.opacity=base.opacity;material.transparent=base.transparent;material.depthWrite=base.depthWrite;mesh.renderOrder=base.renderOrder;
  if(name){material.color.set(selected?0xffc247:base.color);material.emissive.set(selected?0x654000:0);material.opacity=selected?.94:.07;material.transparent=true;material.depthWrite=selected;mesh.renderOrder=selected?2:0;}
  material.needsUpdate=true;
 }
}
