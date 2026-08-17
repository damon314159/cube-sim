import { COLOURS } from "../constants/colour-scheme.js";
import { DIRECTIONS } from "../constants/directions.js";
import { cycleArrayElementsAtIndices } from "../utils/cycle-array-elements.js";
import { shuffleArray } from "../utils/shuffle-array.js";
import { Centre, Corner, Edge } from "./cubies.js";

class Cube {
  static FACES = {
    TOP: "top",
    BOTTOM: "bottom",
    FRONT: "front",
    LEFT: "left",
    BACK: "back",
    RIGHT: "right",
  };

  constructor() {
    const cornerColourTriples = [
      [COLOURS.TOP, COLOURS.RIGHT, COLOURS.FRONT],
      [COLOURS.TOP, COLOURS.FRONT, COLOURS.LEFT],
      [COLOURS.TOP, COLOURS.LEFT, COLOURS.BACK],
      [COLOURS.TOP, COLOURS.BACK, COLOURS.RIGHT],
      [COLOURS.BOTTOM, COLOURS.FRONT, COLOURS.RIGHT],
      [COLOURS.BOTTOM, COLOURS.LEFT, COLOURS.FRONT],
      [COLOURS.BOTTOM, COLOURS.BACK, COLOURS.LEFT],
      [COLOURS.BOTTOM, COLOURS.RIGHT, COLOURS.BACK],
    ];
    this.corners = cornerColourTriples.map(
      ([colour1, colour2, colour3], index) =>
        new Corner({ colour1, colour2, colour3, startingPosition: index }),
    );

    const edgeColourPairs = [
      [COLOURS.TOP, COLOURS.FRONT],
      [COLOURS.TOP, COLOURS.LEFT],
      [COLOURS.TOP, COLOURS.BACK],
      [COLOURS.TOP, COLOURS.RIGHT],
      [COLOURS.BOTTOM, COLOURS.FRONT],
      [COLOURS.BOTTOM, COLOURS.LEFT],
      [COLOURS.BOTTOM, COLOURS.BACK],
      [COLOURS.BOTTOM, COLOURS.RIGHT],
      [COLOURS.RIGHT, COLOURS.FRONT],
      [COLOURS.FRONT, COLOURS.LEFT],
      [COLOURS.LEFT, COLOURS.BACK],
      [COLOURS.BACK, COLOURS.RIGHT],
    ];
    this.edges = edgeColourPairs.map(
      ([colour1, colour2], index) =>
        new Edge({ colour1, colour2, startingPosition: index }),
    );

    const centreColours = [
      COLOURS.TOP,
      COLOURS.BOTTOM,
      COLOURS.FRONT,
      COLOURS.LEFT,
      COLOURS.BACK,
      COLOURS.RIGHT,
    ];
    this.centres = centreColours.map((colour) => new Centre({ colour }));
  }

  // Methods to perform turns
  // ---

  #faceTurnCorners(face, direction) {
    const positionsToCycleClockwise = new Map([
      [Cube.FACES.TOP, [0, 1, 2, 3]],
      [Cube.FACES.BOTTOM, [7, 6, 5, 4]],
      [Cube.FACES.FRONT, [4, 5, 1, 0]],
      [Cube.FACES.LEFT, [5, 6, 2, 1]],
      [Cube.FACES.BACK, [6, 2, 3, 7]],
      [Cube.FACES.RIGHT, [7, 4, 0, 3]],
    ]).get(face);
    const positionsToCycle =
      direction === DIRECTIONS.CLOCKWISE
        ? positionsToCycleClockwise
        : positionsToCycleClockwise.toReversed();

    cycleArrayElementsAtIndices(this.corners, positionsToCycle);

    // corners naturally rotate as turns are made, we need to update their orientations
    const rotationIncrementsPerPosition = new Map([
      [Cube.FACES.TOP, [0, 0, 0, 0]],
      [Cube.FACES.BOTTOM, [0, 0, 0, 0]],
      [Cube.FACES.FRONT, [2, 1, 2, 1]],
      [Cube.FACES.LEFT, [2, 1, 2, 1]],
      [Cube.FACES.BACK, [2, 1, 2, 1]],
      [Cube.FACES.RIGHT, [2, 1, 2, 1]],
    ]).get(face);
    rotationIncrementsPerPosition.forEach((increment, index) => {
      const corner = this.corners[positionsToCycle[index]];
      corner.rotate(increment);
    });
  }

  #faceTurnEdges(face, direction) {
    const positionsToCycleClockwise = new Map([
      [Cube.FACES.TOP, [0, 1, 2, 3]],
      [Cube.FACES.BOTTOM, [6, 5, 4, 7]],
      [Cube.FACES.FRONT, [4, 9, 0, 8]],
      [Cube.FACES.LEFT, [5, 10, 1, 9]],
      [Cube.FACES.BACK, [6, 11, 2, 10]],
      [Cube.FACES.RIGHT, [7, 8, 3, 11]],
    ]).get(face);
    const positionsToCycle =
      direction === DIRECTIONS.CLOCKWISE
        ? positionsToCycleClockwise
        : positionsToCycleClockwise.toReversed();

    cycleArrayElementsAtIndices(this.edges, positionsToCycle);

    // edges naturally flip as turns are made, we need to update their orientations
    const shouldFlipPerPosition = new Map([
      [Cube.FACES.TOP, [true, true, true, true]], // todo: figure out what these should actually be set to. brain too fried rn
      [Cube.FACES.BOTTOM, [true, true, true, true]], // todo: as above
      [Cube.FACES.FRONT, [true, true, true, true]], // todo: as above
      [Cube.FACES.LEFT, [true, true, true, true]], // todo: as above
      [Cube.FACES.BACK, [true, true, true, true]], // todo: as above
      [Cube.FACES.RIGHT, [true, true, true, true]], // todo: as above
    ]).get(face);
    shouldFlipPerPosition.forEach((shouldFlip, index) => {
      const edge = this.edges[positionsToCycle[index]];
      if (shouldFlip) {
        edge.flip();
      }
    });
  }

  #faceTurn(face, direction) {
    this.#faceTurnCorners(face, direction);
    this.#faceTurnEdges(face, direction);
  }

  // Clockwise Turns in standard cubing notation
  // ---

  turnU() {
    this.#faceTurn(Cube.FACES.TOP, DIRECTIONS.CLOCKWISE);
  }

  turnD() {
    this.#faceTurn(Cube.FACES.BOTTOM, DIRECTIONS.CLOCKWISE);
  }

  turnF() {
    this.#faceTurn(Cube.FACES.FRONT, DIRECTIONS.CLOCKWISE);
  }

  turnL() {
    this.#faceTurn(Cube.FACES.LEFT, DIRECTIONS.CLOCKWISE);
  }

  turnB() {
    this.#faceTurn(Cube.FACES.BACK, DIRECTIONS.CLOCKWISE);
  }

  turnR() {
    this.#faceTurn(Cube.FACES.RIGHT, DIRECTIONS.CLOCKWISE);
  }

  // Anticlockwise (inverted) turns in standard cubing notation
  // ---

  turnUi() {
    this.#faceTurn(Cube.FACES.TOP, DIRECTIONS.ANTI_CLOCKWISE);
  }

  turnDi() {
    this.#faceTurn(Cube.FACES.BOTTOM, DIRECTIONS.ANTI_CLOCKWISE);
  }

  turnFi() {
    this.#faceTurn(Cube.FACES.FRONT, DIRECTIONS.ANTI_CLOCKWISE);
  }

  turnLi() {
    this.#faceTurn(Cube.FACES.LEFT, DIRECTIONS.ANTI_CLOCKWISE);
  }

  turnBi() {
    this.#faceTurn(Cube.FACES.BACK, DIRECTIONS.ANTI_CLOCKWISE);
  }

  turnRi() {
    this.#faceTurn(Cube.FACES.RIGHT, DIRECTIONS.ANTI_CLOCKWISE);
  }

  // General puzzle methods
  // ---

  isSolved() {
    const cornersSolved = this.corners.every(
      (corner, index) =>
        corner.startingPosition === index &&
        corner.orientation === Corner.ORIENTATIONS.SOLVED,
    );
    if (!cornersSolved) {
      return false;
    }

    const edgesSolved = this.edges.every(
      (edge, index) =>
        edge.startingPosition === index &&
        edge.orientation === Edge.ORIENTATIONS.SOLVED,
    );
    if (!edgesSolved) {
      return false;
    }

    return true;
  }

  // The scramble logic from the original implementation needs fixing, it doesn't account for even/odd parity with respect to permutations
  // ...

  // scramble() {
  //   this.scrambleEdges();
  //   this.scrambleCorners();
  // }

  // scrambleEdges() {
  //   const positions = Object.keys(this.edges);
  //   shuffleArray(positions);
  //   for (let i = 0; i < positions.length - 1; i += 1) {
  //     this.edges[positions[i]][1] = Math.floor(Math.random() * 2); // Random orientation
  //   }
  //   // Calculate the sum of the first 11 orientations modulo 2
  //   const sumMod2 =
  //     positions
  //       .slice(0, -1)
  //       .reduce((sum, position) => sum + this.edges[position][1], 0) % 2;
  //   // Assign the calculated orientation to the last edge
  //   this.edges[positions[positions.length - 1]][1] = sumMod2;
  // }

  // scrambleCorners() {
  //   const positions = Object.keys(this.corners);
  //   shuffleArray(positions);
  //   for (let i = 0; i < positions.length - 1; i += 1) {
  //     this.corners[positions[i]][1] = Math.floor(Math.random() * 3); // Random orientation
  //   }
  //   // Calculate the sum of the first 7 orientations modulo 23
  //   const sumMod3 =
  //     positions
  //       .slice(0, -1)
  //       .reduce((sum, position) => sum + this.edges[position][1], 0) % 3;
  //   // Assign the calculated orientation to the last edge
  //   this.corners[positions[positions.length - 1]][1] = (3 - sumMod3) % 3;
  // }
}

export default Cube;
