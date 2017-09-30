"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var socketIO = require("socket.io");
var path = require("path");
var Player_1 = require("./Player");
var GameServer = /** @class */ (function () {
    function GameServer() {
        var _this = this;
        //private _httpServer: http.Server;
        this._playerList = [];
        var dir = path.dirname(__dirname);
        this._indexDir = path.join(dir, "/public");
        this._indexPath = path.join(dir, "/public/index.html");
        //assign it to variable app
        var app = express();
        // send a index.html file when a get request is fired to the given 
        // route, which is ‘/’ in this case
        app.get("/", function (req, res) {
            res.sendFile(_this._indexPath);
        });
        // this means when a get request is made to ‘/public’, put all the 
        // static files inside the client folder 
        // Under ‘/public’. See for more details below
        app.use("/", express.static(this._indexDir));
        // create a server and pass in app as a request handler
        var httpServer = http.createServer(app); //Server-11
        // binds the serv object we created to socket.io
        this._ioServer = socketIO(httpServer, {});
        // listen on port 2000
        httpServer.listen(process.env.PORT || 2000);
        console.log("Server started.");
        // listen for a connection request from any client
        this._ioServer.sockets.on("connection", function (socket) { _this.OnConnect(socket); });
    }
    GameServer.prototype.OnConnect = function (socket) {
        var _this = this;
        // output a unique socket.id
        console.log("socket connected, id = " + socket.id);
        // listen for disconnection;
        // OnClientdisconnect
        socket.on('disconnect', function () {
            console.log('disconnect');
            var removePlayer = _this.FindPlayerById(socket.id);
            if (removePlayer) {
                _this._playerList.splice(_this._playerList.indexOf(removePlayer), 1);
            }
            console.log("removing player " + socket.id);
            // Send message to every connected client except the sender
            socket.broadcast.emit('remove_player', { id: socket.id });
        });
        // Listen for new player
        // OnNewplayer
        socket.on("new_player", function (data) {
            console.log("new_player: " + data);
            // new player instance
            var newPlayer = new Player_1.Player(data.x, data.y, data.angle);
            console.log("newPlayer = " + newPlayer);
            console.log("created new player with id = " + socket.id);
            newPlayer.id = socket.id;
            // information to be sent to all clients except sender
            var currentInfo = {
                id: newPlayer.id,
                x: newPlayer.x,
                y: newPlayer.y,
                angle: newPlayer.angle
            };
            // send to the new player about everyone who is already connected
            for (var i = 0; i < _this._playerList.length; i++) {
                var existingPlayer = _this._playerList[i];
                var playerInfo = {
                    id: existingPlayer.id,
                    x: existingPlayer.x,
                    y: existingPlayer.y,
                    angle: existingPlayer.angle,
                };
                console.log("pushing player");
                // send message to the sender-client only
                socket.emit("new_enemyPlayer", playerInfo);
            }
            // send message to every connected client except the sender
            socket.broadcast.emit('new_enemyPlayer', currentInfo);
            _this._playerList.push(newPlayer);
        });
        // listen for player position update
        // OnMovePlayer
        socket.on("move_player", function (data) {
            var movePlayer = _this.FindPlayerById(socket.id);
            movePlayer.x = data.x;
            movePlayer.y = data.y;
            movePlayer.angle = data.angle;
            var movePlayerData = {
                id: movePlayer.id,
                x: movePlayer.x,
                y: movePlayer.y,
                angle: movePlayer.angle
            };
            //send message to every connected client except the sender
            socket.broadcast.emit('enemy_move', movePlayerData);
        });
    };
    GameServer.prototype.FindPlayerById = function (id) {
        for (var i = 0; i < this._playerList.length; i++) {
            if (this._playerList[i].id == id) {
                return this._playerList[i];
            }
        }
        return null;
    };
    return GameServer;
}());
new GameServer();

//# sourceMappingURL=server.js.map
