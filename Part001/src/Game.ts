/// <reference path="./libs/phaser.d.ts" />

import { Level } from "./Level";

export class Game extends Phaser.Game
{
    public constructor()
    {
        super(
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio,
            Phaser.CANVAS,
            "gameDiv"
        );
        this.state.add("Level", Level, false);
        this.state.start("Level");
    }
}
