import * as THREE from "three";
import { CUBIE_SIZE } from "../constants/dimensions.js";
import { DIRECTIONS } from "../constants/directions.js";

function handleWindowResize(renderer, camera) {
  return () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };
}

// TODO: make right click clockwise and left click anticlockwise
function handleSuppressRightClickContextMenu() {
  return (event) => {
    event.preventDefault();
  };
}

const rightClickDragState = {
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
};

function handleMousedownDragCubeRotation() {
  return (event) => {
    if (event.button !== 2) return; // right mouse button only
    rightClickDragState.isDragging = true;
    rightClickDragState.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    // prevent the default behavior of the right mouse button
    event.preventDefault();
  };
}

function handleMouseupDragCubeRotation() {
  return () => {
    rightClickDragState.isDragging = false;
  };
}

function handleMousemoveDragCubeRotation(cube) {
  return (event) => {
    if (!rightClickDragState.isDragging) return;
    const moveDelta = {
      x: event.clientX - rightClickDragState.previousMousePosition.x,
      y: event.clientY - rightClickDragState.previousMousePosition.y,
    };
    cube.rotateCube(moveDelta.x, moveDelta.y);
    // reset for the next movement
    rightClickDragState.previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  };
}

function handleClickFaceTurns(camera, cube) {
  return (event) => {
    if (event.button !== 0) {
      // TODO: make right click clockwise and left click anticlockwise
      return; // left click only
    }
    const isShiftHeld = event.shiftKey;
    const direction = isShiftHeld
      ? DIRECTIONS.ANTI_CLOCKWISE
      : DIRECTIONS.CLOCKWISE;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Create a raycaster to check for intersections
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cube.children, true);
    for (let i = 0; i < intersects.length; i += 1) {
      // Find the first raycast intersection that is a face
      if (intersects[i].face) {
        const isCentre = intersects[i].object.material.some(
          (material) => material.name === "centreCubie",
        );
        if (isCentre) {
          let face;
          const [x, y, z] = Object.values(intersects[i].object.position);
          if (x === 2 * CUBIE_SIZE) face = cube.FACES.RIGHT;
          if (x === 0 * CUBIE_SIZE) face = cube.FACES.LEFT;
          if (y === 2 * CUBIE_SIZE) face = cube.FACES.TOP;
          if (y === 0 * CUBIE_SIZE) face = cube.FACES.BOTTOM;
          if (z === 2 * CUBIE_SIZE) face = cube.FACES.FRONT;
          if (z === 0 * CUBIE_SIZE) face = cube.FACES.BACK;
          cube.rotateFace(face, direction);
        }
        // stop checking the ray here since any other intersections are background
        break;
      }
    }
  };
}

export function addEventListeners(renderer, camera, cube) {
  window.addEventListener("resize", handleWindowResize(renderer, camera));
  document.addEventListener(
    "contextmenu",
    handleSuppressRightClickContextMenu(),
  );
  renderer.domElement.addEventListener(
    "mousedown",
    handleMousedownDragCubeRotation(),
  );
  renderer.domElement.addEventListener(
    "mouseup",
    handleMouseupDragCubeRotation(),
  );
  renderer.domElement.addEventListener(
    "mousemove",
    handleMousemoveDragCubeRotation(cube),
  );
  renderer.domElement.addEventListener(
    "click",
    handleClickFaceTurns(camera, cube),
  );
}
