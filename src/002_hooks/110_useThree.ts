import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM } from "@pixiv/three-vrm";
import { useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export type ThreeState = {
    scene?: THREE.Scene,
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    loader?: GLTFLoader;
    charactrer?: VRM;
    light?: THREE.DirectionalLight
    controls?: OrbitControls

    /// function
};
export type ThreeStateAndMethods = ThreeState & {
    init: (props: ThreeStateInitProps) => void
}
export type ThreeStateInitProps = {
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    loader: GLTFLoader;
    charactrer: VRM;
    light: THREE.DirectionalLight
    controls: OrbitControls
}
export const useThree = (): ThreeStateAndMethods => {
    const [threeState, setThreeState] = useState<ThreeState | null>(null)
    const init = (props: ThreeStateInitProps) => {
        setThreeState({ ...props })
    }

    return {
        ...threeState,
        init,
    }
};
