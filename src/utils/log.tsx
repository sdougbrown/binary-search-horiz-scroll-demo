const isDev = import.meta.env.DEV;

export const log = isDev ? console.log : () => {};
