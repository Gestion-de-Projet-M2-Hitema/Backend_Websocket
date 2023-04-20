import * as dotenv from "dotenv";

dotenv.config();

const PocketBase = require("pocketbase/cjs");
const pb = new PocketBase(process.env.POCKETBASE_URL);

import { listenDatabaseMessages } from "../events/notifications";

(async () => {
  // Authenticate to PocketBase
  await pb.admins.authWithPassword(
    process.env.POCKETBASE_USERNAME,
    process.env.POCKETBASE_PASSWORD
  );

  // Listen to updates in database
  pb.collection("messages").subscribe("*", async function (e: any) {
    await listenDatabaseMessages(pb, e);
  });
})();

export = pb;
