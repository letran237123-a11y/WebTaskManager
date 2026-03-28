const { poolPromise } = require("./src/config/db");
(async () => {
  const pool = await poolPromise;
  const res = await pool.request().query("SELECT COLUMN_NAME,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users'");
  console.log(res.recordset);
})().catch(err => { console.error(err); process.exit(1); });
