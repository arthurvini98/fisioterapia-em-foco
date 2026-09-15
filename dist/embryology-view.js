import {buildModel} from './embryology-models.js';
import {applyMotion} from './embryology-motion.js';
import {highlightPart} from './embryology-selection.js';
export function modelAtMoment(kind,cut,moment,selected=null,isolated=false){
 const model=buildModel(kind,cut);applyMotion(model,kind,moment);highlightPart(model,selected,isolated);return model;
}
export function disposeModel(model){model.root.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});}
