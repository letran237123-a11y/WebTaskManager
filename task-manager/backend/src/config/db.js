const sql = require('mssql')

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123',
  server: process.env.DB_HOST || 'LAPTOP-QLMRUS3C\\SQLEXPRESS2022',
  database: process.env.DB_NAME || 'taskdb',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => pool)
  .catch((err) => {
    console.error('SQL Server connection failed', err)
    throw err
  })

module.exports = {
  sql,
  poolPromise,
}
