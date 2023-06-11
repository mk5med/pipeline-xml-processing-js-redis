# XML Processing in JS with REDIS

This project shows an example pipeline for processing, transformation, and storage of XML datasets.

Stack:

1. Docker
2. REDIS Database for data storage
3. NodeJS + Pure JS
4. [xml2js](https://www.npmjs.com/package/xml2js)

## Software design

### Configuring XML key extraction and transformation

`src/index.js#EXPORT_CONFIG` defines a transformation configuration for keys in an XML dataset. The type is: `{[xmlKeyName: string]: (data: any) => any}`.

```
const EXPORT_CONFIG = {
  'subdomains': (data) => {
    return [['subdomains', data.flatMap(s => s.subdomain)]]
  },
  'cookies': (data) => {
    return data.flatMap(s => s.cookie).map(cookie => {
      const {name, host} = cookie['$']
      const val = cookie["_"]
      const key = `cookie:${name}:${host}`
      return [key, val]
    })
  }
}
```

### Database access during test, dev, and prod

`src/database.js` defines `DB_Prod` and `DB_Debug` classes that share the same interface `IDatabase`.
`DB_Prod` accesses a local REDIS database. `DB_Debug` access an in-memory database.

Switching between dev & prod DB environments is handled automatically by setting the `NODE_ENV` environment variable. This allows the project to be quickly deployed in test, dev, or prod environments.

### Unit testable functions

Functions in this project can be easily unit tested because most complex dependencies are given as arguments.
Example: To test the `src/index.js#exportToRedis` function a developer can pass an object matches the IDatabase interface instead of mocking the DB module using `jest.mock`.
