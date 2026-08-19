// Fisher-Yates shuffle
export function shuffleArray(arr) {
  const clone = arr.slice();
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

// for an array of integers, count how many inversions there are
export function inversions(arr) {
  let count = 0;
  // loop over all pairs
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = i + 1; j < arr.length; i += 1) {
      if (arr[i] > arr[j]) {
        // they are in the wrong relative order, +1 inversion
        count += 1;
      }
    }
  }
  return count;
}
