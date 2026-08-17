export class Cubie {
  constructor(stickers) {
    this.stickers = stickers;
  }
}

export class Centre extends Cubie {
  constructor({ colour }) {
    super([colour]);
  }
}

export class Edge extends Cubie {
  static ORIENTATIONS = {
    SOLVED: "solved",
    FLIPPED: "flipped",
  };

  constructor({
    colour1,
    colour2,
    startingPosition,
    orientation = Edge.ORIENTATIONS.SOLVED,
  }) {
    super([colour1, colour2]);
    this.startingPosition = startingPosition; // for calculating parity
    this.orientation = orientation;
  }

  flip() {
    this.orientation =
      this.orientation === Edge.ORIENTATIONS.SOLVED
        ? Edge.ORIENTATIONS.FLIPPED
        : Edge.ORIENTATIONS.SOLVED;
  }
}

export class Corner extends Cubie {
  static ORIENTATIONS = {
    SOLVED: "solved",
    // Note these CW and ACW values are deliberately duplicated from the enum in ../constants/directions, as they are conceptually isolated
    CLOCKWISE: "clockwise", // rotate one turn CW from solved
    ANTI_CLOCKWISE: "anti-clockwise", // opposite of above
  };

  // List colours clockwise around the vertex
  constructor({
    colour1,
    colour2,
    colour3,
    startingPosition,
    orientation = Corner.ORIENTATIONS.SOLVED,
  }) {
    super([colour1, colour2, colour3]);
    this.startingPosition = startingPosition; // for calculating parity
    this.orientation = orientation;
  }

  rotate(increments) {
    const orderedOrientations = [
      Corner.ORIENTATIONS.SOLVED,
      Corner.ORIENTATIONS.CLOCKWISE,
      Corner.ORIENTATIONS.ANTI_CLOCKWISE,
    ];
    const currentIndex = orderedOrientations.indexOf(this.orientation);
    const newIndex = (currentIndex + increments) % 3;
    const newOrientation = orderedOrientations[newIndex];
    this.orientation = newOrientation;
  }
}
