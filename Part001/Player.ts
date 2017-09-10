export class Player
{
    public id: string;
    public x: number;
    public y: number;
    public angle:number;

    public constructor(startX: number, startY: number, startAngle: number)
    {
        this.x = startX;
        this.y = startY;
        this.angle = startAngle;
    }
}