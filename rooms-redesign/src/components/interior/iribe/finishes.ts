import * as THREE from 'three';

const hash=(x:number,y:number)=>{
 let n=Math.imul(x,374761393)+Math.imul(y,668265263);
 n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;
};
const noise=(x:number,y:number,period:number)=>{
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
 const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const sample=(a:number,b:number)=>hash((a%period+period)%period,(b%period+period)%period);
 return THREE.MathUtils.lerp(THREE.MathUtils.lerp(sample(ix,iy),sample(ix+1,iy),u),THREE.MathUtils.lerp(sample(ix,iy+1),sample(ix+1,iy+1),u),v);
};
function repeatTexture(pixels:Uint8Array,width:number,height:number,color=false){
 const map=new THREE.DataTexture(pixels,width,height);
 if(color)map.colorSpace=THREE.SRGBColorSpace;
 map.wrapS=map.wrapT=THREE.RepeatWrapping;map.generateMipmaps=true;
 map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=4;map.needsUpdate=true;
 return map;
}

/** Warm gray, mottled polished concrete and fine saw-cut joints in UMD's
 * lobby photograph. Finish scale and aggregate are visual estimates. */
export function concreteFinish(polished=false){
 const color=new Uint8Array(256*256*4),height=new Uint8Array(color.length),roughness=polished?new Uint8Array(color.length):null;
 const base=polished?[128,120,106]:[124,120,112];
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const i=(y*256+x)*4;
  // Integer frequencies make the cloud pattern continuous at tile boundaries.
  const clouds=(noise(x/32,y/32,8)-.5)*(polished?17:18)+(noise(x/256*23+19,y/256*23+37,23)-.5)*7;
  const grain=(hash(x,y)-.5)*4,joint=x<1||y<1;
  const aggregate=hash(x+791,y+193)>.986?(hash(x+193,y+791)-.5)*24:0;
  // The photographed floor is warm gray rather than pale tan. Fine light
  // saw-cut lines, scattered aggregate and varied polish retain that character
  // under the bright lobby lighting. Colors and finish scale are estimates.
  color[i]=base[0]+(joint?14:0)+clouds+grain+aggregate;color[i+1]=base[1]+(joint?13:0)+clouds+grain+aggregate;color[i+2]=base[2]+(joint?12:0)+clouds+grain+aggregate;color[i+3]=255;
  height[i]=height[i+1]=height[i+2]=joint?88:154+grain*4;height[i+3]=255;
  if(roughness){
   const polish=joint?186:134-clouds*1.1+grain*2;
   roughness[i]=roughness[i+1]=roughness[i+2]=polish;roughness[i+3]=255;
  }
 }
 const map=repeatTexture(color,256,256,true),bumpMap=repeatTexture(height,256,256),roughnessMap=roughness?repeatTexture(roughness,256,256):undefined;
 map.repeat.set(polished?.25:.4,polished?.25:.4);bumpMap.repeat.copy(map.repeat);roughnessMap?.repeat.copy(map.repeat);
 return {map,bumpMap,roughnessMap};
}

/** Panel joints and subtle brushed variation, read from the lobby photograph.
 * Panel size and finish response are visual estimates. */
export function soffitFinish(pale=false){
 const color=new Uint8Array(256*256*4),height=new Uint8Array(color.length);
 const base=pale?[168,176,178]:[99,105,105],seam=pale?15:42;
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const i=(y*256+x)*4,joint=x<1||y<1;
  const grain=(hash(x,y)-.5)*2+(noise(x/64,y/64,4)-.5)*5;
  color[i]=base[0]-(joint?seam:0)+grain;color[i+1]=base[1]-(joint?seam:0)+grain;color[i+2]=base[2]-(joint?seam:0)+grain;color[i+3]=255;
  height[i]=height[i+1]=height[i+2]=joint?90:150+grain;height[i+3]=255;
 }
 const map=repeatTexture(color,256,256,true),bumpMap=repeatTexture(height,256,256);
 map.repeat.set(.45,.65);bumpMap.repeat.copy(map.repeat);return {map,bumpMap};
}

/** Fine vertical wood grain for the photographed slatted lift enclosure.
 * Species and grain scale are estimated; the geometry supplies the slat gaps. */
export function verticalTimberFinish(){
 const pixels=new Uint8Array(128*256*4);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){
  const i=(y*128+x)*4;
  const grain=(noise(x/4,y/64,32)-.5)*22+(hash(x,Math.floor(y/12))-.5)*4;
  pixels[i]=231+grain;pixels[i+1]=227+grain;pixels[i+2]=220+grain;pixels[i+3]=255;
 }
 return repeatTexture(pixels,128,256,true);
}

/** Fine upholstery weave, mipmapped to avoid shimmer while moving. */
export function upholsteryFinish(){
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const i=(y*64+x)*4,value=237+((x%4<2)===(y%4<2)?9:-5)+(hash(x,y)-.5)*5;
  pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;
 }
 const map=repeatTexture(pixels,64,64,true);map.repeat.set(7,7);return map;
}
