import { Game } from "./Game";

function hello(compiler: string)
{
    console.log(`Hello from ${compiler}`);
}

window.onload = () =>
{
    new Game();
}
