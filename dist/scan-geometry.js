// AFE1: little-endian header, shared bounds, then uint16 positions and indices.
export function decodeScan(buffer){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<44)throw Error('Arquivo 3D incompleto.');
 const h=new DataView(buffer);if(h.getUint32(0,true)!==0x31454641)throw Error('Formato 3D inválido.');
 const counts=[4,8,12,16].map(n=>h.getUint32(n,true));
 if(counts.some(n=>!n)||counts[0]>65535||counts[2]>65535||counts[1]%3||counts[3]%3)throw Error('Contagem de geometria inválida.');
 if(buffer.byteLength!==44+counts[0]*6+counts[1]*2+counts[2]*6+counts[3]*2)throw Error('Arquivo 3D incompleto.');
 const bounds=[20,24,28,32,36,40].map(n=>h.getFloat32(n,true));if(!bounds.every(Number.isFinite)||bounds.slice(0,3).some((v,i)=>v>=bounds[i+3]))throw Error('Limites da peça inválidos.');
 let offset=44;
 function mesh(nv,ni){const position=new Float32Array(nv*3);for(let i=0;i<position.length;i++,offset+=2){const axis=i%3;position[i]=bounds[axis]+h.getUint16(offset,true)/65535*(bounds[axis+3]-bounds[axis]);}const index=new Uint16Array(ni);for(let i=0;i<ni;i++,offset+=2){index[i]=h.getUint16(offset,true);if(index[i]>=nv)throw Error('Índice de geometria inválido.');}return {position,index};}
 return {...mesh(counts[0],counts[1]),occlusion:mesh(counts[2],counts[3])};
}
export async function loadPieceData(key,fetcher=fetch){
 if(!/^[a-z0-9-]+$/.test(key))throw Error('Peça inválida.');
 const response=await fetcher(`pecas/${key}.json`);if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();
 if(data.geometry){if(data.geometry!==`${key}.bin`)throw Error('Arquivo da peça inválido.');const r=await fetcher(`pecas/${data.geometry}`);if(!r.ok)throw Error('HTTP '+r.status);data.bones={[data.bone]:decodeScan(await r.arrayBuffer())};}
 return data;
}
