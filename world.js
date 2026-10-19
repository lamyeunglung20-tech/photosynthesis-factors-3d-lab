import * as THREE from './vendor/three.module.js';

export class LabWorld {
  constructor(canvas) {
    this.canvas=canvas;this.available=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.materialProgress=0;this.resultProgress=0;this.mission=null;
    try {
      this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
      this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;
      this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
      this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(37,1,.1,60);
      this.target=new THREE.Vector3(0,.7,0);this.azimuth=.08;this.elevation=.15;this.distance=10.6;
      this.materials=this.makeMaterials();
      this.scene.add(new THREE.HemisphereLight(0xffffff,0x789681,2.4));
      const key=new THREE.DirectionalLight(0xfff7e7,3);key.position.set(-4,8,7);key.castShadow=true;
      key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-5,near:1,far:25});key.shadow.bias=-.0008;this.scene.add(key);
      const fill=new THREE.DirectionalLight(0xd6e8dd,1.1);fill.position.set(5,3,-4);this.scene.add(fill);
      this.build();this.bind();this.resize();this.setExperiment('chlorophyll',{A:'',B:''},false,false);
      this.available=true;this.loop=this.loop.bind(this);this.raf=requestAnimationFrame(this.loop);
    } catch(e){this.renderer?.dispose();console.warn(e);}
  }
  mat(color,options={}){return new THREE.MeshStandardMaterial({color,roughness:.72,...options});}
  makeMaterials(){return {
    bench:this.mat(0xdce7d7),edge:this.mat(0xb7cbb1),plinth:this.mat(0xf8faf3),trim:this.mat(0x95b193),
    pot:this.mat(0xbb815d),rim:this.mat(0xdca781),soil:this.mat(0x634c39),stem:this.mat(0x507f45),
    mainLeaf:this.mat(0x4d9654,{side:THREE.DoubleSide}),leftLeaf:this.mat(0x4d9654,{side:THREE.DoubleSide}),rightLeaf:this.mat(0x4d9654,{side:THREE.DoubleSide}),
    pale:this.mat(0xf3e9b6,{transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),stripe:this.mat(0xbd8743,{transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),
    vein:this.mat(0xb8d897),paper:this.mat(0x20302a,{side:THREE.DoubleSide}),clip:this.mat(0x9aa6a2,{metalness:.65,roughness:.25}),
    glass:this.mat(0xaadbd4,{transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,roughness:.15}),
    seal:this.mat(0x76a89c,{transparent:true,opacity:.65}),soda:this.mat(0xf8f7e9),dish:this.mat(0xe6eadd),
    gold:this.mat(0xf5cd72,{emissive:0xf4c35e,emissiveIntensity:.25}),halo:this.mat(0xffe7a4,{transparent:true,opacity:.22,depthWrite:false})
  };}
  mesh(geometry,material,parent=this.scene){const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  box(w,h,d,mat,parent,x=0,y=0,z=0){const m=this.mesh(new THREE.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
  cyl(rt,rb,h,mat,parent,x=0,y=0,z=0){const m=this.mesh(new THREE.CylinderGeometry(rt,rb,h,48),mat,parent);m.position.set(x,y,z);return m;}
  sphere(r,mat,parent,x=0,y=0,z=0){const m=this.mesh(new THREE.SphereGeometry(r,20,14),mat,parent);m.position.set(x,y,z);return m;}
  line(points,r,mat,parent){return this.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),30,r,8,false),mat,parent);}
  leafShape(){const s=new THREE.Shape();s.moveTo(0,0);s.bezierCurveTo(.45,.55,1.2,.66,1.7,.08);s.bezierCurveTo(1.1,-.5,.42,-.46,0,0);return s;}
  addLeaf(parent,pos,angle,scale,material){
    const g=new THREE.Group();g.position.set(...pos);g.rotation.z=angle;g.scale.setScalar(scale);parent.add(g);
    const shape=this.leafShape();this.mesh(new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelThickness:.016,bevelSize:.02,bevelSegments:2,steps:1,curveSegments:28}),material,g);
    const veins=new THREE.Group();g.add(veins);
    this.line([[0,0,.075],[.57,.025,.085],[1.6,.075,.075]],.013,this.materials.vein,veins);
    for(const x of [.32,.55,.8,1.05,1.28])for(const sign of [-1,1])this.line([[x,.025,.082],[x+.12,sign*(x<1.1?.23:.14),.082]],.006,this.materials.vein,veins);
    return {g,shape,veins};
  }
  patch(parent,shape,material){const m=this.mesh(new THREE.ShapeGeometry(shape,30),material,parent);m.position.z=.07;m.castShadow=false;return m;}
  stripeShape(shape,min,max){
    let points=shape.getPoints(90);
    for(const [bound,keep] of [[min,(x,b)=>x>=b],[max,(x,b)=>x<=b]]){
      const clipped=[];
      for(let i=0;i<points.length;i++){
        const a=points[i],b=points[(i+1)%points.length],ai=keep(a.x,bound),bi=keep(b.x,bound);
        if(ai)clipped.push(a);
        if(ai!==bi){const t=(bound-a.x)/(b.x-a.x);clipped.push(new THREE.Vector2(bound,a.y+t*(b.y-a.y)));}
      }
      points=clipped;
    }
    return new THREE.Shape(points);
  }
  pot(parent){
    const M=this.materials;
    this.cyl(.64,.46,.9,M.pot,parent,0,-.62,0);this.cyl(.68,.66,.13,M.rim,parent,0,-.18,0);this.cyl(.58,.58,.025,M.soil,parent,0,-.1,0);
  }
  build(){
    const M=this.materials;
    this.box(8.5,.2,4.3,M.bench,this.scene,0,-1.26,0);this.box(8.55,.07,4.4,M.edge,this.scene,0,-1.4,0);
    this.cyl(2.8,2.86,.13,M.plinth,this.scene,0,-1.1,0);this.cyl(2.78,2.82,.04,M.trim,this.scene,0,-1.18,0);
    this.singlePlant=new THREE.Group();this.scene.add(this.singlePlant);this.pot(this.singlePlant);
    this.line([[0,-.1,0],[-.13,.45,0],[-.7,1.0,.12],[-1.35,1.35,.2]],.055,M.stem,this.singlePlant);
    this.main=this.addLeaf(this.singlePlant,[-1.35,1.35,.2],.09,2.05,M.mainLeaf);
    const patch=new THREE.Shape();patch.moveTo(.27,.015);patch.bezierCurveTo(.56,.32,.77,.25,.91,.35);patch.bezierCurveTo(1.17,.38,1.36,.18,1.55,.075);patch.bezierCurveTo(1.25,-.17,1.12,-.21,.99,-.19);patch.bezierCurveTo(.8,-.31,.65,-.12,.52,-.15);patch.bezierCurveTo(.42,-.11,.35,-.03,.27,.015);
    this.variegation=this.patch(this.main.g,patch,M.pale);
    this.resultStripe=this.patch(this.main.g,this.stripeShape(this.main.shape,.67,1.05),M.stripe);
    this.paper=new THREE.Group();this.main.g.add(this.paper);this.paper.position.set(.86,0,0);
    this.box(.39,.98,.035,M.paper,this.paper,0,.0,.16);this.box(.39,.98,.035,M.paper,this.paper,0,0,-.09);
    for(const x of [-.13,.13]){
      const clip=new THREE.Group();this.paper.add(clip);
      this.line([[x,-.39,.2],[x,-.49,.2],[x+.055,-.49,.2],[x+.055,.43,.2],[x,.43,.2]],.012,M.clip,clip);
    }
    this.carbonPlant=new THREE.Group();this.scene.add(this.carbonPlant);this.pot(this.carbonPlant);
    this.line([[0,-.1,0],[0,.6,0],[.02,1.4,0],[.02,2.05,0]],.06,M.stem,this.carbonPlant);
    this.line([[0,.9,0],[-.35,1.35,.08],[-.65,1.58,.12]],.038,M.stem,this.carbonPlant);
    this.line([[0,1.3,0],[.35,1.6,.08],[.65,1.72,.12]],.038,M.stem,this.carbonPlant);
    this.left=this.addLeaf(this.carbonPlant,[-.65,1.58,.12],Math.PI-.03,.92,M.leftLeaf);
    this.right=this.addLeaf(this.carbonPlant,[.65,1.72,.12],.03,.92,M.rightLeaf);
    this.bags=new THREE.Group();this.carbonPlant.add(this.bags);
    this.makeBag(this.bags,-1.38,1.4,.05);this.makeBag(this.bags,1.38,1.54,.05);
    this.soda=new THREE.Group();this.bags.add(this.soda);this.soda.position.set(1.85,.76,.27);
    this.cyl(.23,.25,.065,M.dish,this.soda);
    for(let i=0;i<12;i++){const a=i*2.4,r=.05+(i%3)*.058;const p=this.sphere(.043+(i%2)*.01,M.soda,this.soda,Math.cos(a)*r,.065,Math.sin(a)*r);p.scale.y=.75;}
    this.markers={A:this.marker('A'),B:this.marker('B')};
    this.sun=new THREE.Group();this.scene.add(this.sun);this.sun.position.set(-2.8,3.1,-1.1);
    this.sphere(.25,M.gold,this.sun);this.sphere(.37,M.halo,this.sun).castShadow=false;
    for(let i=0;i<10;i++){const a=i*Math.PI/5;this.line([[Math.cos(a)*.39,Math.sin(a)*.39,0],[Math.cos(a)*.53,Math.sin(a)*.53,0]],.014,M.gold,this.sun);}
    this.baseGreen=new THREE.Color(0x4d9654);this.blue=new THREE.Color(0x172847);this.brown=new THREE.Color(0xb47c36);this.cream=new THREE.Color(0xf3e9b6);
  }
  makeBag(parent,x,y,z){
    const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
    const geometry=new THREE.BoxGeometry(2.05,1.75,.95);
    const bag=this.mesh(geometry,this.materials.glass,g);bag.castShadow=false;
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:0x72a898,transparent:true,opacity:.55}));g.add(outline);
    this.box(2.06,.055,.97,this.materials.seal,g,0,.87,0).castShadow=false;
    // Pinched bag seam around the petiole, at the side facing the plant stem.
    const side=x<0?1:-1;
    this.line([[side*1.02,-.18,0],[side*1.1,0,0],[side*1.02,.18,0]],.018,this.materials.seal,g);
    return g;
  }
  marker(letter){
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const c=canvas.getContext('2d');
    c.fillStyle='#ffffff';c.beginPath();c.arc(64,64,56,0,Math.PI*2);c.fill();c.fillStyle='#234f3a';c.beginPath();c.arc(64,64,47,0,Math.PI*2);c.fill();
    c.fillStyle='#ffffff';c.font='bold 58px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(letter,64,68);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true}));marker.scale.set(.32,.32,1);marker.renderOrder=20;this.scene.add(marker);return marker;
  }
  setExperiment(mission,setup,reveal,materialReady=false){
    if(!this.singlePlant)return;
    const newExperiment=this.mission!==mission||(!materialReady&&this.materialReady);
    this.mission=mission;this.setup={...setup};this.reveal=Boolean(reveal);this.materialReady=Boolean(materialReady);
    if(newExperiment){this.materialProgress=0;this.resultProgress=0;}
    if(this.reduced){this.materialProgress=materialReady?1:0;this.resultProgress=reveal?1:0;}
    this.singlePlant.visible=mission!=='carbon';this.carbonPlant.visible=mission==='carbon';
    this.updateModel();
  }
  updateModel(){
    const p=this.materialProgress,r=this.resultProgress,M=this.materials;
    this.variegation.visible=this.mission==='chlorophyll'&&p>.001;M.pale.opacity=p;M.pale.color.copy(this.cream).lerp(this.brown,r);
    M.mainLeaf.color.copy(this.baseGreen).lerp(this.blue,r);
    M.leftLeaf.color.copy(this.baseGreen).lerp(this.blue,r);M.rightLeaf.color.copy(this.baseGreen).lerp(this.brown,r);
    this.resultStripe.visible=this.mission==='light'&&r>.001;M.stripe.opacity=r;
    this.paper.visible=this.mission==='light'&&p>.001&&r<.99;
    this.paper.scale.setScalar(Math.max(.001,p*(1-r)));
    this.paper.position.z=(1-p)*1.8+r*1.4;
    this.bags.visible=this.mission==='carbon'&&p>.001&&r<.99;this.bags.scale.setScalar(Math.max(.001,p*(1-r)));
    this.main.veins.visible=r<.6;this.left.veins.visible=r<.6;this.right.veins.visible=r<.6;
    this.singlePlant.updateMatrixWorld(true);this.carbonPlant.updateMatrixWorld(true);
    for(const key of ['A','B']){
      const marker=this.markers[key],v=this.setup?.[key];marker.visible=this.materialReady&&['normal','removed'].includes(v);
      if(!marker.visible)continue;
      let point;
      if(this.mission==='carbon')point=new THREE.Vector3(v==='normal'?-1.5:1.5,v==='normal'?1.67:1.82,.8);
      else{
        point=new THREE.Vector3(this.mission==='chlorophyll'?(v==='normal'?.47:1.04):(v==='normal'?.36:.86),this.mission==='chlorophyll'?(v==='normal'?.31:.03):.03,.3);
        this.main.g.localToWorld(point);
      }
      if(this.setup.A===this.setup.B)point.x+=key==='A'?-.19:.19;
      marker.position.copy(point);marker.material.opacity=Math.min(1,p*2);
    }
  }
  resetView(){this.azimuth=.08;this.elevation=.15;this.distance=10.6;this.updateCamera();}
  updateCamera(){const d=this.distance*Math.max(1,1.05/(this.camera.aspect||1));this.camera.position.set(Math.sin(this.azimuth)*Math.cos(this.elevation)*d,Math.sin(this.elevation)*d+this.target.y,Math.cos(this.azimuth)*Math.cos(this.elevation)*d);this.camera.lookAt(this.target);}
  resize(){const r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();this.updateCamera();}
  bind(){
    this.pointers=new Map();
    this.canvas.addEventListener('pointerdown',e=>{this.canvas.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});});
    this.canvas.addEventListener('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;const before=this.pointers.get(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===1){this.azimuth-=(e.clientX-before.x)*.006;this.elevation=Math.max(-.15,Math.min(.65,this.elevation+(e.clientY-before.y)*.004));}else if(this.pointers.size===2){const a=[...this.pointers.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(this.pinchLast)this.distance=Math.max(7.5,Math.min(17,this.distance*this.pinchLast/Math.max(1,d)));this.pinchLast=d;}this.updateCamera();});
    const end=e=>{this.pointers.delete(e.pointerId);this.pinchLast=null;};this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',end);
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.distance=Math.max(7.5,Math.min(17,this.distance+e.deltaY*.012));this.updateCamera();},{passive:false});
    this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(this.canvas);
  }
  loop(t){
    if(!this.available)return;this.raf=requestAnimationFrame(this.loop);
    const dt=this.lastTime?Math.min(.05,(t-this.lastTime)/1000):0;this.lastTime=t;
    const approach=(v,target,speed)=>v<target?Math.min(target,v+dt*speed):Math.max(target,v-dt*speed);
    this.materialProgress=approach(this.materialProgress,this.materialReady?1:0,.65);
    this.resultProgress=approach(this.resultProgress,this.reveal?1:0,.85);
    if(!this.reduced)this.sun.position.y=3.1+Math.sin(t*.0015)*.04;
    this.updateModel();this.renderer.render(this.scene,this.camera);
  }
  dispose(){this.available=false;cancelAnimationFrame(this.raf);this.ro?.disconnect();const materials=new Set();this.scene?.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});Object.values(this.materials||{}).forEach(m=>materials.add(m));materials.forEach(m=>{m.map?.dispose();m.dispose();});this.renderer?.dispose();}
}
