// @flow

export function debounce(callback: Function, delay: number): Function {
  let timeout: number;
  return function() {
    let context: Object = this;
    let args: arguments = arguments;
    let debounced: Function = () => {
      callback.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(debounced, delay);
  };
}
