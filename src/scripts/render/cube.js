import * as THREE from "three";
import { CUBIE_SIZE, CUBIE_WIREFRAME_WIDTH } from "../constants/dimensions.js";
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

const cubeGroup = new THREE.Group();

// create and position the cubies
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

cubeGroup.rotateCube = function rotateCube(deltaX, deltaY) {
  const pivot = new THREE.Vector3(
    1 * CUBIE_SIZE,
    1 * CUBIE_SIZE,
    1 * CUBIE_SIZE,
  );
  const rotation = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      convertDegreesToRadians(deltaY),
      convertDegreesToRadians(deltaX),
      0,
      "XYZ",
    ),
  );
  cubeGroup.position.sub(pivot);
  cubeGroup.position.applyQuaternion(rotation);
  cubeGroup.position.add(pivot);
  cubeGroup.quaternion.premultiply(rotation);
};

function rotateFaceInRender(face, direction) {
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
      case Cube.FACES.FRONT:
        return (cubie) => cubie.position.z === 2 * CUBIE_SIZE;
      case Cube.FACES.BACK:
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
    case Cube.FACES.FRONT:
      tempSubGroup.rotation.z -= rotationAmount;
      pivot.z = 2 * CUBIE_SIZE;
      break;
    case Cube.FACES.BACK:
      tempSubGroup.rotation.z += rotationAmount;
      pivot.z = 0 * CUBIE_SIZE;
      break;
    default:
      break;
  }

  // update rotation and position of each cubie in the temporary subgroup
  tempSubGroup.children.forEach((cubie) => {
    cubie.position.sub(pivot);
    cubie.position.applyQuaternion(tempSubGroup.quaternion);
    cubie.position.add(pivot);
    cubie.quaternion.premultiply(tempSubGroup.quaternion);
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

function rotateFaceInModel(face, direction) {
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
      case Cube.FACES.FRONT:
        return "F";
      case Cube.FACES.BACK:
        return "B";
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

cubeGroup.rotateFace = function rotateFace(face, direction) {
  rotateFaceInRender(face, direction);
  rotateFaceInModel(face, direction);
};

cubeGroup.queryCentreCubieFace = function queryCentreCubieFace(relativeCoords) {
  const { x, y, z } = relativeCoords;
  if (x === 2 * CUBIE_SIZE) return Cube.FACES.RIGHT;
  if (x === 0 * CUBIE_SIZE) return Cube.FACES.LEFT;
  if (y === 2 * CUBIE_SIZE) return Cube.FACES.TOP;
  if (y === 0 * CUBIE_SIZE) return Cube.FACES.BOTTOM;
  if (z === 2 * CUBIE_SIZE) return Cube.FACES.FRONT;
  if (z === 0 * CUBIE_SIZE) return Cube.FACES.BACK;
  throw new Error(`Unknown centre cubie coords in query: ${relativeCoords}`);
};

// temp: for debugging purposes
// TODO: replace this with a popup dialogue when a scrambled puzzle is returned to solved
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    // Call cube.isSolved and alert the result
    alert(`Is the cube solved? ${cube.isSolved() ? "Yes" : "No"}`);
  }
});

export { cubeGroup as cube };
