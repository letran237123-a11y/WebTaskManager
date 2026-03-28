const { poolPromise } = require('../config/db')

const ensureTaskColumns = async () => {
  const pool = await poolPromise
  await pool.request().query(`
    IF COL_LENGTH('tasks', 'deadline') IS NULL
    BEGIN
      ALTER TABLE tasks ADD deadline DATETIME2 NULL;
    END

    IF COL_LENGTH('tasks', 'completed_at') IS NULL
    BEGIN
      ALTER TABLE tasks ADD completed_at DATETIME2 NULL;
    END

    IF COL_LENGTH('tasks', 'deadline_note') IS NULL
    BEGIN
      ALTER TABLE tasks ADD deadline_note NVARCHAR(MAX) NULL;
    END

    IF COL_LENGTH('tasks', 'deadline_image') IS NULL
    BEGIN
      ALTER TABLE tasks ADD deadline_image NVARCHAR(MAX) NULL;
    END
  `)
}

module.exports = {
  ensureTaskColumns,
}
