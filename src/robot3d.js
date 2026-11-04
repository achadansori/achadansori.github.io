import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {toCreasedNormals} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Turns a <figure data-robot3d="model.glb"> into a rotating model; its <img> stays as the fallback.
// The model comes from scripts/bake_azm330.py (Z-up, mm), the pose lives in that script.
export function mountRobot3D(figure) {
 const img = figure.querySelector('img');
 const host = document.createElement('div');
 host.className = 'robot3d';
 host.hidden = true;
 img.after(host);

 let renderer;
 try {
  renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
 } catch {
  host.remove();
  return () => {};
 }
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 renderer.shadowMap.enabled = true;
 renderer.shadowMap.type = THREE.PCFSoftShadowMap;
 host.appendChild(renderer.domElement);

 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(30, 1, 10, 100000);
 const controls = new OrbitControls(camera, renderer.domElement);
 controls.enableDamping = true;
 controls.enablePan = false;
 controls.enableZoom = false;   // the wheel keeps scrolling the article
 controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 controls.autoRotateSpeed = 1.2;
 renderer.domElement.style.touchAction = 'pan-y';

 scene.add(new THREE.HemisphereLight(0xffffff, 0x8890a8, 1.5));
 const sun = new THREE.DirectionalLight(0xffffff, 1.9);
 scene.add(sun, sun.target);

 const resize = () => {
  const {clientWidth:w, clientHeight:h} = host;
  if (!w || !h) return;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.zoom = Math.min(1, camera.aspect / 1.35);   // narrow views: pull back so the feet stay in frame
  camera.updateProjectionMatrix();
 };
 const resizeObserver = new ResizeObserver(resize);
 resizeObserver.observe(host);

 let alive = true, loaded = false, visible = false;
 const run = () => renderer.setAnimationLoop(loaded && visible ? () => {
  controls.update();
  renderer.render(scene, camera);
 } : null);

 const load = () => new GLTFLoader().load(figure.dataset.robot3d, gltf => {
  if (!alive) return;
  const model = gltf.scene;
  model.rotation.x = -Math.PI / 2;     // CAD Z-up -> three Y-up
  model.traverse(o => {
   if (!o.isMesh) return;
   o.geometry = toCreasedNormals(o.geometry, THREE.MathUtils.degToRad(35));
   o.material.color.convertSRGBToLinear();   // the bake stores the sRGB colors of render_iso_azm.py
   o.material.side = THREE.DoubleSide;
   o.material.metalness = o.material.name === 'chrome' ? .5 : .1;
   o.material.roughness = o.material.name === 'chrome' ? .35 : .6;
   o.castShadow = true;
  });
  scene.add(model);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const radius = box.getSize(new THREE.Vector3()).length() / 2;
  controls.target.copy(center);
  camera.position.copy(center).add(new THREE.Vector3(.3, .14, 1).normalize().multiplyScalar(radius * 2.5));

  const ground = new THREE.Mesh(new THREE.CircleGeometry(radius * 3, 48), new THREE.ShadowMaterial({opacity:.18}));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(center.x, box.min.y, center.z);
  ground.receiveShadow = true;
  scene.add(ground);

  sun.position.copy(center).add(new THREE.Vector3(-.3, 1.5, .4).multiplyScalar(radius * 1.5));
  sun.target.position.copy(center);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 6;
  Object.assign(sun.shadow.camera, {left:-radius * 1.5, right:radius * 1.5, top:radius * 1.5, bottom:-radius * 1.5, near:1, far:radius * 6});
  sun.shadow.camera.updateProjectionMatrix();

  host.hidden = false;
  img.style.display = 'none';
  resize();
  loaded = true;
  run();
 }, undefined, () => {if (alive) host.remove();});

 // Fetch the model only when the reader gets close, and stop drawing once it scrolls away.
 let requested = false;
 const observer = new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible && !requested) {
   requested = true;
   load();
  }
  run();
 }, {rootMargin:'300px'});
 observer.observe(figure);

 return () => {
  alive = false;
  observer.disconnect();
  resizeObserver.disconnect();
  renderer.setAnimationLoop(null);
  controls.dispose();
  scene.traverse(o => {
   if (o.isMesh) {
    o.geometry.dispose();
    o.material.dispose();
   }
  });
  renderer.dispose();
  host.remove();
  img.style.display = '';
 };
}
