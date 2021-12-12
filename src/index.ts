type WorkerEnv = { RESPONSES: KVNamespace; TYPENAMES: KVNamespace };

const DESTINATION = "https://some-endpoint.com/graphql";

const fetchFn: ExportedHandlerFetchHandler<WorkerEnv> = async (
  request,
  env,
  ctx
) => {
  return new Response();
};

export default {
  fetch: fetchFn,
};
