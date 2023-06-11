const Redis = require("ioredis");

class IDatabase {
  get(val) {}
  set(val, key) {}
  close() {}
}

class DB_Prod extends IDatabase {
  constructor() {
    super();
    this.client = new Redis({
      hostname: "database",
      port: 6379,
      password: process.env.PASSWORD,
    });
  }
  get(val) {
    // If the input is an asterix, return all keys
    if (val == "*") return this.client.keys("*");
    return this.client.get(val);
  }
  set(val, key) {
    return this.client.set(val, JSON.stringify(key));
  }
  close() {
    this.client.disconnect();
  }
}

class DB_Debug extends IDatabase {
  constructor() {
    super();
    this.db = {};
  }
  get(val) {
    if (val == "*") return Object.keys(this.db);
    return this.db[val];
  }
  set(val, key) {
    return (this.db[val] = key);
  }
}

const DB = process.env.NODE_ENV == "production" ? DB_Debug : DB_Prod;

module.exports = { DB };
