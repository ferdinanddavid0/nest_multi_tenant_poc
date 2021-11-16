export type WithProperties<P> = {
  [property in keyof P]: P[property];
};
