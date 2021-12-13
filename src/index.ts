import { parse } from "graphql";

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

  console.log(document)
  // return null as any;
  return fetch(new Request(DESTINATION, request));
};

export default {
  fetch: fetchFn,
};
