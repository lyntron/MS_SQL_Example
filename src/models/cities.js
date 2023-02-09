const { query, params } = require('../config/database/sql');

module.exports.loadCities = (options = {}) => {
  // Options values = {
  //   cityId: 'filter by cityId',
  //   cityCode: 'filter by cityCode',
  // } 

  return new Promise(async (resolve, reject) => {
    try {

      let inputParams = [
        params.cities.id(options.cityId),
        params.cities.code(options.cityCode),
      ]

      let where = `WHERE 1=1 `
      where += options.cityId ? ` AND id = ${inputParams[0].name}` : ''
      where += options.cityCode ? ` AND LOWER(city_code) = ${inputParams[1].name.toLowerCase()}` : ''

      let sqlScript = `
      SELECT *
      FROM [cities]
      ${where}
      ORDER BY id ASC
      `

      let recordset = await query(sqlScript, inputParams)
      return resolve(recordset.recordset)
    } catch (error) {
      reject(error)
    }
  })
}
