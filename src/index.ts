
import * as express from "express";
const app = express();
import * as http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);

app.get('/', (req, res) => {
    res.send(`<script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io();
    </script>`);
});

io.on('connection', (socket) => {
    console.log("New connection!");
    socket.on('disconnect', () => {
        console.log('Disconnection :(');
    });
});

server.listen(8080, () => {
    console.log("Server started!");
});
