const mssql = require('mssql')
const pools = new Map();
const { default: defaultConfig } = require('./config')

mssql.on('error', err => {
    // ... error handler
    // TODO Handle sql errors
})

module.exports = {
    sql: mssql,
    // Get or create a pool. If a pool doesn't exist the config must be provided.
    // If the pool does exist the config is ignored (even if it was different to the one provided when creating the pool)
    get: (name = 'default', config = defaultConfig) => {
        return new Promise((resolve, reject) => {
            if (!pools.has(name)) {
                if (!config) {
                    return reject('Pool does not exist');
                }
                const pool = new mssql.ConnectionPool(config);
                // automatically remove the pool from the cache if `pool.close()` is called
                const close = pool.close.bind(pool);
                pool.close = (...args) => {
                    pools.delete(name);
                    return resolve(close(...args));
                }
                pools.set(name, pool.connect());
            }
            return resolve(pools.get(name));
        })
    },
    // Closes all the pools and removes them from the store
    closeAll: () => Promise.all(Array.from(pools.values()).map((connect) => {
        return connect.then((pool) => pool.close());
    })),
};