export type ActionSuccess<T = void> = T extends void
  ? { success: true; error?: never }
  : { success: true; error?: never } & T;

export type ActionError = { success?: never; error: string };

export type ActionResult<T = void> = ActionSuccess<T> | ActionError;
