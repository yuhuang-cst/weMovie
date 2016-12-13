##package.json有改动

请执行**npm install**指令


##修改MaxListener
node_modules/mongodb/lib/gridfs-stream/index.js

this.setMaxListeners(50)