

module.exports = {
    default: {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        server: process.env.SQL_SERVER,
        database: process.env.SQL_DATABASE,
        pool: {
            max: Number(process.env.SQL_MAX_POOL),
            min: Number(process.env.SQL_MIN_POOL),
            idleTimeoutMillis: Number(process.env.SQL_POOL_IDLE_TIMOUT_MS)
        },
        parseJSON: true
    }
}