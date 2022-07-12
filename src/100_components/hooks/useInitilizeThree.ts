import { VRM } from "@pixiv/three-vrm";
import { useEffect } from "react";
import * as THREE from "three";
import { useAppState } from "../../003_provider/AppStateProvider";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useAppSetting } from "../../003_provider/AppSettingProvider";


const AVATAR_AREA_WIDTH = 1280;
const AVATAR_AREA_HEIGHT = 960;

export const useInitializeThree = () => {
    const { threeState, avatarControlState } = useAppState()
    const { applicationSetting } = useAppSetting()
    const vrmSetting = applicationSetting!.vrm_path

    useEffect(() => {
        const initThree = async () => {
            //// (1-1) Canvas取得
            const avatarDiv = document.getElementById("sidebar-avatar-area") as HTMLDivElement;
            //// (1-2) シーン設定
            const scene = new THREE.Scene();
            // scene.add(new THREE.AxesHelper(5));
            scene.add(new THREE.GridHelper(10, 10));
            //// (1-3)カメラの生成
            // const camera = new THREE.PerspectiveCamera(45, avatarDiv.clientWidth / avatarDiv.clientHeight, 0.1, 1000);
            const camera = new THREE.PerspectiveCamera(45, AVATAR_AREA_WIDTH / AVATAR_AREA_HEIGHT, 0.1, 1000);
            camera.position.set(0, 1.5, -0.5);
            // camera.rotation.set(0, Math.PI, 0);
            // camera.lookAt(new THREE.Vector3(0, 10.0, 0));
            //// (1-4)レンダラーの生成
            const renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(AVATAR_AREA_WIDTH, AVATAR_AREA_HEIGHT);
            renderer.setClearColor(0x7fbfff, 1.0);
            avatarDiv.appendChild(renderer.domElement);

            renderer.domElement.style.width = "";
            renderer.domElement.style.height = "";
            renderer.domElement.style.objectFit = "contain";

            //// (1-5) アバター読み込み
            const loader = new GLTFLoader();

            const p = new Promise<VRM>((resolve, _reject) => {
                loader.load(vrmSetting, async (gltf: GLTF) => {
                    const vrm = await VRM.from(gltf);
                    resolve(vrm);
                });
            });
            const vrm = await p;
            scene.add(vrm.scene);

            //// (1-6) light設定
            const light = new THREE.DirectionalLight(0xffffff);
            light.position.set(-1, 1, -1).normalize();
            scene.add(light);
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.target.x = 0;
            controls.target.y = 1.5;
            controls.target.x = 0;
            controls.update();
            //// (1-7) ステート設定
            threeState.init({
                scene: scene,
                camera: camera,
                renderer: renderer,
                loader: loader,
                charactrer: vrm,
                light: light,
                controls: controls,
            });
            // (1-8) avatar 登録
            console.log("three init !!!!!!!!");
            avatarControlState.setAvatarVRM(vrm, scene);
        };
        initThree();
    }, []);

}