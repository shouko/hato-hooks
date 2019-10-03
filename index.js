const express = require('express')
const multer = require('multer')()
const crypto = require('crypto')
const bodyParser = require('body-parser')
const request = require('request')
const Queue = require('better-queue');
const app = express()

const triggerApi = new Queue((url, cb) => {
  request(url, (err, res) => cb(err, res))
})

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

    const dci = new RegExp(`http:\/\/${process.env.DCI_HOSTNAME}\/[^\/]+\/(\\w+)`, 'g')
    let match
    while(match = dci.exec(req.body['body-html'])) {
      const dciId = match[1]
      console.log(`Mathed ${dciId}`)
      triggerApi.push(`${process.env.DCI_API}/${dciId}`, (err) => {
        if (err) return console.error(err)
        console.log(`Saved ${dciId}`)
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