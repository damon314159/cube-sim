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
  static ORIENTATIONS = {
    SOLVED: "solved",
    CLOCKWISE: "clockwise", // rotate one turn CW from solved
    ANTI_CLOCKWISE: "anti-clockwise", // opposite of above
  };

  // List colours clockwise around the vertex
  constructor(
    colour1,
    colour2,
    colour3,
    orientation = Corner.ORIENTATIONS.SOLVED,
  ) {
    super([colour1, colour2, colour3]);
    this.orientation = orientation;
  }
}
