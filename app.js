const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const path = require('path')
const logger = require('morgan')
const fs = require('fs')
const PORT = 3000

app
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(express.static('static'))
  .use(cookieParser())
  .use(logger('dev'))

app.get('/app/:app_name', (req, res) => {
  const appsConfig = JSON.parse(
    fs.readFileSync(__dirname + '/conf/apps.json', 'utf-8')
  )

  const app_name = req.params.app_name
  const app_config = appsConfig[app_name]

  if (!app_config) {
    res.render('index', {
      code: 40001,
      msg: `未找到匹配的应用： [ ${app_name} ]，请检查配置 apps.json`,
      app_name,
      branch_key: '',
      branch: '',
      webroot: '',
      branches: ''
    })
    return
  }

  const webroot = app_config.webroot
  const webroot_branches = app_config.webroot_branches
  const branch_key = app_config.branch_key

  if (!branch_key) {
    res.render('index', {
      code: 40003,
      msg: '应用未配置branch_key,请检查配置 apps.json',
      app_name,
      branch_key,
      branch: '',
      webroot: '',
      branches: ''
    })
    return
  }
  if (!webroot_branches) {
    res.render('index', {
      code: 40005,
      msg: '应用未配置webroot_branches,请检查配置 apps.json',
      app_name,
      branch_key,
      branch: '',
      webroot: '',
      branches: ''
    })
    return
  }
  if (!webroot) {
    res.render('index', {
      code: 40006,
      msg: '应用未配置webroot,请检查配置 apps.json',
      app_name,
      branch_key,
      branch: '',
      webroot: '',
      branches: ''
    })
    return
  }

  const branch = req.cookies[branch_key]

  if (!fs.existsSync(webroot_branches)) {
    res.render('index', {
      code: 40004,
      msg: `分支根目录不存在 ${webroot_branches}`,
      app_name,
      branches: '',
      webroot: '',
      branch_key,
      branch
    })
    return
  }

  let webroot_folder
  if (!branch) {
    webroot_folder = webroot
  } else {
    webroot_folder = `${webroot_branches}/${branch}`
  }

  if (!fs.existsSync(webroot)) {
    res.render('index', {
      code: 40002,
      msg: `应用目录不存在 ${webroot}，请检查应用目录是否正确`,
      app_name,
      branches: '',
      webroot: webroot_folder,
      branch_key,
      branch
    })
    return
  }

  const branches = fs.readdirSync(webroot_branches).join(',')
  res.render('index', {
    code: 200,
    msg: `应用目录有效 ${webroot}`,
    webroot: webroot_folder,
    app_name,
    branches,
    branch,
    branch_key
  })
})

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`)
})
