import * as T from './vendor/three.module.js';
export function buildModel(kind,cut=true){
 const root=new T.Group(),parts=new Map();
 function add(geometry,color,name,pos=[0,0,0],opacity=1){const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.6,transparent:opacity<1,opacity,side:T.DoubleSide,depthWrite:opacity===1}));m.position.set(...pos);m.userData.label=name;root.add(m);if(!parts.has(name))parts.set(name,[]);parts.get(name).push(m);return m;}
 function ball(r,c,n,p=[0,0,0],shell=false){return add(new T.SphereGeometry(r,32,20,0,shell&&cut?Math.PI*1.5:Math.PI*2),c,n,p,shell?.28:1);}
 function tube(points,r,c,n){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),36,r,8,false),c,n);}
 function chromosome(x,y,z,c,duplicated=true){tube([[x-.1,y-.23,z],[x,y,z],[x+.1,y+.23,z]],.035,c,'Cromossomos (exemplos)');if(duplicated)tube([[x+.1,y-.23,z],[x,y,z],[x-.1,y+.23,z]],.035,c,'Cromossomos (exemplos)');}
 function sperm(x){ball(.13,0x86caff,'Cabeça do espermatozoide',[x,0,.1]).scale.set(1.4,.7,.7);ball(.08,0xf08aac,'Acrossomo',[x-.13,0,.1]);tube([[x+.16,0,.1],[x+.5,.1,.1],[x+.8,-.1,.1],[x+1.1,.05,.1]],.022,0x86caff,'Cauda do espermatozoide');}
 if(kind==='cell'){
 ball(1.6,0x6ccdc1,'Membrana plasmática',[0,0,0],true);ball(.67,0x9983d5,'Núcleo',[0,0,0],true);
 for(let i=0;i<5;i++)tube([[-.4+i*.16,-.35,.2],[-.3+i*.16,.1,.35],[-.45+i*.16,.4,.1]],.025,0xf7a1c0,'Cromatina');
 for(let i=0;i<6;i++){const a=i*Math.PI/3;ball(.17,0xffb779,'Mitocôndrias',[Math.cos(a)*1.05,Math.sin(a)*1.05,0]).scale.set(1.6,.7,.7);}
 }else if(kind.startsWith('meiosis')){
 const second=kind==='meiosis2',centers=second?[[-1,-.85,0],[1,-.85,0],[-1,.85,0],[1,.85,0]]:[[-1,0,0],[1,0,0]];
 centers.forEach((p,i)=>{const first=root.children.length;ball(.77,0x6ccdc1,`Célula ${i+1} · 23 cromossomos`,p,true);chromosome(p[0]-.22,p[1],.1,0xf49ab7,!second);chromosome(p[0]+.22,p[1],.1,0x89bfff,!second);root.children.slice(first).forEach(mesh=>{mesh.userData.cellCenter=p;});});
 }else if(kind==='route'){
 ball(.65,0xd5859c,'Útero',[0,-.35,0]).scale.set(.85,1.2,.5);tube([[0,-1,0],[0,-1.45,0],[0,-2,0]],.19,0xcaa1c9,'Vagina e colo uterino');
 tube([[0,.2,0],[.7,.75,0],[1.45,.85,0],[1.85,.35,0]],.13,0xf4b3b2,'Tuba uterina');ball(.35,0x9acbc3,'Ovário',[1.9,-.2,0]);
 ball(.16,0xffdc77,'Ampola · local habitual da fertilização',[1.45,.85,.2]);
 for(let i=0;i<4;i++)ball(.065,0x86caff,'Trajeto dos espermatozoides',[0,-1.6+i*.43,.35]);
 }else{
 ball(1.15,0xe798b1,'Membrana do ovócito',[0,0,0],true);ball(1.36,kind==='activation'?0xffa64e:0xffd986,'Zona pelúcida',[0,0,0],true);
 for(let i=0;i<26;i++){const a=i*Math.PI*2/26;ball(.14,0x7fd5bd,'Corona radiata',[Math.cos(a)*1.55,Math.sin(a)*1.55,-.1]);}
 if(kind==='approach'||kind==='fusion')sperm(kind==='approach'?1.95:1.12);
 if(kind==='activation'){for(let i=0;i<16;i++){const a=i*Math.PI*2/16;ball(.06,0xffac60,'Grânulos corticais',[Math.cos(a)*1.04,Math.sin(a)*1.04,.12]);}ball(.12,0xbeb0ed,'Segundo corpúsculo polar',[-1.18,.35,.1]);}
 if(kind==='zygote'){ball(.33,0xf7a1c0,'Pronúcleo materno',[-.43,0,.2]);ball(.33,0x86caff,'Pronúcleo paterno',[.43,0,.2]);}
 else{chromosome(-.25,.15,.2,0xf7a1c0,kind!=='activation');chromosome(.2,.15,.2,0xf7a1c0,kind!=='activation');}
 }
 return {root,parts};
}
