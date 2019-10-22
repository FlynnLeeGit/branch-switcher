const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const logger = require('morgan')
const fse = require('fs-extra')
const loadConf = require('./middlewares/load-conf')
const errors = require('./constants/errors')
const PORT = 3000

app
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(express.static('static'))
  .use(cookieParser())
  .use(bodyParser.json())
  .use(logger('dev'))

app.get('/app/:app_name', loadConf, (req, res) => {
  const app_name = req.app.get('app_name')
  const app_config = req.app.get('app_config')

  const webroot = app_config.webroot
  const webroot_branches = app_config.webroot_branches
  const branch_key = app_config.branch_key

  if (!branch_key) {
    res.render('index', {
      code: errors.BRANCH_KEY_NO_CONFIGURED,
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
      code: errors.BRANCH_KEY_NO_CONFIGURED,
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
      code: errors.WEBROOT_NO_CONFIGURED,
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
      code: errors.BRANCHES_DIR_NOT_FOUND,
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
      code: errors.WEBROOT_DIR_NOT_FOUND,
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

app.post('/app/:app_name/gitlab', loadConf, (req, res) => {
  const app_name = req.app.get('app_name')
  const app_config = req.app.get('app_config')
  if (!req.body.repository) {
    res.status(400).json({
      code: errors.NOT_GITLAB_EVENT,
      msg: `need be a gitlab push event`
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
      code: errors.BRANCHES_DIR_NOT_FOUND,
      msg: `${app_name}应用未配置webroot_branches,请检查配置 apps.json`
    })
    return
  }

  try {
    fse.emptyDirSync(branchDir)
    fse.removeSync(branchDir)
    res.status(200).json({
      code: 200,
      data: {},
      msg: 'ok'
    })
  } catch (e) {
    res.status(500).json({
      code: 500,
      data: e.stack,
      msg: e.message
    })
  }
})

app.delete('/app/:app_name/delete', loadConf, (req, res) => {
  const branch = req.body.branch
  const app_config = req.app.get('app_config')

  const webroot_branches = app_config.webroot_branches
  const branchDir = path.join(webroot_branches, branch)

  if (!webroot_branches) {
    res.status(400).json({
      code: errors.BRANCHES_DIR_NOT_FOUND,
      msg: `${app_name}应用未配置webroot_branches,请检查配置 apps.json`
    })
    return
  }
  try {
    fse.emptyDirSync(branchDir)
    fse.removeSync(branchDir)
    res.status(200).json({
      code: 200,
      data: {},
      msg: 'ok'
    })
  } catch (e) {
    res.status(500).json({
      code: 500,
      data: e.stack,
      msg: e.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`)
})
