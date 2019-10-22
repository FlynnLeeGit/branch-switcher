const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const logger = require('morgan')
const fs = require('fs')
const fse = require('fs-extra')
const PORT = 3000

function getAppConfig(appName) {
  const appsConfig = JSON.parse(
    fs.readFileSync(__dirname + '/conf/apps.json', 'utf-8')
  )
  if (!appsConfig) {
    return
  }
  return appsConfig[appName]
}

app
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(express.static('static'))
  .use(cookieParser())
  .use(bodyParser.json())
  .use(logger('dev'))

app.post('/gitlab-hooks/:app_name', (req, res) => {
  const app_name = req.params.app_name
  const app_config = getAppConfig(app_name)
  if (!app_config) {
    res.status(400).json({
      code: 40001,
      msg: `未找到匹配的应用： [ ${app_name} ]，请检查配置 apps.json`
    })
    return
  }
  if (!req.body.repository) {
    res.status(400).json({
      code: 40008,
      msg: `需要gitlab push事件`
    })
    return
  }

  const event = req.body
  if (!event.after.includes('00000000000000000')) {
    res.status(200).json({
      code: 200,
      data: {},
      msg: '非删除分支事件'
    })
    return
  }

  const webroot_branches = app_config.webroot_branches
  const branch = event.ref.replace('refs/heads/', '')
  const branchDir = path.join(webroot_branches, branch)

  if (!webroot_branches) {
    res.status(400).json({
      code: 40005,
      msg: `${app_name}应用未配置webroot_branches,请检查配置 apps.json`
    })
    return
  }

  fse.removeSync(branchDir)
  res.status(200).json({
    code: 200,
    data: {},
    msg: 'ok'
  })
})

app.get('/app/:app_name', (req, res) => {
  const app_name = req.params.app_name
  const app_config = getAppConfig(app_name)

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

  if (!fse.existsSync(webroot_branches)) {
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

  if (!fse.existsSync(webroot)) {
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

  const branches = fse.readdirSync(webroot_branches).join(',')
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
  console.log(`server started on http://localhost:${PORT}`)
})
