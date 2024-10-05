    // debounce helper for scroll events etc
export function debounce(func, timeout) {
  var timer;
  if (!timeout) {
    timeout = 16;
  }
  return function() {
    var ctx = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      func.apply(ctx, args);
    }, timeout);
  };
}

