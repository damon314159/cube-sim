import * as THREE from "three";
import { CUBIE_SIZE } from "../constants/dimensions.js";

const SCENE_FOV = 75;
const SCENE_PLANE_DISTANCES = {
  NEAR: 0.1,
  FAR: 1000,
};
const CAMERA_STARTING_POSITION = {
  x: 1 * CUBIE_SIZE,
  y: 1 * CUBIE_SIZE,
  z: 6 * CUBIE_SIZE,
};
const CAMERA_STARTING_ROTATION = { x: 0, y: 0, z: 0 };

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  SCENE_FOV,
  window.innerWidth / window.innerHeight,
  SCENE_PLANE_DISTANCES.NEAR,
  SCENE_PLANE_DISTANCES.FAR,
);
camera.position.set(
  CAMERA_STARTING_POSITION.x,
  CAMERA_STARTING_POSITION.y,
  CAMERA_STARTING_POSITION.z,
);
camera.rotation.set(
  CAMERA_STARTING_ROTATION.x,
  CAMERA_STARTING_ROTATION.y,
  CAMERA_STARTING_ROTATION.z,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

export { scene, camera, renderer };
