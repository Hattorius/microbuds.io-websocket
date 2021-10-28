
import { config } from 'dotenv';
config();
import * as express from "express";
import * as cors from "cors"; // to do: remove
const app = express();
app.use(cors()) // to do: remove
import * as http from "http";
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server, { // to do: remove
	cors: {
		origin: "*"
	}
});
import * as mysql from 'mysql';

var online = 0;
var microbuddies = [];
var traits = [];

var connection = mysql.createConnection({
    host: process.env.mysql_host,
    user: process.env.mysql_username,
    password: process.env.mysql_password,
    database: process.env.mysql_database
});
connection.connect();

app.get('/', (req, res) => {
    res.send(`<script src="/socket.io/socket.io.js"></script>
    <script>
      var socket = io();
    </script>`);
});

app.get('/api', (req, res) => {
    res.send("hattywashere.eth");
});

app.get('/api/microbuddies', (req, res) => {
    res.json(microbuddies);
});

app.get('/api/traits', (req, res) => {
    res.json(traits);
});

io.on('connection', (socket) => {
    console.log("New connection!");
    online += 1;
    io.emit('online', online);
    socket.on('disconnect', () => {
        console.log('Disconnection :(');
        online -= 1;
        io.emit('online', online);
    });
});

connection.query("SELECT * FROM microbuddies ORDER BY token_id ASC", (error, results, fields) => {
    if (error) throw error;
    microbuddies = results;
});

connection.query("SELECT * FROM traits", (error, results, fields) => {
    if (error) throw error;
    traits = results;
});

server.listen(8080, () => {
    console.log("Server started!");
});

(async () => {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    while (true) {
        await delay(2500);
        connection.query("SELECT * FROM microbuddies WHERE token_id > ? ORDER BY token_id ASC", microbuddies.at(-1).token_id, (error, results, fields) => {
            if (error) throw error;
            if (results.length > 0) io.emit('new microbuddy', results);
            for (var i = 0; i < results.length; i++) {
            	microbuddies.push(results[i]);
            }
        });
        connection.query("SELECT * FROM traits WHERE id > ?", traits.at(-1).id, (error, results, fields) => {
            if (error) throw error;
            if (results.length > 0) io.emit('new trait', results);
            for (var i = 0; i < results.length; i++) {
            	traits.push(results[i]);
            }
        })
    }
})();
 
