import { visit, parse, FragmentDefinitionNode } from "graphql";
import { extractTypenames, normalizeQuery } from "./graphql";

describe("on normalize query string", () => {
  describe("on missing __typename in selection set", () => {
    const query = parse(`
      query {
        id
        user {
          id
          name
          address {
            id
          }
        }
      }
    `);

    it("adds typename", () => {
      const result = normalizeQuery(query);

      visit(result, {
        SelectionSet: (node) => {
          const typename = node.selections.filter(
            (n) => n.kind === "Field" && n.name.value === "__typename"
          );
          expect(typename.length).toEqual(1);
        },
      });
    });
  });

  describe.skip("on badly sorted selection set", () => {
    const query = parse(`
      query {
        c
        b
        a
        d {
          a
          z
          f
        }
      }
    `);

    it("sorts fields", () => {
      const result = normalizeQuery(query);

      visit(result, {
        SelectionSet: (node) => {
          const sorted = [...node.selections].sort((a: any, b: any) =>
            a.name.value.localeCompare(b.name.value)
          );
          expect(node.selections.map((s: any) => s.name.value)).toEqual(
            sorted.map((s: any) => s.name.value)
          );
        },
      });
    });
  });

  describe.skip("on named query", () => {
    const query = parse(`
      query MyQuery {
        user {
          id
        }
      }
    `);

    it("removes query name", () => {
      const result = normalizeQuery(query);

      visit(result, {
        OperationDefinition: (node) => {
          expect(node.name).toBe(undefined);
        },
      });
    });
  });

  describe.skip("on fragment definitions", () => {
    const query = parse(`
      query MyQuery($id: ID) {
        user(id: $id) {
          ...UserFragment
        }
      }

      fragment UserFragment on User {
        id
        __typename
        name
      }
    `);

    it("removes fragment definitions", () => {
      const fragmentDefinitionHandler = jest.fn();
      const result = normalizeQuery(query);

      visit(result, {
        FragmentDefinition: fragmentDefinitionHandler,
      });
      const fragmentDefinitionCount =
        fragmentDefinitionHandler.mock.calls.length;

      expect(fragmentDefinitionCount).toEqual(0);
    });

    it("inlines fragment definition", () => {
      const selections = (query.definitions[1] as FragmentDefinitionNode)
        .selectionSet.selections;
      const result = normalizeQuery(query);

      visit(result, {
        Field: (node) => {
          if (node.name.value !== "user") {
            return;
          }

          expect(node.selectionSet).toBeDefined();

          const sorted = node
            .selectionSet!.selections.map((s) => (s as any).name.value)
            .sort();
          expect(sorted).toEqual(
            selections.map((s) => (s as any).name.value).sort()
          );
        },
      });
    });
  });
});

describe.skip("on extract typenames", () => {
  describe("on simple object", () => {
    const fixture = {
      data: {
        __typename: "Query",
      },
    };

    it("returns correct typenames", () => {
      const result = extractTypenames(fixture);
      expect(result).toEqual(["Query"]);
    });
  });

  describe("on nested object", () => {
    const fixture = {
      data: {
        user: {
          __typename: "User",
        },
        __typename: "Query",
      },
    };

    it("returns correct typenames", () => {
      const result = extractTypenames(fixture);
      expect(result.sort()).toEqual(["Query", "User"]);
    });
  });

  describe("on field w/ null", () => {
    const fixture = {
      data: {
        user: {
          id: "user_1234",
          test: null,
          __typename: "User",
        },
        __typename: "Query",
      },
    };

    it("returns correct typenames", () => {
      const result = extractTypenames(fixture);
      expect(result.sort()).toEqual(["Query", "User"]);
    });
  });

  describe("on field w/ nullable string array", () => {
    const fixture = {
      data: {
        users: [null, "1234", null, "5678"],
        __typename: "Query",
      },
    };

    it("returns correct typenames", () => {
      const result = extractTypenames(fixture);
      expect(result).toEqual(["Query"]);
    });
  });

  describe("on field w/ nullable object array", () => {
    const fixture = {
      data: {
        users: [
          null,
          {
            id: "user_1234",
            address: null,
            __typename: "User",
          },
          {
            id: "user_1234",
            address: {
              id: "1234",
              __typename: "Address",
            },
            __typename: "User",
          },
        ],
        __typename: "Query",
      },
    };

    it("returns correct typenames", () => {
      const result = extractTypenames(fixture);
      expect(result.sort()).toEqual(["Address", "Query", "User"]);
    });
  });
});
