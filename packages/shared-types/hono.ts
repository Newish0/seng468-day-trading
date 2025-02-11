import { type Context, type Env, type Input } from "hono";

export type WrappedInput<T> = {
  in: {
    json: T;
  };
  out: {
    json: T;
  };
};

export type ContextWithUser<T extends Input = WrappedInput<unknown>> = Context<
  Env & {
    Variables: {
      user: {
        username: string;
        name: string;
        exp: string;
      };
    };
  },
  string,
  T
>;
