const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 4000
const app = express()
const mariadb = require('mariadb')

const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  connectionLimit: 5,
  database: 'arenan',
})

pool.getConnection().then((db) => {
  app.use(cors())

  app.get('/api', async (req, res) => {
    const users = await db.query('SELECT * FROM users')
    res.json(users)
  })

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
  })
})
