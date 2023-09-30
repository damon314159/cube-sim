class Cube {
  constructor() {
    this.corners = {
      // Position: [cubie, orientation]
      // Positions are numbered 0-7, cubies 0-7, and orientations 0-2
      0: [0, 0],
      1: [1, 0],
      2: [2, 0],
      3: [3, 0],
      4: [4, 0],
      5: [5, 0],
      6: [6, 0],
      7: [7, 0]
    }
    this.edges = {
      // Position: [cubie, orientation]
      // Position are numbered 0-11, cubies 0-11, and orientations 0-1
      0: [0, 0],
      1: [1, 0],
      2: [2, 0],
      3: [3, 0],
      4: [4, 0],
      5: [5, 0],
      6: [6, 0],
      7: [7, 0],
      8: [8, 0],
      9: [9, 0],
      10: [10, 0],
      11: [11, 0]
    }
  }

  #fourCycle(type, positionA, positionB, positionC, positionD, polar = false) {
    // Change positions cyclically
    ;[this[type][positionA], this[type][positionB], this[type][positionC], this[type][positionD]] = [
      this[type][positionD].slice(),
      this[type][positionA].slice(),
      this[type][positionB].slice(),
      this[type][positionC].slice()
    ]

    // Change parity for edges
    if (type === 'edges') {
      ;[positionA, positionB, positionC, positionD].forEach((position) => {
        const pieceState = this.edges[position]
        pieceState[1] = (pieceState[1] + 1) % 2 // Flip parity
      })
    }

    // Change parity for corners
    if (type === 'corners' && !polar) {
      ;[positionA, positionC].forEach((piece) => {
        this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
      })
      ;[positionB, positionD].forEach((piece) => {
        this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
      })
    }
  }

  // Clockwise Turns
  turnU() {
    this.#fourCycle('edges', 1, 2, 3, 4)
    this.#fourCycle('corners', 1, 2, 3, 4, true)
  }

  turnD() {
    this.#fourCycle('edges', 9, 12, 11, 10)
    this.#fourCycle('corners', 5, 8, 7, 6, true)
  }

  turnR() {
    this.#fourCycle('edges', 2, 6, 10, 7)
    this.#fourCycle('corners', 3, 2, 6, 7)
  }

  turnF() {
    this.#fourCycle('edges', 3, 7, 11, 8)
    this.#fourCycle('corners', 4, 3, 7, 8)
  }

  turnL() {
    this.#fourCycle('edges', 4, 8, 12, 5)
    this.#fourCycle('corners', 1, 4, 8, 5)
  }

  turnB() {
    this.#fourCycle('edges', 1, 5, 9, 6)
    this.#fourCycle('corners', 2, 1, 5, 6)
  }

  // Anticlockwise (inverted) turns
  turnUi() {
    this.#fourCycle('edges', 1, 4, 3, 2)
    this.#fourCycle('corners', 1, 4, 3, 2, true)
  }

  turnDi() {
    this.#fourCycle('edges', 9, 10, 11, 12)
    this.#fourCycle('corners', 5, 6, 7, 8, true)
  }

  turnRi() {
    this.#fourCycle('edges', 2, 7, 10, 6)
    this.#fourCycle('corners', 3, 7, 6, 2)
  }

  turnFi() {
    this.#fourCycle('edges', 3, 8, 11, 7)
    this.#fourCycle('corners', 4, 8, 7, 3)
  }

  turnLi() {
    this.#fourCycle('edges', 4, 5, 12, 8)
    this.#fourCycle('corners', 1, 5, 8, 4)
  }

  turnBi() {
    this.#fourCycle('edges', 1, 6, 9, 5)
    this.#fourCycle('corners', 2, 6, 5, 1)
  }

  // General puzzle methods
  isSolved() {}

  scramble() {}
}

export default Cube
