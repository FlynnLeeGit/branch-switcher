const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const path = require('path')
const fs = require('fs')
const PORT = 3000

app
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(express.static('static'))
  .use(cookieParser())

app.get('/:app_name', (req, res) => {
  const appsConfig = JSON.parse(
    fs.readFileSync(__dirname + '/conf/apps.json', 'utf-8')
  )
  const data = {
    code: 200,
    app_name: '',
    branch_key: '',
    webroot: '',
    branch: '',
    msg: ''
  }
  data.app_name = req.params.app_name
  const appConfig = appsConfig[data.app_name]
  if (!appConfig) {
    data.code = 40001
    data.msg = `未找到匹配的应用： [ ${
      data.app_name
    } ]，请检查配置 conf/apps.json`
    res.render('index', data)
    return
  }

  data.branch_key = appConfig.branch_key
  data.webroot = appConfig.webroot
  data.branch = req.cookies[data.branch_key]
  if (data.branch) {
    data.webroot = `${data.webroot}/${data.branch}`
  }

  if (!fs.existsSync(data.webroot)) {
    data.code = 40002
    data.msg = `应用目录不存在 ${data.webroot}，请检查应用是否已构建`
    res.render('index', data)
    return
  }

  data.msg = `应用目录有效 ${data.webroot}`
  res.render('index', data)
})

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`)
})
