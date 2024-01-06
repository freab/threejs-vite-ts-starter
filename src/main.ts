import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';
import { createNoise2D } from 'simplex-noise';
import Gojo from './gojo';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import SphereObject from './sphere';
import lilGui from 'lil-gui';
import ThreeDText from './text';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const canvas = document.getElementsByClassName('webgl')[0] as HTMLCanvasElement;

const scene = new THREE.Scene();

let spotLight;

const noice = createNoise2D();

const resolution = 25;
const size = 15;
const modelHeight = 7;

const textureLoader = new THREE.TextureLoader();

const colorTexture = textureLoader.load(
  'textures/ground/Ground037_1K-JPG_Color.jpg',
);
const ambientOcclusionTexture = textureLoader.load(
  'textures/ground/Ground037_1K-JPG_AmbientOcclusion.jpg',
);
const displacementTexture = textureLoader.load(
  'textures/ground/Ground037_1K-JPG_Displacement.jpg',
);
const normalMapTexture = textureLoader.load(
  '/textures/ground/Ground037_1K-JPG_NormalGL.jpg',
);
const roughnessTexture = textureLoader.load(
  '/textures/ground/Ground037_1K-JPG_Roughness.jpg',
);

const groundgeometry = new THREE.PlaneGeometry(
  40 * 6 * 2,
  40 * 6 * 2,
  400,
  400,
);

const groundmaterial = new THREE.MeshStandardMaterial({
  color: 0xf2d2bd,
  side: THREE.DoubleSide,
  map: colorTexture,
  aoMap: ambientOcclusionTexture,
  displacementMap: displacementTexture,
  displacementScale: 0.2,
  normalMap: normalMapTexture,
  roughnessMap: roughnessTexture,
});

const ground = new THREE.Mesh(groundgeometry, groundmaterial);
ground.geometry.rotateX(Math.PI * -0.5);

const groundHeight = getY(0, 0);
ground.position.set(0, groundHeight - modelHeight * 0.5, 0);
ground.receiveShadow = true;

scene.add(ground);

const positionAttribute = ground.geometry.getAttribute('position');
for (let i = 0; i < positionAttribute.count; i++) {
  const x = positionAttribute.getX(i);
  const z = positionAttribute.getZ(i);
  const y = getY(x, z);
  positionAttribute.setY(i, y);
}
positionAttribute.needsUpdate = true;
ground.geometry.computeVertexNormals();

function getY(x: number, z: number) {
  const scalar = noice(x * 0.0, z * 0.0);
  return scalar * (scalar > 0 ? 3 : 1);
}

const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0);
scene.add(ambient);

spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(5.5, 15, 35.5);
spotLight.angle = Math.PI / 8;
spotLight.penumbra = 1;
spotLight.decay = 2;
spotLight.distance = 0;

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 10;
spotLight.shadow.focus = 1;
scene.add(spotLight);

for (let i = 0; i < resolution; i++) {
  for (let j = 0; j < resolution; j++) {
    const x = i * Math.random() * size - resolution * 0.5 * size;
    const z = j * Math.random() * size - resolution * 0.5 * size;
    const y = getY(x, z);

    const housepos = new THREE.Vector3(x, y, z);
    const housedistr = noice(x * 0.03, z * 0.03);

    if (
      housedistr < -0.5 ||
      housepos.length() < resolution * size * 0.1 ||
      housepos.length() > resolution * size * 0.3
    ) {
      continue;
    }

    const gojo = new Gojo();
    gojo.mesh.position.copy(housepos);
    gojo.mesh.scale.setScalar(0.8 + Math.max(0.3, housedistr));

    scene.add(gojo.mesh);
  }
}

const gltfLoader = new GLTFLoader();
const modelPath = '/models/nativity.glb';

gltfLoader.load(modelPath, (gltf) => {
  const model = gltf.scene;
  const desiredScale = new THREE.Vector3(1, 1, 1);
  model.scale.copy(desiredScale);

  model.position.set(0.5, -4.2, 2);
  model.rotateX(-0.01);

  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(model);
});

const sphereObject = new SphereObject();
scene.add(sphereObject.mesh);

scene.fog = new THREE.Fog(0xcccccc, 1, 100);

const othergui = new lilGui();
othergui.close();

const guiParameters = {
  fogColor: '0x8d8d8d',
  takeScreenshot: function () {
    takeScreenshot();
  },
};
// Add tweakable parameters to dat.GUI
const fogFolder = othergui.addFolder('Fog');
fogFolder.addColor(guiParameters, 'fogColor').onChange(() => {
  if (scene.fog !== null) {
    scene.fog.color.set(guiParameters.fogColor);
  }
});
fogFolder.close();

// taking screenshots
othergui.add(guiParameters, 'takeScreenshot').name('Take Screenshot');
function takeScreenshot() {
  const screenshotDataUrl = renderer.domElement.toDataURL('image/png');

  const link = document.createElement('a');

  link.href = screenshotDataUrl;

  link.download = 'የገና_3D_Postcard.png';

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

const textObject = new ThreeDText(othergui);
textObject.mesh.position.set(-4, -2.6, -12);
textObject.mesh.scale.set(2.5, 2.5, 2.5);
scene.add(textObject.mesh);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('dblclick', () => {
  if (!document.fullscreenElement) {
    return canvas.requestFullscreen();
  }
  return document.exitFullscreen();
});

const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.set(2, 5, 15);

const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x644621, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 200;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(2, 5, 15);

const initialTarget = new THREE.Vector3(0, 0, 0);
controls.target.copy(initialTarget);

const maxX = 5;
const minX = 10;

controls.addEventListener('update', () => {
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, minX, maxX);
});

const animate = () => {
  stats.begin();
  controls.update();
  renderer.render(scene, camera);
  stats.end();
  window.requestAnimationFrame(animate);
};

animate();
