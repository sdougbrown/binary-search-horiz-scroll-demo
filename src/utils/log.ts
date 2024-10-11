// change this later. jest is fighting me right now
const isDev = true; // import.meta.env.DEV;

function noop() {
  return;
}

export const log = isDev ? console.log : noop;
