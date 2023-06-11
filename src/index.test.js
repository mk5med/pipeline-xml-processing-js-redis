const { extractData, exportToRedis, EXPORT_CONFIG } = require("./index");
const { DB_Prod, DB_Debug } = require("./database");

test("`extractData` correctly uses export configuration", () => {
  let data = {
    config: {
      subdomains: [
        { subdomain: ["test", "test2"] },
        { subdomain: ["test3", "test4"] },
      ],
    },
  };
  let result = extractData(data, EXPORT_CONFIG).flat();
  console.log(result);
  expect(result[0]).toStrictEqual([
    "subdomains",
    ["test", "test2", "test3", "test4"],
  ]);
});

test("`exportToRedis` correctly saves information to redis", async () => {
  const db = new DB_Prod(); // Connect to REDIS
  let data = {
    config: {
      subdomains: [
        { subdomain: ["test", "test2"] },
        { subdomain: ["test3", "test4"] },
      ],
    },
  };
  await exportToRedis(data, db);
  expect(await db.get("subdomains")).toStrictEqual(
    JSON.stringify(["test", "test2", "test3", "test4"])
  );
  db.close();
});
