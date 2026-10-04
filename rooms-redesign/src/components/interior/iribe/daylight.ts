import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

/** A CC0 photographed pure sky, not a photograph of the UMD site or current
 * weather. One 1K asset is loaded only for the interior. See ASSETS.md. */
export async function loadDaylight(renderer:THREE.WebGLRenderer,signal:AbortSignal){
 const response=await fetch(`${import.meta.env.BASE_URL}interior/iribe/daylight-sky-1k.hdr`,{signal});
 if(!response.ok)throw new Error('Daylight sky unavailable');
 const buffer=await response.arrayBuffer();signal.throwIfAborted();
 const parsed=new HDRLoader().setDataType(THREE.HalfFloatType).parse(buffer);
 const {width,height}=parsed;
 if(!(parsed.data instanceof Uint16Array)||!width||!height)throw new Error('Invalid daylight texture');
 const texture=(data:Uint16Array)=>{
  const t=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.HalfFloatType);
  t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.LinearSRGBColorSpace;
  t.minFilter=t.magFilter=THREE.LinearFilter;t.flipY=true;t.needsUpdate=true;return t;
 };
 const background=texture(parsed.data),lightingData=parsed.data.slice();
 let brightest=0,peakX=0,peakY=0;
 for(let i=0;i<lightingData.length;i+=4){
  const r=THREE.DataUtils.fromHalfFloat(lightingData[i]),g=THREE.DataUtils.fromHalfFloat(lightingData[i+1]),b=THREE.DataUtils.fromHalfFloat(lightingData[i+2]);
  const luminance=r*.2126+g*.7152+b*.0722;
  if(luminance>brightest){brightest=luminance;peakX=(i/4)%width;peakY=Math.floor(i/4/width);}
  // The directional light supplies the sun. Cap its image radiance only in
  // the reflection/ambient copy, preventing duplicate sun energy and fireflies.
  const factor=Math.min(1,8/Math.max(r,g,b));
  if(factor<1)for(let c=0;c<3;c++)lightingData[i+c]=THREE.DataUtils.toHalfFloat(THREE.DataUtils.fromHalfFloat(lightingData[i+c])*factor);
 }
 const nativeAzimuth=((peakX+.5)/width-.5)*Math.PI*2;
 const desiredAzimuth=Math.atan2(-35,50),rotation=nativeAzimuth-desiredAzimuth;
 const elevation=(.5-(peakY+.5)/height)*Math.PI;
 const sunDirection=new THREE.Vector3(Math.cos(elevation)*Math.cos(desiredAzimuth),Math.sin(elevation),Math.cos(elevation)*Math.sin(desiredAzimuth));
 const lighting=texture(lightingData),pmrem=new THREE.PMREMGenerator(renderer);
 let target:THREE.WebGLRenderTarget;
 try{target=pmrem.fromEquirectangular(lighting);}
 catch(error){background.dispose();throw error;}
 finally{lighting.dispose();pmrem.dispose();}
 if(signal.aborted){background.dispose();target.dispose();signal.throwIfAborted();}
 return {background,environment:target.texture,rotation,sunDirection,dispose(){background.dispose();target.dispose();}};
}
