const express = require('express')
const multer = require('multer')()
const crypto = require('crypto')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

    const dci = new RegExp(`/http:\/\/${process.env.DCI_HOSTNAME}\/[^\/]+\/(\w+)/g`)
    let match
    while(match = dci.exec(req.body['body-html'])) {
      request(`${process.env.DCI_API}/${match[1]}`, (err, res) => {
        if (err) return console.error(err)
        console.log(`Saved ${match[1]}`)
      })
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