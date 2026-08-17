/* eslint-disable no-param-reassign */
// Take the elements in the array at the given indices, and cycle them to the next provided index.
// Mutates input array in place
export function cycleArrayElementsAtIndices(arr, indices) {
  const tempElement = arr[indices.at(-1)];
  for (let i = indices.length - 1; i >= 1; i -= 1) {
    arr[indices[i]] = arr[indices[i - 1]];
  }
  arr[indices[0]] = tempElement;
}
