import * as THREE from "three";
import { DIRECTIONS } from "../constants/directions.js";
import { Cube } from "../model/cube.js";
import { CUBIE_TYPES } from "../model/cubies.js";
import { convertDegreesToRadians } from "../utils/maths.js";
import {
  createCubieGeometry,
  createCubieWireframe,
  getCubieType,
} from "./cubies.js";

const cube = new Cube();

const SCENE_FOV = 75;
const SCENE_PLANE_DISTANCES = {
  NEAR: 0.1,
  FAR: 1000,
};
const STARTING_Z_POSITION = 5;
const CUBIE_WIREFRAME_WIDTH = 2;
const CUBIE_SIZE = 1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  SCENE_FOV,
  window.innerWidth / window.innerHeight,
  SCENE_PLANE_DISTANCES.NEAR,
  SCENE_PLANE_DISTANCES.FAR,
);
camera.position.z = STARTING_Z_POSITION;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

// Create and position the cubies
const renderedCounts = {
  [CUBIE_TYPES.CORNER]: 0,
  [CUBIE_TYPES.EDGE]: 0,
  [CUBIE_TYPES.CENTRE]: 0,
};
for (let x = 0; x < 3; x += 1) {
  for (let y = 0; y < 3; y += 1) {
    for (let z = 0; z < 3; z += 1) {
      const cubieType = getCubieType({ x, y, z });
      if (!cubieType) continue; // in the core of the cube, do not render

      const cubieModel = (() => {
        const currentPosition = renderedCounts[cubieType];
        if (cubieType === CUBIE_TYPES.CORNER) {
          return cube.corners[currentPosition];
        }
        if (cubieType === CUBIE_TYPES.EDGE) {
          return cube.edges[currentPosition];
        }
        return cube.centres[currentPosition];
      })();

      const cubie = createCubieGeometry(cubieModel, { x, y, z }, CUBIE_SIZE);
      createCubieWireframe(cubie, CUBIE_WIREFRAME_WIDTH);
      // TODO: previously the cubies were all centred on 0,0,0. Need to ensure that everything works now the centre is at 1,1,1 instead
      cubie.position.set(x * CUBIE_SIZE, y * CUBIE_SIZE, z * CUBIE_SIZE);
      cubeGroup.add(cubie);

      renderedCounts[cubieType] += 1;
    }
  }
}

window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

// Suppress standard right click menu
// TODO: make right click clockwise and left click anticlockwise
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

// Handle right click + drag for cube rotations
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
document.addEventListener("mousedown", (event) => {
  if (event.button !== 2) return; // right mouse button only
  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
  // Prevent the default behavior of the right mouse button
  event.preventDefault();
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (event) => {
  if (!isDragging) return;
  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y,
  };

  const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      convertDegreesToRadians(deltaMove.y * 1),
      convertDegreesToRadians(deltaMove.x * 1),
      0,
      "XYZ",
    ),
  );
  cubeGroup.quaternion.multiplyQuaternions(
    deltaRotationQuaternion,
    cubeGroup.quaternion, // must use .multiplyQuaternions and not .multiply due to non-commutativity
  );
  // update for the next movement
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
});

// handle turns
function rotateFace(face, direction = DIRECTIONS.CLOCKWISE) {
  const tempSubGroup = new THREE.Group();
  const rotationAmount =
    ((direction === DIRECTIONS.CLOCKWISE ? 1 : -1) * Math.PI) / 2;
  const conditionFunction = (() => {
    switch (face) {
      case Cube.FACES.RIGHT:
        return (cubie) => cubie.position.x === 2;
      case Cube.FACES.LEFT:
        return (cubie) => cubie.position.x === 0;
      case Cube.FACES.TOP:
        return (cubie) => cubie.position.y === 2;
      case Cube.FACES.BOTTOM:
        return (cubie) => cubie.position.y === 0;
      case Cube.FACES.BACK:
        return (cubie) => cubie.position.z === 2;
      case Cube.FACES.FRONT:
        return (cubie) => cubie.position.z === 0;
      default:
        return () => false;
    }
  })();

  // iterate backwards because they will be removed from the main group as they are added to the temp group
  for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
    const cubie = cubeGroup.children[i];
    if (conditionFunction(cubie)) {
      tempSubGroup.add(cubie);
    }
  }

  switch (face) {
    case Cube.FACES.RIGHT:
      tempSubGroup.rotation.x -= rotationAmount;
      break;
    case Cube.FACES.LEFT:
      tempSubGroup.rotation.x += rotationAmount;
      break;
    case Cube.FACES.TOP:
      tempSubGroup.rotation.y -= rotationAmount;
      break;
    case Cube.FACES.BOTTOM:
      tempSubGroup.rotation.y += rotationAmount;
      break;
    case Cube.FACES.BACK:
      tempSubGroup.rotation.z -= rotationAmount;
      break;
    case Cube.FACES.FRONT:
      tempSubGroup.rotation.z += rotationAmount;
      break;
    default:
      break;
  }

  // update rotation and position of each cubie in the temporary subgroup
  tempSubGroup.children.forEach((cubie) => {
    cubie.rotation.setFromQuaternion(
      cubie.quaternion
        .clone() // TODO: I think this clone can be removed - test it
        .invert()
        .multiply(tempSubGroup.quaternion.clone().invert())
        .clone() // TODO: I think this clone can be removed - test it
        .invert(),
    );
    cubie.position.applyQuaternion(tempSubGroup.quaternion);
    // round the positions to integers after rotation to avoid cumulative float errors
    cubie.position.x = Math.round(cubie.position.x);
    cubie.position.y = Math.round(cubie.position.y);
    cubie.position.z = Math.round(cubie.position.z);
  });

  // return cubies back to the main cubeGroup
  for (let i = tempSubGroup.children.length - 1; i >= 0; i -= 1) {
    const cubie = tempSubGroup.children[i];
    cubeGroup.add(cubie);
  }
}

// -----
// TODO -- rest of this file from here down hasn't been worked through yet
// -----

// Handle clicks for face turns
function onMouseClick(event) {
  // Filter out non-left clicks
  if (event.button !== 0) {
    return;
  }
  const isShiftHeld = event.shiftKey;

  // Calculate mouse coordinates
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Create a raycaster and check for intersections
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cubeGroup.children, true);
  for (let i = 0; i < intersects.length; i += 1) {
    // Find the first raycast intersection that is a face
    if (intersects[i].face) {
      // Test that cubie for being a centre cubie
      let isCentre = false;
      intersects[i].object.material.some((material) => {
        if (material.name === "centreCubie") {
          isCentre = true;
          return true; // Breaks out of the some loop
        }
        return false;
      });
      // If it was a centre cubie, determine which, and perform the turn
      if (isCentre) {
        let face;
        const [x, y, z] = Object.values(intersects[i].normal);
        if (x === 1) face = "r";
        if (x === -1) face = "l";
        if (y === 1) face = "u";
        if (y === -1) face = "d";
        if (z === 1) face = "f";
        if (z === -1) face = "b";
        rotateFace(face, isShiftHeld ? "i" : "c");
        cube[`turn${face.toUpperCase()}${isShiftHeld ? "i" : ""}`]();
      }
      // Stop checking the ray here since any other intersections are background
      break;
    }
  }
}
renderer.domElement.addEventListener("click", onMouseClick);

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    // Call cube.isSolved and alert the result
    alert(`Is the cube solved? ${cube.isSolved() ? "Yes" : "No"}`);
  }
});

// Initial rotation to show front, right, and top faces
cubeGroup.rotation.set(
  convertDegreesToRadians(30),
  convertDegreesToRadians(-35),
  0,
);
// Create an animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
