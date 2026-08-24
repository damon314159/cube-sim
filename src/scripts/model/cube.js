import { COLOURS } from "../constants/colour-scheme.js";
import { DIRECTIONS } from "../constants/directions.js";
import { cycleArrayElementsAtIndices } from "../utils/cycle-array-elements.js";
import { randInt } from "../utils/rand.js";
import { inversions, shuffleArray } from "../utils/shuffle-array.js";
import { Centre, Corner, Edge } from "./cubies.js";

export class Cube {
  static FACES = {
    TOP: "top",
    BOTTOM: "bottom",
    FRONT: "front",
    LEFT: "left",
    BACK: "back",
    RIGHT: "right",
  };

  constructor() {
    // positions of corners/edges are in the order that the pieces would be discovered
    // by a nested for loop with x outermost then y then z innermost.
    // see ./cube-position-labelling.jpg for visual aid
    const cornerColourTriples = [
      [COLOURS.BOTTOM, COLOURS.BACK, COLOURS.LEFT],
      [COLOURS.BOTTOM, COLOURS.LEFT, COLOURS.FRONT],
      [COLOURS.TOP, COLOURS.LEFT, COLOURS.BACK],
      [COLOURS.TOP, COLOURS.FRONT, COLOURS.LEFT],
      [COLOURS.BOTTOM, COLOURS.RIGHT, COLOURS.BACK],
      [COLOURS.BOTTOM, COLOURS.FRONT, COLOURS.RIGHT],
      [COLOURS.TOP, COLOURS.BACK, COLOURS.RIGHT],
      [COLOURS.TOP, COLOURS.RIGHT, COLOURS.FRONT],
    ];
    this.corners = cornerColourTriples.map(
      ([colour1, colour2, colour3], index) =>
        new Corner({ colour1, colour2, colour3, startingPosition: index }),
    );

    const edgeColourPairs = [
      [COLOURS.BOTTOM, COLOURS.LEFT],
      [COLOURS.BACK, COLOURS.LEFT],
      [COLOURS.FRONT, COLOURS.LEFT],
      [COLOURS.TOP, COLOURS.LEFT],
      [COLOURS.BOTTOM, COLOURS.BACK],
      [COLOURS.BOTTOM, COLOURS.FRONT],
      [COLOURS.TOP, COLOURS.BACK],
      [COLOURS.TOP, COLOURS.FRONT],
      [COLOURS.BOTTOM, COLOURS.RIGHT],
      [COLOURS.BACK, COLOURS.RIGHT],
      [COLOURS.FRONT, COLOURS.RIGHT],
      [COLOURS.TOP, COLOURS.RIGHT],
    ];
    this.edges = edgeColourPairs.map(
      ([colour1, colour2], index) =>
        new Edge({ colour1, colour2, startingPosition: index }),
    );

    const centreColours = [
      COLOURS.LEFT,
      COLOURS.BOTTOM,
      COLOURS.BACK,
      COLOURS.FRONT,
      COLOURS.TOP,
      COLOURS.RIGHT,
    ];
    this.centres = centreColours.map((colour) => new Centre({ colour }));
  }

  // Methods to perform turns
  // ---

  #faceTurnCorners(face, direction) {
    const positionsToCycleClockwise = new Map([
      [Cube.FACES.TOP, [2, 6, 7, 3]],
      [Cube.FACES.BOTTOM, [0, 1, 5, 4]],
      [Cube.FACES.FRONT, [1, 3, 7, 5]],
      [Cube.FACES.LEFT, [0, 2, 3, 1]],
      [Cube.FACES.BACK, [0, 4, 6, 2]],
      [Cube.FACES.RIGHT, [4, 5, 7, 6]],
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
      [Cube.FACES.TOP, [3, 6, 11, 7]],
      [Cube.FACES.BOTTOM, [0, 5, 8, 4]],
      [Cube.FACES.FRONT, [2, 7, 10, 5]],
      [Cube.FACES.LEFT, [0, 1, 3, 2]],
      [Cube.FACES.BACK, [1, 4, 9, 6]],
      [Cube.FACES.RIGHT, [8, 10, 11, 9]],
    ]).get(face);
    const positionsToCycle =
      direction === DIRECTIONS.CLOCKWISE
        ? positionsToCycleClockwise
        : positionsToCycleClockwise.toReversed();

    cycleArrayElementsAtIndices(this.edges, positionsToCycle);

    // edges naturally flip as turns are made, we need to update their orientations
    const shouldFlipPerPosition = new Map([
      [Cube.FACES.TOP, [false, false, false, false]],
      [Cube.FACES.BOTTOM, [false, false, false, false]],
      [Cube.FACES.FRONT, [true, true, true, true]],
      [Cube.FACES.LEFT, [false, false, false, false]],
      [Cube.FACES.BACK, [true, true, true, true]],
      [Cube.FACES.RIGHT, [false, false, false, false]],
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

  #scrambleCorners() {
    this.corners = shuffleArray(this.corners);
    let totalRotation = 0;
    // Random orientation for first n-1 corners
    for (let i = 0; i < this.corners.length - 1; i += 1) {
      const rotationIncrements = randInt(0, 2);
      totalRotation += rotationIncrements;
      this.corners[i].rotate(rotationIncrements);
    }
    // Last corner has its orientation forced by modulo parity
    if (totalRotation % 3 === 1) {
      this.corners.at(-1).rotate(2);
    }
    if (totalRotation % 3 === 2) {
      this.corners.at(-1).rotate(1);
    }
  }

  #scrambleEdges() {
    this.edges = shuffleArray(this.edges);
    let numFlipped = 0;
    // Random orientation for first n-1 edges
    for (let i = 0; i < this.edges.length - 1; i += 1) {
      if (randInt(0, 1) === 0) {
        numFlipped += 1;
        this.edges[i].flip();
      }
    }
    // Last edge has its flip state forced by modulo parity
    if (numFlipped % 2 === 1) {
      this.edges.at(-1).flip();
    }
  }

  #scrambleParityFix() {
    const cornerStartingPositions = this.corners.map(
      (corner) => corner.startingPosition,
    );
    const cornerParity = inversions(cornerStartingPositions) % 2;
    const edgeStartingPositions = this.edges.map(
      (edge) => edge.startingPosition,
    );
    const edgeParity = inversions(edgeStartingPositions) % 2;

    // if the parities do not match, we swap two corners to fix it
    if (cornerParity !== edgeParity) {
      [this.corners[0], this.corners[1]] = [this.corners[1], this.corners[0]];
    }
  }

  scramble() {
    this.#scrambleCorners();
    this.#scrambleEdges();
    this.#scrambleParityFix();
  }
}
