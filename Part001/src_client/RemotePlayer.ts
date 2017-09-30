/// <reference path="./libs/phaser.d.ts" />

export class RemotePlayer
{
    public id: string;
    public x: number;
    public y: number;
    public angle:number;
    public player: Phaser.Graphics;

    public constructor(
        id: string,
        startX: number,
        startY: number,
        startAngle: number,
        state: Phaser.State)
    {
        this.id = id;
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;

        this.player = state.add.graphics(this.x, this.y);
        let radius = 100;

        // Set a fill and line style
        this.player.beginFill(0xffd900);
        this.player.lineStyle(2, 0xffd900, 1);
        this.player.drawCircle(0, 0, radius * 2);
        this.player.endFill();
        let bodySize = radius;

        // Draw a shape
        state.physics.p2.enableBody(this.player, true);
        this.player.body.clearShapes();
        this.player.body.addCircle(bodySize, 0, 0);
        this.player.body.data.shapes[0].sensor = true;
    }
}
