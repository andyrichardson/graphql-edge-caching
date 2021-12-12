import { Kind, ASTNode, DocumentNode } from "graphql";

/** Compose multiple handlers for a single node visit. */
const compose = <T>(...fns: Array<(arg: T) => T>) => (arg: T) =>
  fns.reduce((res, fn) => fn(res), arg);

export const normalizeQuery = (query: DocumentNode): DocumentNode => query;

export const extractTypenames = (res: any): string[] => [];