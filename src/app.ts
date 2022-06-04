import * as THREE from "three";
import { TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { animate } from "popmotion";

function main() {
    //  gltf model in parcel
    const modelUrl = new URL("./lighthouse.glb", import.meta.url);
    const textureUrl = new URL("./texture.jpg", import.meta.url);

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas });
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

    camera.position.set(90, 134, 115);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //add orbit controls
    const controls = new OrbitControls(camera, canvas);
    //limits the orbit controls
    controls.minDistance = d;
    controls.maxDistance = d * 2;
    controls.minAzimuthAngle = -Math.PI / 3;
    controls.maxAzimuthAngle = Math.PI / 3;
    controls.minPolarAngle = -Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 3;

    controls.maxZoom = 1.5;
    controls.minZoom = 0.8;
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x396fb5);

    //responsive canvas
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            console.log("resizing");
            renderer.setSize(width, height, false);
            const canvas = renderer.domElement;
            const aspect = canvas.clientWidth / canvas.clientHeight;
            console.log(aspect);
            camera = new THREE.OrthographicCamera(
                -d * aspect,
                d * aspect,
                d,
                -d,
                1,
                1000
            );

            camera.position.set(90, 134, 115);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        }
        return needResize;
    }

    function render() {
        resizeRendererToDisplaySize(renderer);
        controls.update();
        renderer.render(scene, camera);
        console.log(camera.left / camera.right);
        requestAnimationFrame(render);
    }
    //load gltf model
    const gltfloader = new GLTFLoader();
    const textureLoader = new TextureLoader();
    const bakedTexture = textureLoader.load(textureUrl.href);
    bakedTexture.flipY = false;
    bakedTexture.encoding = THREE.sRGBEncoding;
    gltfloader.load(modelUrl.href, (gltf) => {
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
        model.position.set(10, 0, 10);
        scene.add(model);
        animate({
            from: 100,
            to: 0,
            stiffness: 300,
            damping: 8,
            onUpdate: (v) => {
              console.log(v);
                model.position.set(10, v, 10);
                render();
            },
            onComplete: () => {
                render();
            },
        });
        // render();
    });
}

main();
