export const pt = {
  hello: 'Olá, Colist',
} as const;

/** Same key tree as `pt`, any string values. A missing key fails `lint:types`. */
export type Translation<T = typeof pt> = {
  [Key in keyof T]: T[Key] extends string ? string : Translation<T[Key]>;
};
