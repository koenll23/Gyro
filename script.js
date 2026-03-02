import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/MTLLoader.js";

/* ---------- Scene ---------- */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

/* ---------- Camera ---------- */

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
);

camera.position.set(0,0.3,0.8);

/* ---------- Renderer ---------- */

const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* ---------- Controls ---------- */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ---------- Lighting ---------- */

scene.add(new THREE.AmbientLight(0xffffff, 2));

const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(2,3,3);
scene.add(dirLight);

/* ---------- Load Model ---------- */

const mtlLoader = new MTLLoader();

console.log("Starting model load...");

mtlLoader.load("./Models/head.mtl",

(materials)=>{

    console.log("MTL loaded");

    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    objLoader.load("./Models/head.obj",

        (object)=>{

            console.log("OBJ loaded");

            scene.add(object);

            /* Center model */
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);

            /* Normalize scale */
            const size = box.getSize(new THREE.Vector3()).length();
            object.scale.multiplyScalar(1/size);

        },

        (xhr)=>{
            console.log("OBJ Loading:",
                ((xhr.loaded/xhr.total)*100).toFixed(2)+"%");
        },

        (err)=>{
            console.error("OBJ LOAD ERROR:", err);
        }

    );

},

(err)=>{
    console.error("MTL LOAD ERROR:", err);
}

);

/* ---------- Animation ---------- */

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);
}

animate();

/* ---------- Resize ---------- */

window.addEventListener("resize",()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});
