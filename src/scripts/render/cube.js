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

const CUBIE_WIREFRAME_WIDTH = 2;
const CUBIE_SIZE = 5;

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

  const pivot = new THREE.Vector3(
    1 * CUBIE_SIZE,
    1 * CUBIE_SIZE,
    1 * CUBIE_SIZE,
  );
  const rotation = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      convertDegreesToRadians(deltaMove.y * 1),
      convertDegreesToRadians(deltaMove.x * 1),
      0,
      "XYZ",
    ),
  );
  cubeGroup.position.sub(pivot);
  cubeGroup.position.applyQuaternion(rotation);
  cubeGroup.position.add(pivot);

  cubeGroup.quaternion.premultiply(rotation);
  // update for the next movement
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
});

// handle turns
function rotateFace(face, direction) {
  const tempSubGroup = new THREE.Group();
  const rotationAmount =
    ((direction === DIRECTIONS.CLOCKWISE ? 1 : -1) * Math.PI) / 2;
  const conditionFunction = (() => {
    switch (face) {
      case Cube.FACES.RIGHT:
        return (cubie) => cubie.position.x === 2 * CUBIE_SIZE;
      case Cube.FACES.LEFT:
        return (cubie) => cubie.position.x === 0 * CUBIE_SIZE;
      case Cube.FACES.TOP:
        return (cubie) => cubie.position.y === 2 * CUBIE_SIZE;
      case Cube.FACES.BOTTOM:
        return (cubie) => cubie.position.y === 0 * CUBIE_SIZE;
      case Cube.FACES.BACK:
        return (cubie) => cubie.position.z === 2 * CUBIE_SIZE;
      case Cube.FACES.FRONT:
        return (cubie) => cubie.position.z === 0 * CUBIE_SIZE;
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
  const pivot = new THREE.Vector3(
    1 * CUBIE_SIZE,
    1 * CUBIE_SIZE,
    1 * CUBIE_SIZE,
  );

  switch (face) {
    case Cube.FACES.RIGHT:
      tempSubGroup.rotation.x -= rotationAmount;
      pivot.x = 2 * CUBIE_SIZE;
      break;
    case Cube.FACES.LEFT:
      tempSubGroup.rotation.x += rotationAmount;
      pivot.x = 0 * CUBIE_SIZE;
      break;
    case Cube.FACES.TOP:
      tempSubGroup.rotation.y -= rotationAmount;
      pivot.y = 2 * CUBIE_SIZE;
      break;
    case Cube.FACES.BOTTOM:
      tempSubGroup.rotation.y += rotationAmount;
      pivot.y = 0 * CUBIE_SIZE;
      break;
    case Cube.FACES.BACK:
      tempSubGroup.rotation.z -= rotationAmount;
      pivot.z = 2 * CUBIE_SIZE;
      break;
    case Cube.FACES.FRONT:
      tempSubGroup.rotation.z += rotationAmount;
      pivot.z = 0 * CUBIE_SIZE;
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
    cubie.position.sub(pivot);
    cubie.position.applyQuaternion(tempSubGroup.quaternion);
    cubie.position.add(pivot);
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

// Handle clicks for face turns
function onMouseClick(event) {
  if (event.button !== 0) {
    return; // left click only
  }
  const isShiftHeld = event.shiftKey;
  const direction = isShiftHeld
    ? DIRECTIONS.ANTI_CLOCKWISE
    : DIRECTIONS.CLOCKWISE;

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
      const isCentre = intersects[i].object.material.some(
        (material) => material.name === "centreCubie",
      );
      if (isCentre) {
        let face;
        const [x, y, z] = Object.values(intersects[i].object.position);
        if (x === 2 * CUBIE_SIZE) face = Cube.FACES.RIGHT;
        if (x === 0 * CUBIE_SIZE) face = Cube.FACES.LEFT;
        if (y === 2 * CUBIE_SIZE) face = Cube.FACES.TOP;
        if (y === 0 * CUBIE_SIZE) face = Cube.FACES.BOTTOM;
        if (z === 2 * CUBIE_SIZE) face = Cube.FACES.BACK;
        if (z === 0 * CUBIE_SIZE) face = Cube.FACES.FRONT;
        rotateFace(face, direction);

        const cubeNotationFaceLetter = (() => {
          switch (face) {
            case Cube.FACES.RIGHT:
              return "R";
            case Cube.FACES.LEFT:
              return "L";
            case Cube.FACES.TOP:
              return "U";
            case Cube.FACES.BOTTOM:
              return "D";
            case Cube.FACES.BACK:
              return "B";
            case Cube.FACES.FRONT:
              return "F";
            default:
              throw new Error(
                `Unknown face in face enum to cube notation map: ${face}`,
              );
          }
        })();
        const cubeNotationDirectionLetter =
          direction === DIRECTIONS.CLOCKWISE ? "" : "i";
        const cubeTurnMethodName = `turn${cubeNotationFaceLetter}${cubeNotationDirectionLetter}`;
        cube[cubeTurnMethodName]();
      }
      // stop checking the ray here since any other intersections are background
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

// TODO: abstract this rotation logic to a function, it's used twice
// initial rotation to show front, right, and top faces
const pivot = new THREE.Vector3(1 * CUBIE_SIZE, 1 * CUBIE_SIZE, 1 * CUBIE_SIZE);
const rotation = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(
    convertDegreesToRadians(30),
    convertDegreesToRadians(-35),
    0,
    "XYZ",
  ),
);
cubeGroup.position.sub(pivot);
cubeGroup.position.applyQuaternion(rotation);
cubeGroup.position.add(pivot);
cubeGroup.quaternion.premultiply(rotation);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
