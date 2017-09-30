import * as express from "express";
import * as http from "http";
import * as socketIO from "socket.io";
import * as path from "path";

import { Player } from "./Player";

class GameServer
{
    private _ioServer: SocketIO.Server;
    //private _httpServer: http.Server;
    private _playerList: Player[] = [];
    private _indexDir: string;
    private _indexPath: string;

    public constructor()
    {
        let dir = path.dirname(__dirname);
        this._indexDir =  path.join(dir, "/public");
        this._indexPath = path.join(dir, "/public/index.html");

        //assign it to variable app
        let app = express();
        // send a index.html file when a get request is fired to the given 
        // route, which is ‘/’ in this case
        app.get("/", (req, res) =>
        {
            res.sendFile(this._indexPath);
        });

        // this means when a get request is made to ‘/public’, put all the 
        // static files inside the client folder 
        // Under ‘/public’. See for more details below
        app.use("/", express.static(this._indexDir));
        // create a server and pass in app as a request handler
        let httpServer = http.createServer(app); //Server-11
        // binds the serv object we created to socket.io
        this._ioServer = socketIO(httpServer, {});
        // listen on port 2000
        httpServer.listen(process.env.PORT || 2000);
        console.log("Server started.");

        // listen for a connection request from any client
        this._ioServer.sockets.on("connection", (socket) => { this.OnConnect(socket); });
    }

    private OnConnect(socket: SocketIO.Socket): void
    {
        // output a unique socket.id
        console.log(`socket connected, id = ${socket.id}`);

        // listen for disconnection;
        // OnClientdisconnect
        socket.on('disconnect', () =>
        {
            console.log('disconnect');
            let removePlayer = this.FindPlayerById(socket.id);

            if (removePlayer)
            {
                this._playerList.splice(this._playerList.indexOf(removePlayer), 1);
            }

            console.log("removing player " + socket.id);

            // Send message to every connected client except the sender
            socket.broadcast.emit('remove_player', { id: socket.id });
        });

        // Listen for new player
        // OnNewplayer
        socket.on("new_player", (data: { x: number, y: number, angle: number }) =>
        {
            console.log("new_player: " + data);
            // new player instance
            let newPlayer = new Player(data.x, data.y, data.angle);
            console.log(`newPlayer = ${newPlayer}`);
            console.log(`created new player with id = ${socket.id}`);
            newPlayer.id = socket.id;
            // information to be sent to all clients except sender
            let currentInfo = {
                id: newPlayer.id,
                x: newPlayer.x,
                y: newPlayer.y,
                angle: newPlayer.angle
            };
            // send to the new player about everyone who is already connected
            for (let i = 0; i < this._playerList.length; i++)
            {
                let existingPlayer = this._playerList[i];
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

            this._playerList.push(newPlayer);
        });

        // listen for player position update
        // OnMovePlayer
        socket.on("move_player", (data: { x: number, y: number, angle: number }) =>
        {
            let movePlayer = this.FindPlayerById(socket.id);
            movePlayer.x = data.x;
            movePlayer.y = data.y;
            movePlayer.angle = data.angle;

            let movePlayerData = {
                id: movePlayer.id,
                x: movePlayer.x,
                y: movePlayer.y,
                angle: movePlayer.angle
            }

            //send message to every connected client except the sender
            socket.broadcast.emit('enemy_move', movePlayerData);
        });
    }

    private FindPlayerById(id: string): Player
    {
        for (var i = 0; i < this._playerList.length; i++)
        {
            if (this._playerList[i].id == id)
            {
                return this._playerList[i];
            }
        }

        return null;
    }
}

new GameServer();
