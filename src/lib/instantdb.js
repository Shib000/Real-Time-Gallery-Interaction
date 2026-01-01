import { init } from "@instantdb/react";
import { tx, id } from "@instantdb/react";

const APP_ID =
  import.meta.env.VITE_INSTANTDB_APP_ID ||
  "e1a4b514-bafc-44e1-8ebd-02e9464d0964";

let db = null;
let instantUseQuery = null;
let instantTransact = null;
let isInitialized = false;

if (APP_ID && APP_ID !== "your-app-id-here" && APP_ID.trim() !== "") {
  try {
    const instant = init({
      appId: APP_ID,
    });

    if (instant && typeof instant === "object") {
      if (instant.useQuery && instant.transact && instant._core) {
        db = instant;
        instantUseQuery = instant.useQuery;
        instantTransact = instant.transact;
        isInitialized = true;
      }
    }
  } catch (error) {}
}

const useQuery = (query) => {
  const actualQuery = query || {
    reactions: { $: { where: { id: "__null_query_placeholder__" } } },
  };

  const tableName = query ? Object.keys(query)[0] : "reactions";

  if (isInitialized && instantUseQuery) {
    try {
      return instantUseQuery(actualQuery);
    } catch (e) {
      return { data: { [tableName]: [] } };
    }
  }

  return { data: { [tableName]: [] } };
};

const transact = (chunks) => {
  if (isInitialized && instantTransact) {
    return instantTransact(chunks);
  }
  return Promise.resolve();
};

export { db, useQuery, transact, tx, id, isInitialized };
