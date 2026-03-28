const express = require('express')
const cors = require('cors')
const taskRoutes = require('./routes/taskRoutes')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const { errorHandler } = require('./middleware/errorHandler')
const { ensureTaskColumns } = require('./sql/ensureTaskColumns')

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/', (req, res) => {
  res.send('Task Manager API is running.')
})

app.use('/auth', authRoutes)
app.use('/api/auth', authRoutes)
app.use(taskRoutes)
app.use('/api', taskRoutes)
app.use('/api/admin', adminRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

ensureTaskColumns()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT)
    })
  })
  .catch((error) => {
    console.error('Failed to prepare database schema', error)
    process.exit(1)
  })

module.exports = app
