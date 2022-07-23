import * as THREE from "three";
import { TextureLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { animate } from "popmotion";
function main() {
    //spring animation options
    const springOptions = {
        stiffness: 100,
        damping: 10,
        mass: 1,
        velocity: 2,
        restSpeed: 0.001,
    }

    const animeOptions = { from: 80, to: -10, ...springOptions };
    //create a button to toggle the animation
    const button = document.createElement("button");
    button.innerText = "Animate";
    button.className = "button";
    //add the button to the DOM
    document.body.appendChild(button);

    //  gltf model in parcel
    const modelUrl = new URL("./room.gltf", import.meta.url);
    // const textureUrl = new URL("./baked2.png", import.meta.url);

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

    camera.position.set(125, 80, 125);
    camera.rotation.y = 0.7;
    camera.rotation.x = -0.56;
    camera.rotation.z = 0.38;
    //if in desktop browser, set zoom 2
    if (window.innerWidth > 768) {
        camera.zoom = 2;
    } else camera.zoom = 1;
    camera.updateProjectionMatrix();

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
        console.log(camera.position, camera.rotation);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    //load gltf model
    const gltfloader = new GLTFLoader();
    let floor;
    // const bakedTexture = textureLoader.load(textureUrl.href);
    // bakedTexture.flipY = false;
    // bakedTexture.encoding = THREE.sRGBEncoding;
    gltfloader.load(modelUrl.href, (gltf) => {
        scene.background = new THREE.Color(0xffddaa);
        // const bakedMaterial = new THREE.MeshBasicMaterial({
        //     map: bakedTexture,
        // });
        const model = gltf.scene;
        floor=model.getObjectByName("Floor");
        console.log(model);
        model.traverse((child) => {
            // console.log(child);
            //receive shadow
            child.castShadow = true;
            //receive shadow
            child.receiveShadow = true;
        });
        //scale the model
        model.scale.set(8, 8, 8);
        //setup the lighting
        const ambientLight = new THREE.AmbientLight(0xffbbef, 0.95);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.set(-1, 1, 1);
        scene.add(directionalLight);
        // model.position.set(10, -10, 10);
        scene.add(model);
        button.addEventListener("click", () => {
            animate({
                ...animeOptions,
                onUpdate: (v) => {
                    model.position.set(10, v, 10);
                    // renderer.render(scene, camera);
                },
            });
        });
        animate({
            ...animeOptions,
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
