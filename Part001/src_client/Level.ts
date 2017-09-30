/// <reference path="./libs/phaser.d.ts" />

import * as io from "socket.io-client";
import { GameProperties } from "./GameProperties";

import { PlayerHelper } from "./PlayerHelper";
import { RemotePlayer } from "./RemotePlayer";

export class Level extends Phaser.State
{
    private _socket: SocketIOClient.Socket;
    private _player: Phaser.Graphics;
    private _enemyList: RemotePlayer[] = [];

    public preload()
    {
        this.stage.disableVisibilityChange = true;
        this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        this.world.setBounds(
            0, 0,
            GameProperties.GameWidth, GameProperties.GameHeight);
        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.setBoundsToWorld(false, false, false, false);
        this.physics.p2.gravity.y = 0;
        this.physics.p2.applyGravity = false;
        this.physics.p2.enableBody(this.physics.p2.walls, false);
        // physics start system
        //game.physics.p2.setImpactEvents(true);
    }

    public create()
    {
        this._socket = io.connect();
        this.stage.backgroundColor = 0xE1A193;
        console.log("client started");
        this._socket.on("connect", () => { this.OnSocketConnected(); });

        // Listen to new enemy connections
        this._socket.on("new_enemyPlayer",
            (data: { id: string, x: number, y: number, angle: number }) =>
            {
                this.OnNewPlayer(data);
            });

        // Listen to enemy movement 
        this._socket.on("enemy_move",
            (data: { id: string, x: number, y: number, angle: number }) =>
            {
                this.OnEnemyMove(data);
            });

        // When received remove_player, remove the player passed; 
        this._socket.on('remove_player',
            (data: { id: string }) =>
            {
                this.OnRemovePlayer(data);
            });
    }

    public update()
    {
        // Move the player when the player is made
        if (GameProperties.InGame)
        {
            let pointer = this.input.mousePointer;

            if (PlayerHelper.DistanceToPointer(this._player, pointer) <= 50)
            {
                PlayerHelper.MoveToPointer(this._player, 0, pointer, 100);
            }
            else
            {
                PlayerHelper.MoveToPointer(this._player, 500, pointer, 100);
            }

            // Send a new position data to the server 
            this._socket.emit('move_player', { x: this._player.x, y: this._player.y, angle: this._player.angle });
        }
    }

    private CreatePlayer()
    {
        this._player = this.add.graphics(0, 0);
        let radius = 100;
        // Set a fill and line style
        this._player.beginFill(0xffd900);
        this._player.lineStyle(2, 0xffd900, 1);
        this._player.drawCircle(0, 0, radius * 2);
        this._player.endFill();
        this._player.pivot.set(50, 50);
        let bodySize = radius;

        // Draw a shape
        this.physics.p2.enableBody(this._player, true);
        this._player.body.clearShapes();
        this._player.body.addCircle(bodySize, 0, 0);
        this._player.body.data.shapes[0].sensor = true;
    }

    private OnSocketConnected()
    {
        console.log("OnSocketConnected: connected to server");
        this.CreatePlayer();
        GameProperties.InGame = true;
        // Send the server our initial position and tell it we are connectedthis._socket.
        this._socket.emit("new_player", { x: 0, y: 0, angle: 0 });
    }

    private OnNewPlayer(data: { id: string, x: number, y: number, angle: number })
    {
        // Enemy object
        let newEnemy = new RemotePlayer(data.id, data.x, data.y, data.angle, this);
        this._enemyList.push(newEnemy);
    }

    // Server tells us there is a new enemy movement. We find the moved enemy
    // and sync the enemy movement with the server
    private OnEnemyMove(data: { id: string, x: number, y: number, angle: number })
    {
        var movePlayer = this.FindEnemyById(data.id);

        if (!movePlayer)
        {
            return;
        }
        movePlayer.player.body.x = data.x;
        movePlayer.player.body.y = data.y;
        movePlayer.player.angle = data.angle;
    }

    // When the server notifies us of client disconnection, we find the disconnected
    // enemy and remove from our game
    private OnRemovePlayer(data: { id: string })
    {
        console.log("OnRemovePlayer");
        var removePlayer = this.FindEnemyById(data.id);
        // Player not found
        if (!removePlayer)
        {
            console.log('Player not found: ', data.id)
            return;
        }

        removePlayer.player.destroy();
        this._enemyList.splice(this._enemyList.indexOf(removePlayer), 1);
    }

    private FindEnemyById(id: string): RemotePlayer
    {
        for (var i = 0; i < this._enemyList.length; i++)
        {
            if (this._enemyList[i].id == id)
            {
                return this._enemyList[i];
            }
        }

        return null;
    }
}
