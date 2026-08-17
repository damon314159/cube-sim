export class Cubie {
  constructor(stickers) {
    this.stickers = stickers;
  }
}

export class Centre extends Cubie {
  constructor(colour) {
    super([colour]);
  }
}

export class Edge extends Cubie {
  static ORIENTATIONS = {
    SOLVED: "solved",
    FLIPPED: "flipped",
  };

  constructor(colour1, colour2, orientation = Edge.ORIENTATIONS.SOLVED) {
    super([colour1, colour2]);
    this.orientation = orientation;
  }
}

export class Corner extends Cubie {
  // List colours clockwise around the vertex
  constructor(colour1, colour2, colour3) {
    super([colour1, colour2, colour3]);
  }
}
