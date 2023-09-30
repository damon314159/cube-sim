class Cube {
  constructor() {
    this.corners = {
      // Cubie: [position, orientation]
      // Cubies are numbered 0-7, positions 0-7, and orientations 0-2
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
      // Cubie: [position, orientation]
      // Cubies are numbered 0-11, positions 0-11, and orientations 0-1
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

  #at(object, position) {
    return Object.keys(this[object]).find((key) => this[object][key][0] === position)
  }

  #fourCycle(object, pieceA, pieceB, pieceC, pieceD) {
    // Change positions cyclically
    ;[this[object][pieceA][0], this[object][pieceB][0], this[object][pieceC][0], this[object][pieceD][0]] = [
      this[object][pieceB][0],
      this[object][pieceC][0],
      this[object][pieceD][0],
      this[object][pieceA][0]
    ]

    // Change parity for edges
    // Corner parity handled in the turn methods as it varies and only applies to 4/6 faces
    if (object === 'edges') {
      ;[pieceA, pieceB, pieceC, pieceD].forEach((piece) => {
        const pieceState = this[object][piece]
        pieceState[1] = (pieceState[1] + 1) % 2 // Flip parity
      })
    }
  }

  // Clockwise Turns
  turnU() {
    this.#fourCycle('edges', this.#at('edges', 1), this.#at('edges', 2), this.#at('edges', 3), this.#at('edges', 4))
    this.#fourCycle(
      'corners',
      this.#at('corners', 1),
      this.#at('corners', 2),
      this.#at('corners', 3),
      this.#at('corners', 4)
    )
  }

  turnD() {
    this.#fourCycle('edges', this.#at('edges', 9), this.#at('edges', 12), this.#at('edges', 11), this.#at('edges', 10))
    this.#fourCycle(
      'corners',
      this.#at('corners', 5),
      this.#at('corners', 8),
      this.#at('corners', 7),
      this.#at('corners', 6)
    )
  }

  turnR() {
    this.#fourCycle('edges', this.#at('edges', 2), this.#at('edges', 6), this.#at('edges', 10), this.#at('edges', 7))
    this.#fourCycle(
      'corners',
      this.#at('corners', 2),
      this.#at('corners', 6),
      this.#at('corners', 7),
      this.#at('corners', 3)
    )
    ;[this.#at('corners', 3), this.#at('corners', 6)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 2), this.#at('corners', 7)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  turnF() {
    this.#fourCycle('edges', this.#at('edges', 3), this.#at('edges', 7), this.#at('edges', 11), this.#at('edges', 8))
    this.#fourCycle(
      'corners',
      this.#at('corners', 3),
      this.#at('corners', 7),
      this.#at('corners', 8),
      this.#at('corners', 4)
    )
    ;[this.#at('corners', 4), this.#at('corners', 7)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 3), this.#at('corners', 8)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  turnL() {
    this.#fourCycle('edges', this.#at('edges', 4), this.#at('edges', 8), this.#at('edges', 12), this.#at('edges', 5))
    this.#fourCycle(
      'corners',
      this.#at('corners', 1),
      this.#at('corners', 4),
      this.#at('corners', 8),
      this.#at('corners', 5)
    )
    ;[this.#at('corners', 1), this.#at('corners', 8)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 4), this.#at('corners', 5)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  turnB() {
    this.#fourCycle('edges', this.#at('edges', 1), this.#at('edges', 5), this.#at('edges', 9), this.#at('edges', 6))
    this.#fourCycle(
      'corners',
      this.#at('corners', 1),
      this.#at('corners', 5),
      this.#at('corners', 6),
      this.#at('corners', 2)
    )
    ;[this.#at('corners', 2), this.#at('corners', 5)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 1), this.#at('corners', 6)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  // Anticlockwise (inverted) turns
  turnUi() {
    this.#fourCycle('edges', this.#at('edges', 1), this.#at('edges', 4), this.#at('edges', 3), this.#at('edges', 2))
    this.#fourCycle(
      'corners',
      this.#at('corners', 1),
      this.#at('corners', 4),
      this.#at('corners', 3),
      this.#at('corners', 2)
    )
  }

  turnDi() {
    this.#fourCycle('edges', this.#at('edges', 9), this.#at('edges', 10), this.#at('edges', 11), this.#at('edges', 12))
    this.#fourCycle(
      'corners',
      this.#at('corners', 5),
      this.#at('corners', 6),
      this.#at('corners', 7),
      this.#at('corners', 8)
    )
  }

  turnRi() {
    this.#fourCycle('edges', this.#at('edges', 2), this.#at('edges', 7), this.#at('edges', 10), this.#at('edges', 6))
    this.#fourCycle(
      'corners',
      this.#at('corners', 2),
      this.#at('corners', 3),
      this.#at('corners', 7),
      this.#at('corners', 6)
    )
    ;[this.#at('corners', 3), this.#at('corners', 6)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 2), this.#at('corners', 7)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  turnFi() {
    this.#fourCycle('edges', this.#at('edges', 3), this.#at('edges', 8), this.#at('edges', 11), this.#at('edges', 7))
    this.#fourCycle(
      'corners',
      this.#at('corners', 3),
      this.#at('corners', 4),
      this.#at('corners', 8),
      this.#at('corners', 7)
    )
    ;[this.#at('corners', 4), this.#at('corners', 7)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 3), this.#at('corners', 8)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  turnLi() {
    this.#fourCycle('edges', this.#at('edges', 4), this.#at('edges', 5), this.#at('edges', 12), this.#at('edges', 8))
    this.#fourCycle(
      'corners',
      this.#at('corners', 1),
      this.#at('corners', 5),
      this.#at('corners', 8),
      this.#at('corners', 4)
    )
    ;[this.#at('corners', 1), this.#at('corners', 8)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 4), this.#at('corners', 5)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  turnBi() {
    this.#fourCycle('edges', this.#at('edges', 1), this.#at('edges', 6), this.#at('edges', 9), this.#at('edges', 5))
    this.#fourCycle(
      'corners',
      this.#at('corners', 1),
      this.#at('corners', 2),
      this.#at('corners', 6),
      this.#at('corners', 5)
    )
    ;[this.#at('corners', 2), this.#at('corners', 5)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
    })
    ;[this.#at('corners', 1), this.#at('corners', 6)].forEach((piece) => {
      this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
    })
  }

  // General puzzle methods
  isSolved() {}

  scramble() {}
}

export default Cube
