const fs = require("fs");
const xml2js = require("xml2js");

const EXPORT_CONFIG = {
  subdomains: (data) => {
    return [["subdomains", data.flatMap((s) => s.subdomain)]];
  },
  cookies: (data) => {
    return data
      .flatMap((s) => s.cookie)
      .map((cookie) => {
        const { name, host } = cookie["$"];
        const val = cookie["_"];
        const key = `cookie:${name}:${host}`;
        return [key, val];
      });
  },
};

/**
 * Takes an object and extracts data from it according to an `exportConfig`.
 * @param {Record<string, any>} data
 * @returns Returns a list of key value pairs (lists) `[string, any][]`
 */
function extractData(data, exportConfig = EXPORT_CONFIG) {
  let keys = Object.keys(exportConfig);
  let out = [];

  // For all keys in exportConfig
  for (let key of keys) {
    // Get the transformer
    let method = exportConfig[key];

    // Extract the data under the same key
    let object = data["config"][key];

    // Skip the entry if nothing was found
    if (object == undefined) continue;

    out.push(method(object));
  }

  // Returns a list of key value pairs (lists)
  return out;
}

/**
 * Handle exporting to REDIS
 *
 * @param {*} data
 * @param {*} db A database reference
 * @param {*} exportConfig
 */
async function exportToRedis(data, db, exportConfig = EXPORT_CONFIG) {
  let keyValList = extractData(data, exportConfig).flat();

  for (let i = 0; i < keyValList.length; i++) {
    const [key, value] = keyValList[i];
    await db.set(key, value); // Save the data into the database
  }
}

// Main method
async function main(file, flag_verbose, db) {
  const parser = new xml2js.Parser();

  // Read a local file
  const file_data = await fs.promises.readFile(file, "utf8");

  // Process the XML
  let parsed = await parser.parseStringPromise(file_data);

  // Save the data to redis
  await exportToRedis(parsed, db);

  if (flag_verbose) {
    // Print everything in the database
    console.log(await db.get("*"));
  }
  db.close();
}

// Handle arguments if it is not a module
if (require.main == module) {
  const { DB } = require("./database");
  const db = new DB(); // Connect to REDIS

  let flag_verbose = false;
  let fileName = "";

  // Loop through CLI arguments
  for (let i = 2; i < process.argv.length; i++) {
    // Check that a "-v" flag exists
    if (process.argv[i] == "-v") flag_verbose = true;
    // Try to get a filename
    else if (fileName == "") fileName = process.argv[i];
  }

  // Check that a file was specified
  if (fileName == "") throw "The file name is empty";

  // Run the application
  main(fileName, flag_verbose, db);
}

module.exports = {
  main,
  extractData,
  exportToRedis,
  EXPORT_CONFIG,
};
