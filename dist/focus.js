import * as THREE from './vendor/three.module.js';

// Fit every corner in camera space, including the depth of the selected region.
export function focusFrame(box, camera, direction, padding = 1.25) {
  const center = box.getCenter(new THREE.Vector3());
  const forward = direction.clone().normalize();
  const right = new THREE.Vector3().crossVectors(camera.up, forward).normalize();
  if (right.lengthSq() < 0.001) right.set(1, 0, 0);
  const up = new THREE.Vector3().crossVectors(forward, right).normalize();
  const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const tanX = tanY * camera.aspect;
  let distance = 0.12;
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const corner = new THREE.Vector3(x, y, z).sub(center);
        const depth = corner.dot(forward);
        distance = Math.max(distance,
          depth + Math.abs(corner.dot(right)) * padding / tanX,
          depth + Math.abs(corner.dot(up)) * padding / tanY);
      }
    }
  }
  return { center, position: center.clone().addScaledVector(forward, distance) };
}

export function lessonRegionBounds(step,boundsFor){
 if(step.frame==='ankle:r')return boundsFor('Talus.r').union(boundsFor('Calcaneus.r')).expandByScalar(.045);
 if(step.frame==='knee:r'){const box=boundsFor('Patella.r'),size=box.getSize(new THREE.Vector3());return box.expandByScalar(Math.max(size.x,size.y,size.z)*1.8);}
 const box=new THREE.Box3();for(const id of step.region||[])box.union(boundsFor(id));return box;
}

export function landmarkRegionBounds(position,boneBox){
 const size=boneBox.getSize(new THREE.Vector3());
 const halfSize=THREE.MathUtils.clamp(Math.max(size.x,size.y,size.z)*.14,.025,.10);
 return new THREE.Box3().setFromCenterAndSize(new THREE.Vector3().fromArray(position),new THREE.Vector3(halfSize*2,halfSize*2,halfSize*2));
}

export function adjustedOrbit(position,target,{scale=1,theta=0,phi=0,minDistance=.06,maxDistance=8}={}){
 const orbit=new THREE.Spherical().setFromVector3(position.clone().sub(target));
 orbit.radius=THREE.MathUtils.clamp(orbit.radius*scale,minDistance,maxDistance);
 orbit.theta+=theta;orbit.phi=THREE.MathUtils.clamp(orbit.phi+phi,.01,Math.PI-.01);
 return target.clone().add(new THREE.Vector3().setFromSpherical(orbit));
}
