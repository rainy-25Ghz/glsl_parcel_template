import THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
function main() {
    //  gltf model in parcel
    const modelUrl = new URL("./lighthouse2.glb", import.meta.url);

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ canvas });

    //set up a orthographic camera
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 2);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

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
    const loader = new GLTFLoader();
    loader.load(modelUrl.href, (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        render();
    });
}

main();
