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
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
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

    camera.position.set(
        110.44109436697477,
        74.19399214582037,
        144.56492038005277
    );

    //add orbit controls
    const controls = new OrbitControls(camera, canvas);
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
    const loadingIcon = document.getElementById(
        "loading-icon"
    ) as HTMLDivElement;

    (async () => {
        //load gltf model
        const gltfloader = new GLTFLoader();
        const textureLoader = new TextureLoader();

        scene.background = new THREE.Color(0x396fb5);
        renderer.render(scene, camera);
        const bakedTexture = await textureLoader.loadAsync(textureUrl.href);
        bakedTexture.flipY = false;
        bakedTexture.encoding = THREE.sRGBEncoding;
        const gltf = await gltfloader.loadAsync(modelUrl.href);
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
        model.scale.set(5, 5, 5);
        // model.position.set(10, -10, 10);
        scene.add(model);
        loadingIcon.style.display = "none";
        animate({
            from: 100,
            to: -10,
            stiffness: 500,
            damping: 10,
            onUpdate: (v) => {
                model.position.set(10, v, 10);
                // renderer.render(scene, camera);
            },
            // onComplete: () => {
            //     render();
            // }
        });
        Object.assign(window, { camera });
        requestAnimationFrame(render);
    })();
}

main();
