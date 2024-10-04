// change this later. jest is fighting me right now
const isDev = true; // import.meta.env.DEV;

export const log = isDev ? console.log : () => {};
