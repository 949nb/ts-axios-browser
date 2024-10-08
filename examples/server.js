const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const webpack = require('webpack')
//https://segmentfault.com/a/1190000022096603 webpack-dev-middleware 源码解读
const webpackDevMiddleware = require('webpack-dev-middleware')
//web负责热更新的模块
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require('./webpack.config')

const multipart = require('connect-multiparty')

const app = express()
const compiler = webpack(WebpackConfig)

// 简而言之 webpack将打包一些资源到对应文件夹让express访问
app.use(webpackDevMiddleware(compiler, {
  publicPath: '/__build__/',
  stats: {
    colors: true,
    chunks: false
  }
}))

app.use(webpackHotMiddleware(compiler))

app.use(express.static(__dirname))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(multipart({
  uploadDir: path.resolve(__dirname, 'upload-file')
}))

const router = express.Router()

// base
router.get('/base/get', (req, res) => {
  res.json(req.query)
})
router.post('/base/post', function(req, res) {
  res.json(req.body)
})
router.post('/base/buffer', function(req, res) {
  let msg = []
  req.on('data', (chunk) => {
    if (chunk) {
      msg.push(chunk)
    }
  })
  req.on('end', () => {
    let buf = Buffer.concat(msg)
    res.json(buf.toJSON())
  })
})

// extend
router.post('/extend/post', function(req, res) {
  res.json(req.body)
})
router.put('/extend/put', function(req, res) {
  res.json(req.body)
})
router.patch('/extend/patch', function(req, res) {
  res.json(req.body)
})
router.get('/extend/get', (req, res) => {
  res.json(req.query)
})
router.get('/extend/user', (req, res) => {
  res.json({
    result: {
      name: "Yee",
      age: 28
    }
  })
})
router.delete('/extend/delete', (req, res) => {
  res.json(req.query)
})
router.head('/extend/head', (req, res) => {
  res.json(req.query)
})
router.options('/extend/options', function(req, res) {
  res.json(req.query)
})

// error
router.get('/error/get', function(req, res) {
  res.status(500)
  res.end()
})
router.get('/error/timeout', function(req, res) {
  setTimeout(() => {
    res.json({
      msg: `hello world`
    })
  }, 3000)
})

// interceptor
router.get('/interceptor/get', (req, res) => {
  res.json(req.query)
})

// config
router.post('/config/post', (req, res) => {
  res.json(req.body)
})
router.get('/config/get', (req, res) => {
  res.json(req.query)
})

// cancel
router.get('/cancel/get', (req, res) => {
  setTimeout(() => {
    res.json(req.query)
  }, 1000)
})

// more
router.get('/more/get', (req, res) => {
  res.cookie('server1', 'test', { sameSite: 'none', secure: true })
  res.cookie('XSRF-TOKEN-D', '1234abc')
  res.json(
    {
      msg: '/more/get response'
    }
  )
})

router.post('/more/upload', function(req, res) {
  res.end('upload success!')
})


app.use(router)

const port = process.env.PORT || 8081
module.exports = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
})
