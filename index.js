const express = require('express')
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 4000
const app = express()
const mariadb = require('mariadb')
const { genPassword, verifyJwt } = require('./utils')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')

const jwt = require('jsonwebtoken')
const { response } = require('express')

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
app.use(cookieParser())

pool.getConnection().then((db) => {
  app.post('/protected', verifyJwt, (req, res) => {
    res.status(200).json({ succes: true, msg: 'You are authenticated' })
  })

  app.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
      const users = await db.query(
        `
            SELECT
              *
            FROM 
                users
            WHERE
                users.email = ?
        `,
        [email]
      )

      if (!users.length) {
        return res.json({ message: 'No user found' })
      }

      const user = users[0]
      const dbPassword = `$2b$${user.password.slice(4)}`

      if (bcrypt.compareSync(password, dbPassword)) {
        const token = jwt.sign(
          { id: user.id },
          process.env.ACCES_TOKEN_SECRET,
          { expiresIn: '4h' }
        )
        res.cookie('arenan_token', token)
        return res.json({
          succes: true,
          user: user,
          token: 'Bearer ' + token,
        })
      } else return res.json({ message: 'password/username invalid' })
    } catch (error) {
      console.log(error)
      return res.json({ err: error })
    }
  })

  app.post('/register', async function (req, res, next) {
    const hashedPassword = await genPassword(req.body.password)

    const { username, email } = req.body
    if (!username || !email) {
      return res
        .status(400)
        .send({ success: false, error: 'Missing input parameters.' })
    }
    try {
      const queryResult = await db.query(
        'INSERT INTO users(username,email,password) VALUES(?, ?, ? )',
        [username, email, hashedPassword]
      )
      const id = Number(queryResult.insertId)
      const user = {
        id: id,
        email: email,
        username: username,
      }

      res.json(user)
    } catch (error) {
      console.log('errfart', { error })
      let userError = 'Ett okänt fel inträffade.'
      if (error.code === 'ER_DUP_ENTRY') {
        userError = 'E-postadressen eller användarnamn används redan'
      }
      return res.json({ isAuthenticated: false, error: userError })
    }
  })

  app.get('/api', async (req, res) => {
    const users = await db.query('SELECT * FROM users')
    res.json(users)
  })

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
  })
})
