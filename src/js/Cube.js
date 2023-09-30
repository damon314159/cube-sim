class Cube {
  constructor() {
    this.corners = {
      // Position: [cubie, orientation]
      // Positions are numbered 1-8, cubies 1-8, and orientations 0-2

      1: [1, 0],
      2: [2, 0],
      3: [3, 0],
      4: [4, 0],
      5: [5, 0],
      6: [6, 0],
      7: [7, 0],
      8: [8, 0]
    }
    this.edges = {
      // Position: [cubie, orientation]
      // Position are numbered 1-12, cubies 1-12, and orientations 0-1
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
      11: [11, 0],
      12: [12, 0]
    }

    this.cornerCubies = {
      1: ['white', 'green', 'orange'],
      2: ['white', 'orange', 'blue'],
      3: ['white', 'blue', 'red'],
      4: ['white', 'red', 'green'],
      5: ['yellow', 'orange', 'green'],
      6: ['yellow', 'blue', 'orange'],
      7: ['yellow', 'red', 'blue'],
      8: ['yellow', 'green', 'red']
    }
    this.edgeCubies = {
      1: ['white', 'orange'],
      2: ['blue', 'white'],
      3: ['white', 'red'],
      4: ['green', 'white'],
      5: ['orange', 'green'],
      6: ['orange', 'blue'],
      7: ['red', 'blue'],
      8: ['red', 'green'],
      9: ['yellow', 'orange'],
      10: ['blue', 'yellow'],
      11: ['yellow', 'red'],
      12: ['green', 'yellow']
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
        this.corners[piece][1] = (this.corners[piece][1] + 2) % 3
      })
      ;[positionB, positionD].forEach((piece) => {
        this.corners[piece][1] = (this.corners[piece][1] + 1) % 3
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
  isSolved() {
    let solved = true
    // Check edges
    Object.keys(this.edges).every((position) => {
      const [cubie, orientation] = this.edges[position]
      if (cubie !== parseInt(position, 10) || orientation !== 0) {
        solved = false
        return false
      }
      return true
    })

    // Check corners only if the edges were okay
    if (solved) {
      Object.keys(this.corners).every((position) => {
        const [cubie, orientation] = this.corners[position]
        if (cubie !== parseInt(position, 10) || orientation !== 0) {
          solved = false
          return false
        }
        return true
      })
    }

    return solved
  }

  scramble() {
    this.scrambleEdges()
    this.scrambleCorners()
  }

  scrambleEdges() {
    const positions = Object.keys(this.edges)
    this.shuffleArray(positions)
    for (let i = 0; i < positions.length - 1; i += 1) {
      this.edges[positions[i]][1] = Math.floor(Math.random() * 2) // Random orientation
    }
    // Calculate the sum of the first 11 orientations modulo 2
    const sumMod2 = positions.slice(0, -1).reduce((sum, position) => sum + this.edges[position][1], 0) % 2
    // Assign the calculated orientation to the last edge
    this.edges[positions[positions.length - 1]][1] = sumMod2
  }

  scrambleCorners() {
    const positions = Object.keys(this.corners)
    this.shuffleArray(positions)
    for (let i = 0; i < positions.length - 1; i += 1) {
      this.corners[positions[i]][1] = Math.floor(Math.random() * 3) // Random orientation
    }
    // Calculate the sum of the first 7 orientations modulo 23
    const sumMod3 = positions.slice(0, -1).reduce((sum, position) => sum + this.edges[position][1], 0) % 3
    // Assign the calculated orientation to the last edge
    this.corners[positions[positions.length - 1]][1] = (3 - sumMod3) % 3
  }

  // Fisher-Yates shuffle
  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      // eslint-disable-next-line no-param-reassign
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }
}

export default Cube
