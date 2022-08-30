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

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200,
}

const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  connectionLimit: 5,
  database: 'arenan',
})

app.use(express.urlencoded({ limit: '100mb', extended: true }))
app.use(express.json({ limit: '100mb' }))
app.use(cookieParser())
app.use(cors(corsOptions))

pool.getConnection().then((db) => {
  app.post('/protected', verifyJwt, async (req, res) => {
    const { id } = req.jwt
    try {
      const user = await db.query(
        `
            SELECT
                users.id,
                users.email,
                users.password
            FROM 
                users
            WHERE
                users.id = ?
        `,
        [id]
      )
      res.json({ succes: true, user })
    } catch (error) {
      console.log(error)
    }
  })
  app.get('/items', verifyJwt, async (req, res) => {
    try {
      const items = await db.query(
        `SELECT * FROM items
        `
      )
      res.json(items)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        message: 'Something went wrong when trying to fetch items',
      })
    }
  })

  app.post('/buy/item', verifyJwt, async (req, res) => {
    const { id: user_id } = req.jwt
    const { itemId } = req.body

    const [item] = await db.query('SELECT * FROM items WHERE id = ? ', [itemId])
    if (!item) {
      res.status(404).json({ succes: false, error: 'No item in database' })
    }

    const [row] = await db.query(
      'SELECT gold FROM gladiator WHERE user_id = ?',
      [user_id]
    )
    if (item.price > row.gold) {
      res.status(402).json({ succes: false, message: 'insufficient funds' })
    }

    const newGoldAmount = row.gold - item.price

    await db.query('UPDATE gladiator SET gold = ?', [newGoldAmount])

    const [gladiatorRow] = await db.query(
      'SELECT id FROM gladiator WHERE user_id = ?',
      [user_id]
    )

    await db.query(
      'INSERT into gladiator_items (gladiator_id,item_id) VALUES (?,?)',
      [gladiatorRow.id, itemId]
    )

    res.json({ succes: true, item: item })
  })

  app.post('/gladiator', verifyJwt, async (req, res) => {
    const { id } = req.jwt
    const { race, strength, agility, health } = req.body
    let calculatedHp = Math.ceil(health * 5)
    try {
      const { insertId } = await db.query(
        `INSERT INTO gladiator (user_id,race,strength,agility,health,hp) VALUES (?,?,?,?,?,?)`,
        [id, race, strength, agility, health, calculatedHp]
      )
      const newGladiator = await db.query(
        'SELECT * FROM gladiator WHERE gladiator.id = ?',
        [insertId]
      )
      res.json(newGladiator[0])
    } catch (err) {
      console.log(err)
      res.status(500).send({
        message: 'Something went wrong when trying to create new gladiator',
      })
    }
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

      const gladiators = await db.query(
        'SELECT * FROM gladiator WHERE user_id = ? ',
        [user.id]
      )
      const gladiator = gladiators[0]

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
          gladiator: gladiator,
          token: 'Bearer ' + token,
        })
      } else return res.json({ message: 'password/username invalid' })
    } catch (error) {
      console.log(error)
      return res.json({ err: error })
    }
  })

  app.post('/register', async function (req, res) {
    const hashedPassword = await genPassword(req.body.password)
    console.log(req.body)
    const { email } = req.body
    if (!email) {
      return res
        .status(400)
        .send({ success: false, error: 'Missing input parameters.' })
    }
    try {
      const queryResult = await db.query(
        'INSERT INTO users(email,password) VALUES( ?, ? )',
        [email, hashedPassword]
      )
      const id = Number(queryResult.insertId)
      const user = {
        id: id,
        email: email,
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
