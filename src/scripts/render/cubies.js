import * as THREE from "three";
import { COLOURS } from "../constants/colour-scheme.js";
import { CUBIE_TYPES } from "../model/cubies.js";

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
const getMaterial = (colour) => new THREE.MeshBasicMaterial({ color: colour });

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
      throw new Error(`Unknown corner cubie relativeCoords: ${relativeCoords}`);
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

const getCentreMaterials = (cubie, relativeCoords) => {
  const { x, y, z } = relativeCoords;
  const [sticker] = cubie.getStickers();
  const materials = getBlankMaterials();
  const centreMaterial = getMaterial(sticker);
  // name clickable cubies' material for click handling purposes
  centreMaterial.name = "centreCubie";
  // there is only one sticker, and only one face not on the centre of its axis
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

export function getCubieType(relativeCoords) {
  const { x, y, z } = relativeCoords;
  const centredAxes = [x, y, z].filter((coord) => coord === 1).length;
  if (centredAxes === 0) {
    return CUBIE_TYPES.CORNER;
  }
  if (centredAxes === 1) {
    return CUBIE_TYPES.EDGE;
  }
  if (centredAxes === 2) {
    return CUBIE_TYPES.CENTRE;
  }
  return null; // core of the puzzle, not a cubie
}

/**
 *
 * @param {Cubie} cubie - the cubie model to create geometry for
 * @param {Object} relativeCoords - from (0,0,0) to (2,2,2) describing which cubie this is
 * @param {number} cubieSize - the size of the cubie to create
 */
export function createCubieGeometry(cubie, relativeCoords, cubieSize) {
  const cubieType = getCubieType(relativeCoords);
  if (!cubieType) {
    throw new Error("Attempting to create geometry for core cubie");
  }

  const cubieMaterials = (() => {
    if (cubieType === CUBIE_TYPES.CORNER) {
      return getCornerMaterials(cubie, relativeCoords);
    }
    if (cubieType === CUBIE_TYPES.EDGE) {
      return getEdgeMaterials(cubie, relativeCoords);
    }
    return getCentreMaterials(cubie, relativeCoords);
  })();

  const cubieGeometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
  return new THREE.Mesh(cubieGeometry, [
    cubieMaterials.right,
    cubieMaterials.left,
    cubieMaterials.top,
    cubieMaterials.bottom,
    cubieMaterials.back,
    cubieMaterials.front,
  ]);
}

/**
 *
 * @param {THREE.BoxGeometry} cubie - the cubie geometry to create a wireframe for
 * @param {number} wireframeWidth - the line width for the wireframe
 */
export function createCubieWireframe(cubie, wireframeWidth) {
  const edges = new THREE.EdgesGeometry(cubie.geometry);
  const wireframeMaterial = new THREE.LineBasicMaterial({
    color: COLOURS.INTERNAL,
    linewidth: wireframeWidth,
  });
  const wireframe = new THREE.LineSegments(edges, wireframeMaterial);
  cubie.add(wireframe);
}
