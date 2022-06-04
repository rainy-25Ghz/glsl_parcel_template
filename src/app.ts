import * as THREE from "three";
import { TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { animate } from "popmotion";
function main() {
    //  gltf model in parcel
    const modelUrl = new URL("./lighthouse2.gltf", import.meta.url);
    const textureUrl = new URL("./baked2.png", import.meta.url);

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.outputEncoding = THREE.sRGBEncoding;

    //set up a isometric camera in three.js

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const d = 100;
    let camera = new THREE.OrthographicCamera(
        -d * aspect,
        d * aspect,
        d,
        -d,
        1,
        1000
    );

    camera.position.set(76, 160, 85);

    //add orbit controls
    const controls = new OrbitControls(camera, canvas);
    //limits the orbit controls
    controls.minDistance = d;
    controls.maxDistance = d * 2;
    controls.minAzimuthAngle = -Math.PI / 3;
    controls.maxAzimuthAngle = Math.PI / 2;
    controls.minPolarAngle = -Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 3;
    controls.maxZoom = 1.5;
    controls.minZoom = 0.8;
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    

    //responsive canvas
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);

            const aspect = canvas.clientWidth / canvas.clientHeight;
            camera.left = -d * aspect;
            camera.right = d * aspect;
            camera.updateProjectionMatrix();
        }
        return needResize;
    }

    function render() {
        resizeRendererToDisplaySize(renderer);
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    //load gltf model
    const gltfloader = new GLTFLoader();
    const textureLoader = new TextureLoader();
    const bakedTexture = textureLoader.load(textureUrl.href);
    bakedTexture.flipY = false;
    bakedTexture.encoding = THREE.sRGBEncoding;
    gltfloader.load(modelUrl.href, (gltf) => {
        scene.background = new THREE.Color(0x396fb5);
        const bakedMaterial = new THREE.MeshBasicMaterial({
            map: bakedTexture,
        });
        const model = gltf.scene;
        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = bakedMaterial;
            }
        });
        //scale the model
        model.scale.set(8, 8, 8);
        // model.position.set(10, -10, 10);
        scene.add(model);
        animate({
            from: 100,
            to: -10,
            stiffness: 500,
            damping:10,
            onUpdate: (v) => {
                model.position.set(10, v, 10);
                // renderer.render(scene, camera);
            },
            // onComplete: () => {
            //     render();
            // }
        });
        requestAnimationFrame(render);
    });
}

main();
