import { parse, print, Kind, DocumentNode } from "graphql";
import { addTypenameToSelectionSets } from './utils'
type WorkerEnv = { RESPONSES: KVNamespace; TYPENAMES: KVNamespace };

const DESTINATION = "https://fakeql.com/graphql/dc08e1b5d4eff78fd7f7e9deb656444f";

const fetchFn: ExportedHandlerFetchHandler<WorkerEnv> = async (
  request,
  env,
  ctx
) => {
  const body = await request
  .clone()
  .text()
  .then(JSON.parse);

  const document = parse(body.query);

  const isQuery = document.definitions.some(node => node.kind === Kind.OPERATION_DEFINITION && node.operation === "query"); 

  return isQuery ? handleQuery(document, body)(request, env, ctx) : handleMutation(document, body)(request, env, ctx);
};

const handleMutation = (query: DocumentNode, body: any): ExportedHandlerFetchHandler<WorkerEnv> => (request, env, ctx) => {
  return fetch(new Request(DESTINATION, {
    ...request,
    body: JSON.stringify({
      ...body,
      query: print(addTypenameToSelectionSets(query)),
    }),
  }));
};

const handleQuery = (query: DocumentNode, body: any): ExportedHandlerFetchHandler<WorkerEnv> => async (request, env, ctx) => {
  const queryString = print(query);
  const cachedResponse = await env.RESPONSES.get(queryString);

  if (cachedResponse) {
    console.log("CACHHEEE")
    return new Response(cachedResponse, {
      headers: {
        "Content-Type": "application/json",
        "x-cache-hit": "true",
      },
    });
  }

  const newResponse = await fetch(new Request(DESTINATION, request));

  const newJson = await newResponse.clone().json<any>();
  if (newResponse.ok && !("error" in newJson)) {
    console.log("CACHING QUERY");
    await env.RESPONSES.put(queryString, JSON.stringify(newJson));
  }

  return newResponse;
}

export default {
  fetch: fetchFn,
};
