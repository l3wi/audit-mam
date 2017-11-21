const express = require('express')
const next = require('next')
var bodyParser = require('body-parser')
const MAM = require('./mam.node.js')
const IOTA = require('iota.node.js')
const iota = new IOTA({ provider: 'https://testnet140.tangle.works' })

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

var state = MAM.init(iota)

app.prepare().then(() => {
  const server = express()
  server.use(bodyParser.json())

  server.get('/root', async (req, res) => {
    var root = MAM.getRoot(state)
    console.log(root)
    return res.json(root)
  })

  server.get('/init', async (req, res) => {
    state = MAM.init(iota)
    var root = MAM.getRoot(state)
    return res.json(root)
  })

  server.post('/post', async (req, res) => {
    var message1 = MAM.create(state, req.body.body)
    state = message1.state
    await MAM.attach(message1.payload, message1.address)
    return res.json(message1.root)
  })

  server.post('/fetch', async (req, res) => {
    var response = await MAM.fetch(req.body.id)
    return res.json(JSON.stringify(response))
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
