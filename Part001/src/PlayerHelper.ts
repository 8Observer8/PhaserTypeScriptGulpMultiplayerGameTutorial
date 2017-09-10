/// <reference path="./libs/phaser.d.ts" />

export class PlayerHelper
{
    public static MoveToPointer(
        displayObject: Phaser.Graphics,
        speed: number,
        pointer: Phaser.Pointer,
        maxTime: number)
    {
        let angle = this.AngleToPointer(displayObject, pointer);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = this.DistanceToPointer(displayObject, pointer) / (maxTime / 1000);
        }

        displayObject.body.velocity.x = Math.cos(angle) * speed;
		displayObject.body.velocity.y = Math.sin(angle) * speed;

        return angle;
    }

    public static DistanceToPointer(
        displayObject: Phaser.Graphics,
        pointer: Phaser.Pointer,
        isWorld = false)
    {
        let dx = (isWorld) ? displayObject.world.x - pointer.worldX :
            displayObject.x - pointer.worldX;
        let dy = (isWorld) ? displayObject.world.y - pointer.worldY :
            displayObject.y - pointer.worldY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static AngleToPointer(
        displayObject: Phaser.Graphics,
        pointer: Phaser.Pointer,
        isWorld = false)
    {
        if (isWorld)
        {
            return Math.atan2(
                pointer.worldY - displayObject.world.y,
                pointer.worldX - displayObject.world.x);
        }
        else
        {
            return Math.atan2(
                pointer.worldY - displayObject.y,
                pointer.worldX - displayObject.x);
        }
    }
}