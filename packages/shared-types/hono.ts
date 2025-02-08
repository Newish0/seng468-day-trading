export type WrappedInput<T> = {
  in: {
    json: T;
  };
  out: {
    json: T;
  };
};
