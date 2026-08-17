import { COLOURS } from "../constants/colour-scheme.js";
import { Centre, Corner, Edge } from "./cubies.js";

class Cube {
  static FACES = {
    TOP: "top",
    BOTTOM: "bottom",
    FRONT: "front",
    BACK: "back",
    LEFT: "left",
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
        new Corner(colour1, colour2, colour3, index),
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
      ([colour1, colour2], index) => new Edge(colour1, colour2, index),
    );

    const centreColours = [
      COLOURS.TOP,
      COLOURS.BOTTOM,
      COLOURS.FRONT,
      COLOURS.LEFT,
      COLOURS.BACK,
      COLOURS.RIGHT,
    ];
    this.centres = centreColours.map((colour) => new Centre(colour));
  }

  #faceTurn(face) {
    const cornersToExchange = new Map();

    // Change parity for edges
    if (type === "edges") {
      [positionA, positionB, positionC, positionD].forEach((position) => {
        const pieceState = this.edges[position];
        pieceState[1] = (pieceState[1] + 1) % 2; // Flip parity
      });
    }

    // Change parity for corners
    if (type === "corners" && !polar) {
      [positionA, positionC].forEach((piece) => {
        this.corners[piece][1] = (this.corners[piece][1] + 2) % 3;
      });
      [positionB, positionD].forEach((piece) => {
        this.corners[piece][1] = (this.corners[piece][1] + 1) % 3;
      });
    }
  }

  // Clockwise Turns
  turnU() {
    // this.#fourCycle("edges", 1, 2, 3, 4);
    // this.#fourCycle("corners", 1, 2, 3, 4, true);
  }

  turnD() {
    // this.#fourCycle("edges", 9, 12, 11, 10);
    // this.#fourCycle("corners", 5, 8, 7, 6, true);
  }

  turnR() {
    // this.#fourCycle("edges", 2, 6, 10, 7);
    // this.#fourCycle("corners", 3, 2, 6, 7);
  }

  turnF() {
    // this.#fourCycle("edges", 3, 7, 11, 8);
    // this.#fourCycle("corners", 4, 3, 7, 8);
  }

  turnL() {
    // this.#fourCycle("edges", 4, 8, 12, 5);
    // this.#fourCycle("corners", 1, 4, 8, 5);
  }

  turnB() {
    // this.#fourCycle("edges", 1, 5, 9, 6);
    // this.#fourCycle("corners", 2, 1, 5, 6);
  }

  // Anticlockwise (inverted) turns
  turnUi() {
    // this.#fourCycle("edges", 1, 4, 3, 2);
    // this.#fourCycle("corners", 1, 4, 3, 2, true);
  }

  turnDi() {
    // this.#fourCycle("edges", 9, 10, 11, 12);
    // this.#fourCycle("corners", 5, 6, 7, 8, true);
  }

  turnRi() {
    // this.#fourCycle("edges", 2, 7, 10, 6);
    // this.#fourCycle("corners", 3, 7, 6, 2);
  }

  turnFi() {
    // this.#fourCycle("edges", 3, 8, 11, 7);
    // this.#fourCycle("corners", 4, 8, 7, 3);
  }

  turnLi() {
    // this.#fourCycle("edges", 4, 5, 12, 8);
    // this.#fourCycle("corners", 1, 5, 8, 4);
  }

  turnBi() {
    // this.#fourCycle("edges", 1, 6, 9, 5);
    // this.#fourCycle("corners", 2, 6, 5, 1);
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
