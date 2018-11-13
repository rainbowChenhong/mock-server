const express = require('express');
const path = require('path');
const fs = require('fs');
const Mock = require('mockjs');

const app = express();
const port = 5050;
const apiPath = path.join(__dirname, './api.json');
let apiData = {};

app.listen(port, function () {
  console.info('mock server is  listening at ' + port)
});

//读取文件
let getApi = () => {
  let readStream = fs.createReadStream(apiPath, {
    encoding: 'utf8'
  });

  readStream.on('data', (chunk) => {
    apiData = JSON.parse(chunk)
  });
  readStream.on('end', () => {
    console.info('读取已完成..');
  });
}

fs.watchFile(apiPath, () => {
  getApi();
  console.info('mock server update');
});

getApi();

app.use((req, res, next) => {
  const originalUrl = req.originalUrl;
  let data = undefined;
  //匹配路径
  for (let url in apiData) {
    let findItem = apiData[url].find((result) => {
      if (result.url === originalUrl) {
        return result
      }
    });
    if (findItem !== undefined) {
      data = Mock.mock(findItem.res);
      break;
    }
  }
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  //返回数据
  data !== undefined ? res.send(data) : res.sendStatus(404);
  next();
});