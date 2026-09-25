export const pieces={
 pelve:{name:'Pelve e sacro',description:'Osso do quadril direito e sacro. Use as vistas lateral e medial para distinguir as faces. Os pontos dos forames identificam suas aberturas.',sketchfab:'8f02c244a70a46c581f7dba6423ad374',external:'https://sketchfab.com/3d-models/android-pelvis-8f02c244a70a46c581f7dba6423ad374'},
 lombar:{name:'Vértebra lombar · L3',description:'Vértebra isolada: corpo anterior, arco posterior e forame central. A vista superior facilita reconhecer pedículo, lâmina e processos.',sketchfab:'69ae7236c9cc41238cdddd1e5b3015ff',external:'https://sketchfab.com/3d-models/vertebra-lumbar-lumbar-vertebrae-69ae7236c9cc41238cdddd1e5b3015ff'},
 clavicula:{name:'Clavícula direita',description:'Compare extremidade esternal, medial e mais volumosa, com extremidade acromial, lateral e achatada.'},
 esterno:{name:'Esterno',description:'Três partes do mesmo osso: manúbrio acima, corpo no meio e processo xifoide abaixo.'},
 mao:{name:'Mão direita · carpo e metacarpo',description:'Oito carpais e cinco metacarpais identificados. Polegar lateral. As falanges aparecem como contexto, sem pontos neste roteiro.'},
 pe:{name:'Pé direito · tarso e metatarso',description:'Sete tarsais e cinco metatarsais identificados. Hálux medial. A vista superior ajuda a comparar os metatarsais.'}
};
export const directions={front:[0,0,1],back:[0,0,-1],lateral:[-1,0,0],medial:[1,0,0],top:[0,1,0],bottom:[0,-1,0]};
export function pieceRoute(hash){const p=new URLSearchParams(hash.replace(/^#/,''));return {piece:Object.hasOwn(pieces,p.get('peca'))?p.get('peca'):'pelve',point:p.get('ponto')||null};}
export function pieceLink(piece,point){return 'pecas.html#'+new URLSearchParams({peca:piece,...point?{ponto:point}:{}});}
