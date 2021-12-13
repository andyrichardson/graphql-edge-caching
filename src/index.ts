import { parse, print, Kind, DocumentNode } from "graphql";

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

  return isQuery ? handleQuery(document)(request, env, ctx) : handleMutation(document)(request, env, ctx);
};

const handleMutation = (query: DocumentNode): ExportedHandlerFetchHandler<WorkerEnv> => (request, env, ctx) => {
  return fetch(new Request(DESTINATION, request));
};

const handleQuery = (query: DocumentNode): ExportedHandlerFetchHandler<WorkerEnv> => async (request, env, ctx) => {
  const newResponse = await fetch(new Request(DESTINATION, request));

  const newJson: any = await newResponse.clone().json();
  if (newResponse.ok && !("error" in newJson)) {
    console.log("CACHING QUERY");
    await env.RESPONSES.put(print(query), JSON.stringify(newJson));
  }

  return newResponse;
}

export default {
  fetch: fetchFn,
};
