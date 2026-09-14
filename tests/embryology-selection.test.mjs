import assert from 'node:assert/strict';
import {buildModel} from '../dist/embryology-models.js';
import {highlightPart} from '../dist/embryology-selection.js';
const model=buildModel('approach');
const zona=model.parts.get('Zona pelúcida')[0],membrane=model.parts.get('Membrana do ovócito')[0];
const color=zona.material.color.getHex(),opacity=zona.material.opacity;
highlightPart(model,'Zona pelúcida');assert.equal(zona.material.opacity,.94);assert.equal(membrane.material.opacity,.07);assert.equal(zona.material.color.getHex(),0xffc247);
highlightPart(model,'Membrana do ovócito');assert.equal(zona.material.opacity,.07);assert.equal(membrane.material.opacity,.94);
highlightPart(model);assert.equal(zona.material.opacity,opacity);assert.equal(zona.material.color.getHex(),color);assert.equal(zona.material.depthWrite,false);
console.log('PASS: layer highlight, switching selection and original appearance restored');

highlightPart(model,'Zona pelúcida',true);assert.equal(zona.visible,true);assert.equal(membrane.visible,false);highlightPart(model);assert.ok(model.root.children.every(mesh=>mesh.visible));
