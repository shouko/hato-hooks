const express = require('express')
const multer = require('multer')()
const crypto = require('crypto')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/nogi', multer.any(), (req, res) => {
  try {
    const digest = crypto
      .createHmac('sha256', process.env.MG_SIGNING_KEY)
      .update(`${req.body.timestamp}${req.body.token}`)
      .digest().toString('hex')
    if (digest !== req.body.signature) {
      throw 'Invalid signature'
    }
    console.log(req.body)
    res.send('Success!')
  } catch(e) {
    console.error(e)
    res.sendStatus(400).end('Error!')
  }
})

app.listen(process.env.PORT || 3000, function () {
  console.log('App is listening!')
})