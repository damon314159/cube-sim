import { cube } from "./cube.js";
import { addEventListeners } from "./events.js";
import { camera, renderer, scene } from "./scene.js";

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

export function render() {
  scene.add(cube);
  cube.rotateCube(-35, 30); // initial rotation to show front, right, and top faces
  addEventListeners(renderer, camera, cube);
  animate();
}
