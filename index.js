const express = require('express')
const cors = require('cors')
const PORT = process.env.PORT || 4000
const app = express()
const mariadb = require('mariadb')
const { genPassword } = require('./utils')

const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  connectionLimit: 5,
  database: 'arenan',
})
app.use(cors())
app.use(express.urlencoded({ limit: '100mb', extended: true }))
app.use(express.json({ limit: '100mb' }))

pool.getConnection().then((db) => {
  app.post('/register', async function (req, res, next) {
    const hashedPassword = await genPassword(req.body.password)

    const { username, email } = req.body
    if (!username || !email) {
      return res
        .status(400)
        .send({ success: false, error: 'Missing input parameters.' })
    }

    const { insertId: userId } = await db.query(
      'INSERT INTO users(username,email,password) VALUES(?, ?, ? )',
      [username, email, hashedPassword]
    )

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId])
    res.json(users)
  })

  app.get('/api', async (req, res) => {
    const users = await db.query('SELECT * FROM users')
    res.json(users)
  })

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
  })
})
