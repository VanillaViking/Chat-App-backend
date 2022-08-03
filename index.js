const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws')

const wss = new WebSocket.Server({ server:server });

let connections = []

const buildPath = path.join(__dirname, '..', 'client/build')

app.use(express.static(buildPath))
app.get('/', (req, res) => res.sendFile(buildPath, 'index.html'))


wss.on('connection', function connection(ws) {
  console.log('new client connected');
  ws.isAlive = true;

  ws.on('close', () => {
    connections = connections.filter((item) => item.socket != ws);
    broadcastList();
  })

  ws.on('message', (msg) => {
      message = JSON.parse(msg);

      switch (message.type) {
        case 'name':
          connections.push({socket: ws, name: message.name});
          broadcastList();
          break;
        case 'inText':
          broadcastText(message.name, message.text);
          break;
      }
      
   })
})

wss.on('close', function close() {
});



function broadcastList() {
   wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({type: 'list', list: connections.map((obj) => obj.name)}));
      }
    });
}

function broadcastText(name, txt) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({type: 'outText', text: name + ": " + txt}))
    }
  })
}



server.listen(9000, () => console.log('Listening on port :9000'))
