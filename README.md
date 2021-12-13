# GraphQL Edge Caching

Workshop on how to create a GraphQL edge cache.

## Usage

#### Install deps

```sh
npm ci
```

#### Run worker locally

```sh
npm start
```

#### Run tests

```sh
npm run test
```

## Async challenges!

### 1. Extract typenames

See if you can create your own extract typenames function and get the tests to pass

### 2. Mutation invalidation

Now that you know what typenames each query depends on, see if you can delete all queries from the cache when their typename is returned from a mutation.

### 3. Extra stretch

Try "normalizing" the query before caching it by:
 - Sorting query keys
 - Removing query names
 - Pulling out fragment definitions

There are tests for each of these that you can enable!

> Any questions, just ping me via the discord or create an issue on the repo :+1:
