import type { Context, Hono } from "hono";
import type { auth } from "./lib/auth";

export type AppContext = Context<{ Bindings: Env }>;
export type HandleArgs = [AppContext];

export interface AppVariables {
  session: typeof auth.$Infer.Session.session | null;
  user: typeof auth.$Infer.Session.user | null;
}

export type AppInstance = Hono<{
  Bindings: Env;
  Variables: AppVariables;
}>;
