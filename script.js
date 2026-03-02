import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/MTLLoader.js";

/* Scene */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

/* Camera */
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0,0.2,0.6);

/* Renderer */
const renderer = new THREE.WebGLRenderer({
    antialias:true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* Controls */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* Lighting */
scene.add(new THREE.AmbientLight(0xffffff, 1.8));

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(1,2,3);
scene.add(dirLight);

/* Load Materials */
const mtlLoader = new MTLLoader();

mtlLoader.load("./Models/head.mtl", (materials) => {

    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    /* Load OBJ */
    objLoader.load("./Models/head.obj",
        (object) => {

            scene.add(object);

            /* Center model */
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);

            /* Scale to reasonable size */
            const size = box.getSize(new THREE.Vector3()).length();
            object.scale.multiplyScalar(1 / size);

        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + "% loaded");
        },
        (err) => console.error("OBJ load error:", err)
    );

});

/* Animate */
function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);
}
animate();

/* Resize */
window.addEventListener("resize", ()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
