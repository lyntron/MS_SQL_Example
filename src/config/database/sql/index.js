const { sql, get, closeAll } = require('./pool-manager')
const params = require('./params')

module.exports = {
    sql,
    get,
    closeAll,
    params,
    query: (sqlScript = '', sqlParams = []) => {
        return new Promise(async (resolve, reject) => {
            const pool = await get()
            const req = pool.request();
            sqlParams.forEach((param) => {
                req.input(param.name.replace('@', ''), param.type, param.value);
            });
            req.query(sqlScript, (err, recordset) => {
                if (err) {
                    return reject(err)
                }
                resolve(recordset)
            });
        })
    },
    execute: (proc = '', sqlParams = []) => {
        return new Promise(async (resolve, reject) => {
            const pool = await get()
            const req = pool.request();
            sqlParams.forEach((param) => {
                req.input(param.name, param.type, param.value);
            });
            req.execute(proc, (err, recordset) => {
                if (err) {
                    return reject(err)
                }
                resolve(recordset)
            });
        })
    }
};