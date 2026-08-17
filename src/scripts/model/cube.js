import { COLOURS } from "../constants/colour-scheme.js";
import { DIRECTIONS } from "../constants/directions.js";
import { cycleArrayElementsAtIndices } from "../utils/cycle-array-elements.js";
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

    // // Change parity for corners
    // if (type === "corners" && !polar) {
    //   [positionA, positionC].forEach((piece) => {
    //     this.corners[piece][1] = (this.corners[piece][1] + 2) % 3;
    //   });
    //   [positionB, positionD].forEach((piece) => {
    //     this.corners[piece][1] = (this.corners[piece][1] + 1) % 3;
    //   });
    // }
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

    // // Change parity for edges
    // if (type === "edges") {
    //   [positionA, positionB, positionC, positionD].forEach((position) => {
    //     const pieceState = this.edges[position];
    //     pieceState[1] = (pieceState[1] + 1) % 2; // Flip parity
    //   });
    // }
  }

  #faceTurn(face, direction) {
    this.#faceTurnCorners(face, direction);
    this.#faceTurnEdges(face, direction);
  }

  // Clockwise Turns in standard cubing notation
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
  isSolved() {
    let solved = true;
    // Check edges
    Object.keys(this.edges).every((position) => {
      const [cubie, orientation] = this.edges[position];
      if (cubie !== parseInt(position, 10) || orientation !== 0) {
        solved = false;
        return false;
      }
      return true;
    });

    // Check corners only if the edges were okay
    if (solved) {
      Object.keys(this.corners).every((position) => {
        const [cubie, orientation] = this.corners[position];
        if (cubie !== parseInt(position, 10) || orientation !== 0) {
          solved = false;
          return false;
        }
        return true;
      });
    }

    return solved;
  }

  scramble() {
    this.scrambleEdges();
    this.scrambleCorners();
  }

  scrambleEdges() {
    const positions = Object.keys(this.edges);
    this.shuffleArray(positions);
    for (let i = 0; i < positions.length - 1; i += 1) {
      this.edges[positions[i]][1] = Math.floor(Math.random() * 2); // Random orientation
    }
    // Calculate the sum of the first 11 orientations modulo 2
    const sumMod2 =
      positions
        .slice(0, -1)
        .reduce((sum, position) => sum + this.edges[position][1], 0) % 2;
    // Assign the calculated orientation to the last edge
    this.edges[positions[positions.length - 1]][1] = sumMod2;
  }

  scrambleCorners() {
    const positions = Object.keys(this.corners);
    this.shuffleArray(positions);
    for (let i = 0; i < positions.length - 1; i += 1) {
      this.corners[positions[i]][1] = Math.floor(Math.random() * 3); // Random orientation
    }
    // Calculate the sum of the first 7 orientations modulo 23
    const sumMod3 =
      positions
        .slice(0, -1)
        .reduce((sum, position) => sum + this.edges[position][1], 0) % 3;
    // Assign the calculated orientation to the last edge
    this.corners[positions[positions.length - 1]][1] = (3 - sumMod3) % 3;
  }

  // Fisher-Yates shuffle
  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      // eslint-disable-next-line no-param-reassign
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export default Cube;
