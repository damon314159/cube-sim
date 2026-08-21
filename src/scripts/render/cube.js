import * as THREE from "three";
import { COLOURS } from "../constants/colour-scheme.js";
import { Cube } from "../model/cube.js";
import { convertDegreesToRadians } from "../utils/maths.js";

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

function createCubieWireframe(cubie) {
  const edges = new THREE.EdgesGeometry(cubie.geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: COLOURS.INTERNAL,
    linewidth: CUBIE_WIREFRAME_WIDTH,
  });
  const wireframe = new THREE.LineSegments(edges, wireframeMaterial);
  cubie.add(wireframe);
}

/**
 *
 * @param {Cubie} cubie - the cubie to create geometry for
 * @param {Object} relativeCoords - from (0,0,0) to (2,2,2) describing which cubie this is
 */
function createCubieGeometry(cubie, relativeCoords) {
  const internalMaterial = new THREE.MeshBasicMaterial({
    color: COLOURS.INTERNAL,
  });
  const getBlankMaterials = () => ({
    right: internalMaterial,
    left: internalMaterial,
    top: internalMaterial,
    bottom: internalMaterial,
    back: internalMaterial,
    front: internalMaterial,
  });
  const getMaterial = (colour) =>
    new THREE.MeshBasicMaterial({ color: colour });

  const getCornerMaterials = (cubie, relativeCoords) => {
    const { x, y, z } = relativeCoords;
    const stickers = cubie.getOrientedStickers();
    const materials = getBlankMaterials();
    // stickers are labelled clockwise, which means unfortunately you need to just list all 8 cases
    const coordsString = `${x},${y},${z}`;
    switch (coordsString) {
      case "0,0,0":
        materials.bottom = getMaterial(stickers[0]);
        materials.left = getMaterial(stickers[1]);
        materials.front = getMaterial(stickers[2]);
        break;
      case "0,0,2":
        materials.bottom = getMaterial(stickers[0]);
        materials.back = getMaterial(stickers[1]);
        materials.left = getMaterial(stickers[2]);
        break;
      case "0,2,0":
        materials.top = getMaterial(stickers[0]);
        materials.front = getMaterial(stickers[1]);
        materials.left = getMaterial(stickers[2]);
        break;
      case "0,2,2":
        materials.top = getMaterial(stickers[0]);
        materials.left = getMaterial(stickers[1]);
        materials.back = getMaterial(stickers[2]);
        break;
      case "2,0,0":
        materials.bottom = getMaterial(stickers[0]);
        materials.front = getMaterial(stickers[1]);
        materials.right = getMaterial(stickers[2]);
        break;
      case "2,0,2":
        materials.bottom = getMaterial(stickers[0]);
        materials.right = getMaterial(stickers[1]);
        materials.back = getMaterial(stickers[2]);
        break;
      case "2,2,0":
        materials.top = getMaterial(stickers[0]);
        materials.right = getMaterial(stickers[1]);
        materials.front = getMaterial(stickers[2]);
        break;
      case "2,2,2":
        materials.top = getMaterial(stickers[0]);
        materials.back = getMaterial(stickers[1]);
        materials.right = getMaterial(stickers[2]);
        break;
      default:
        throw new Error(
          `Unknown corner cubie relativeCoords: ${relativeCoords}`,
        );
    }
    return materials;
  };

  const getEdgeMaterials = (cubie, relativeCoords) => {
    const { x, y, z } = relativeCoords;
    const stickers = cubie.getOrientedStickers();
    const materials = getBlankMaterials();
    // determine "primary" sticker location. top/bottom have priority, then front/back
    if (y === 2) {
      materials.top = getMaterial(stickers[0]);
    } else if (y === 0) {
      materials.bottom = getMaterial(stickers[0]);
    } else if (z === 2) {
      materials.back = getMaterial(stickers[0]);
    } else {
      materials.front = getMaterial(stickers[0]);
    }
    // determine "secondary" sticker location. left/right have lowest priority, then front/back
    if (x === 2) {
      materials.right = getMaterial(stickers[1]);
    } else if (x === 0) {
      materials.left = getMaterial(stickers[1]);
    } else if (z === 2) {
      materials.back = getMaterial(stickers[1]);
    } else {
      materials.front = getMaterial(stickers[1]);
    }
    return materials;
  };

  const getCenterMaterials = (cubie, relativeCoords) => {
    const { x, y, z } = relativeCoords;
    const [sticker] = cubie.getStickers();
    const materials = getBlankMaterials();
    const centreMaterial = getMaterial(sticker);
    // name clickable cubies' material for click handling purposes
    centreMaterial.name = "centerCubie";
    // there is only one sticker, and only one face not on the center of its axis
    if (x === 2) {
      materials.right = centreMaterial;
    } else if (x === 0) {
      materials.left = centreMaterial;
    } else if (y === 2) {
      materials.top = centreMaterial;
    } else if (y === 0) {
      materials.bottom = centreMaterial;
    } else if (z === 2) {
      materials.back = centreMaterial;
    } else {
      materials.front = centreMaterial;
    }
    return materials;
  };

  const cubieGeometry = new THREE.BoxGeometry(
    CUBIE_SIZE,
    CUBIE_SIZE,
    CUBIE_SIZE,
  );
  // in Three.js a cube geometry's materials are encoded in an array representing right, left, top, bottom, back, front
  return new THREE.Mesh(cubieGeometry, cubieMaterials);
}

// Create and position the cubies
for (let x = 0; x < 3; x += 1) {
  for (let y = 0; y < 3; y += 1) {
    for (let z = 0; z < 3; z += 1) {
      // Create a cubie
      const cubie = createCubieGeometry(x - 1, y - 1, z - 1);
      createCubieWireframe(cubie);
      // Position the cubie
      cubie.position.set(
        (x - 1) * cubieSize,
        (y - 1) * cubieSize,
        (z - 1) * cubieSize,
      );
      cubeGroup.add(cubie);
    }
  }
}

// Handle window resizing
window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

// Suppress standard right click menu
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

// Handle mouse dragging
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
document.addEventListener("mousedown", (event) => {
  if (event.button !== 2) return; // Only proceed for right mouse button
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

  // Rotate the entire group
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
    cubeGroup.quaternion,
  );
  // Update the previous position object for the next movement
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
});

// Handle turns, following standard Rubik's cube notation for faces
// Direction is either c or i for clockwise/inverted
function rotateFace(face, direction = "c") {
  // Create a temporary subgroup for the face
  const tempSubGroup = new THREE.Group();
  // Iterate through cubies in cubeGroup
  const rotationAmount = ((direction === "i" ? 1 : -1) * Math.PI) / 2;
  function getConditionFunction(conditionFace) {
    switch (conditionFace) {
      case "r":
        return (cubie) => cubie.position.x > 0;
      case "l":
        return (cubie) => cubie.position.x < 0;
      case "u":
        return (cubie) => cubie.position.y > 0;
      case "d":
        return (cubie) => cubie.position.y < 0;
      case "f":
        return (cubie) => cubie.position.z > 0;
      case "b":
        return (cubie) => cubie.position.z < 0;
      default:
        return () => false;
    }
  }

  const conditionFunction = getConditionFunction(face);
  for (let i = cubeGroup.children.length - 1; i >= 0; i -= 1) {
    const cubie = cubeGroup.children[i];
    if (conditionFunction(cubie)) {
      tempSubGroup.add(cubie);
    }
  }

  // Adjust rotation based on the face
  switch (face) {
    case "r":
      tempSubGroup.rotation.x += rotationAmount;
      break;
    case "l":
      tempSubGroup.rotation.x -= rotationAmount;
      break;
    case "u":
      tempSubGroup.rotation.y += rotationAmount;
      break;
    case "d":
      tempSubGroup.rotation.y -= rotationAmount;
      break;
    case "f":
      tempSubGroup.rotation.z += rotationAmount;
      break;
    case "b":
      tempSubGroup.rotation.z -= rotationAmount;
      break;
    default:
      break;
  }

  // Update the rotation and position of each cubie in the temporary subgroup
  tempSubGroup.children.forEach((cubie) => {
    cubie.rotation.setFromQuaternion(
      cubie.quaternion
        .clone()
        .invert()
        .multiply(tempSubGroup.quaternion.clone().invert())
        .clone()
        .invert(),
    );
    cubie.position.applyQuaternion(tempSubGroup.quaternion);
    // Round the positions to integers after rotation
    cubie.position.x = Math.round(cubie.position.x);
    cubie.position.y = Math.round(cubie.position.y);
    cubie.position.z = Math.round(cubie.position.z);
  });

  // Add cubies back to the main cubeGroup
  for (let i = tempSubGroup.children.length - 1; i >= 0; i -= 1) {
    const cubie = tempSubGroup.children[i];
    cubeGroup.add(cubie);
  }
}

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
      // Test that cubie for being a center cubie
      let isCenter = false;
      intersects[i].object.material.some((material) => {
        if (material.name === "centerCubie") {
          isCenter = true;
          return true; // Breaks out of the some loop
        }
        return false;
      });
      // If it was a center cubie, determine which, and perform the turn
      if (isCenter) {
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
cubeGroup.rotation.set(toRadians(30), toRadians(-35), 0);
// Create an animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
