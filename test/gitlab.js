const axios = require('axios')

const pushContent = require('./push-del.json')

axios.post('http://localhost:3000/app/demo/gitlab', pushContent).then(res => {
  console.log(res.data)
})
