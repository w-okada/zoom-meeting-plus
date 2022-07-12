import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";
import { useEffect, useMemo, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useAppSetting } from "../003_provider/AppSettingProvider";
const AVATAR_AREA_WIDTH = 480;
const AVATAR_AREA_HEIGHT = 320;

export type ThreeState = {
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    loader: GLTFLoader;
    character: VRM | null;
    light: THREE.DirectionalLight
    controls: OrbitControls

    /// function
};
export type ThreeStateAndMethods = ThreeState & {
    setParentDiv: (parent: HTMLDivElement) => void
    loadAvatar: (url: string) => Promise<VRM>
}
export type ThreeStateInitProps = {
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    loader: GLTFLoader;
    charactrer?: VRM;
    light: THREE.DirectionalLight
    controls: OrbitControls
}
export const useThree = (): ThreeStateAndMethods => {
    const { applicationSetting } = useAppSetting()

    //// (1) シーン設定
    const scene = useMemo(() => {
        const scene = new THREE.Scene();
        // scene.add(new THREE.AxesHelper(5));
        scene.add(new THREE.GridHelper(10, 10));
        return scene
    }, [])
    //// (2)カメラの生成
    const camera = useMemo(() => {
        const camera = new THREE.PerspectiveCamera(45, AVATAR_AREA_WIDTH / AVATAR_AREA_HEIGHT, 0.1, 1000);
        camera.position.set(0, 1.5, -0.5);
        return camera
    }, [])
    //// (3)レンダラーの生成
    const renderer = useMemo(() => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(AVATAR_AREA_WIDTH, AVATAR_AREA_HEIGHT);
        renderer.setClearColor(0x7fbfff, 1.0);
        return renderer
    }, [])
    //// (4) Loader
    const loader = useMemo(() => {
        return new GLTFLoader();
    }, [])
    //// (5) light設定
    const light = useMemo(() => {
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(-1, 1, -1).normalize();
        scene.add(light);
        return light
    }, [])
    //// (6) Orbit Control
    const controls = useMemo(() => {
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.x = 0;
        controls.target.y = 1.5;
        controls.target.x = 0;
        controls.update();
        return controls
    }, [])
    const [character, setCharacter] = useState<VRM | null>(null)

    const setParentDiv = (parent: HTMLDivElement) => {
        parent.appendChild(renderer.domElement);

        renderer.domElement.style.width = "";
        renderer.domElement.style.height = "";
        renderer.domElement.style.objectFit = "contain";
    }

    const loadAvatar = async (url: string) => {
        // 既存avatarの取り除き。
        if (character) {
            scene.remove(character.scene)
        }

        // アバター読み込み
        const p = new Promise<VRM>((resolve, _reject) => {
            loader.load(url, async (gltf: GLTF) => {
                const vrm = await VRM.from(gltf);
                resolve(vrm);
            });
        });
        const vrm = await p;
        scene.add(vrm.scene);
        setCharacter(vrm)
        return vrm
    }

    useEffect(() => {
        if (!applicationSetting) {
            return
        }
        loadAvatar(applicationSetting.vrm_path)
    }, [])

    return {
        scene,
        camera,
        renderer,
        loader,
        light,
        controls,
        character,
        setParentDiv,
        loadAvatar,
    }
};
