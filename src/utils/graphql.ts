import { Kind, ASTNode, DocumentNode, visit } from "graphql";

/** Compose multiple handlers for a single node visit. */
const compose = <T>(...fns: Array<(arg: T) => T>) => (arg: T) =>
  fns.reduce((res, fn) => fn(res), arg);

export const addTypenameToSelectionSets = (query: DocumentNode): DocumentNode =>
  visit(query, {
    SelectionSet: (node) => {
      if (node.selections.some(n => n.kind === Kind.FIELD && n.name.value === "__typename")) {
        return node;
      }

      return {
        ...node,
        selections: [
          ...node.selections,
          {
            kind: Kind.FIELD,
            name: {
              kind: Kind.NAME,
              value: "__typename"
            }
          }
        ]
      }
    },
  });

export const normalizeQuery = (query: DocumentNode): DocumentNode => addTypenameToSelectionSets(query);


/** Return all typenames in a GraphQL response */
export const extractTypenames = (res: any) => [
  ...new Set(_extractTypenames(res)),
];

export const _extractTypenames = (res: any): string[] => {
  if (res === null || typeof res !== "object") {
    return [];
  }

  if (Array.isArray(res)) {
    return res.map(_extractTypenames).flat();
  }

  return Object.entries(res).reduce<string[]>((acc, [key, value]) => {
    if (key === "__typename") {
      return [...acc, value as string];
    }

    return [...acc, ..._extractTypenames(value)];
  }, []);
};
