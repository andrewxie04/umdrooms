import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/** Glass, decals and soft contact shadows are blended without writing depth. */
export function seeThrough(material:THREE.Material|THREE.Material[]):boolean{
 return Array.isArray(material)?material.some(seeThrough):material.transparent&&!material.depthWrite;
}

/**
 * Ambient occlusion that ignores see-through surfaces. The stock pass draws
 * every mesh into its normal/depth buffer, so window glass would occlude the
 * room behind it and darken mullion edges against the sky.
 */
class InteriorAOPass extends GTAOPass {
 private hidden:THREE.Object3D[]=[];
 override render(renderer:THREE.WebGLRenderer,writeBuffer:THREE.WebGLRenderTarget,readBuffer:THREE.WebGLRenderTarget,deltaTime:number,maskActive:boolean){
  this.scene.traverseVisible(object=>{const mesh=object as THREE.Mesh;if(mesh.isMesh&&seeThrough(mesh.material)){mesh.visible=false;this.hidden.push(mesh);}});
  try{super.render(renderer,writeBuffer,readBuffer,deltaTime,maskActive);}
  finally{for(const object of this.hidden)object.visible=true;this.hidden.length=0;}
 }
}

export interface InteriorPost {render():void;setSize(width:number,height:number):void;dispose():void;}

/**
 * Scene → ambient occlusion → tone mapping/sRGB. A multisampled half-float
 * target keeps the antialiasing that the composer would otherwise lose. The
 * occlusion radius is in metres: wide enough to ground furniture, columns and
 * wall/ceiling junctions, small enough not to dim open floor.
 */
export function createInteriorPost(renderer:THREE.WebGLRenderer,scene:THREE.Scene,camera:THREE.PerspectiveCamera):InteriorPost{
 const size=renderer.getDrawingBufferSize(new THREE.Vector2());
 const target=new THREE.WebGLRenderTarget(Math.max(1,size.x),Math.max(1,size.y),{type:THREE.HalfFloatType,samples:4});
 const composer=new EffectComposer(renderer,target);
 const ao=new InteriorAOPass(scene,camera,Math.max(1,size.x),Math.max(1,size.y));
 // Slabs, ceilings and partitions are single planes drawn double-sided; the
 // stock front-side normal pass would drop them and expose the floor above.
 ao.normalMaterial.side=THREE.DoubleSide;
 ao.updateGtaoMaterial({radius:1.1,distanceExponent:1.4,thickness:1.5,scale:1.3,samples:16,distanceFallOff:1});
 ao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:16});
 const output=new OutputPass();
 if(import.meta.env.DEV)Object.assign(window,{__iribeAO:ao,__iribeRender:()=>composer.render(),__iribeRenderer:renderer});
 composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(output);
 return {
  render:()=>composer.render(),
  setSize:(width,height)=>{composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(Math.max(1,width),Math.max(1,height));},
  dispose:()=>{ao.dispose();output.dispose();composer.dispose();target.dispose();},
 };
}
