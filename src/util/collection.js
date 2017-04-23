// @flow

export function distinctBy<T>(arr: Array<T>, f: (x: T) => string | number): Array<T> {
  let seen: {[key: string | number]: boolean} = {};
  let ret = [];
  for (let i = 0; i < arr.length; i++) {
    let k = f(arr[i]);
    if (seen[k]) {
      continue;
    }
    ret.push(arr[i]);
    seen[k] = true;
  }
  return ret;
}

export function distinct(arr: Array<string | number>): Array<string | number> {
  let seen: {[key: string | number]: boolean} = {};
  let ret = [];
  for (let i = 0; i < arr.length; i++) {
    let v = arr[i];
    if (seen[v]) {
      continue;
    }
    ret.push(arr[i]);
    seen[v] = true;
  }
  return ret;
}

export function range(start: number, end?: number) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  let arr = [];
  for (let i = start; i < end; i++) {
    arr.push(i);
  }
  return arr;
}
