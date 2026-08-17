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
  constructor(colour1, colour2) {
    super([colour1, colour2]);
  }
}

export class Corner extends Cubie {
  constructor(colour1, colour2, colour3) {
    super([colour1, colour2, colour3]);
  }
}
