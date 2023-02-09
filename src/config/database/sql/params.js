const sql = require('mssql')

module.exports = {
    cities: {
        id: (value = 0) => ({ name: '@param_city_id', type: sql.Int, value }),
        code: (value = '') => ({ name: '@param_city_code', type: sql.NVarChar(5), value }),
        name: (value = '') => ({ name: '@param_city_name', type: sql.NVarChar(50), value }),
    }
}