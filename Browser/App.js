import { gameData } from "./index.js"
import { Reset } from "./UI.js"
let scenes;
document.addEventListener("DOMContentLoaded", () => {
    const gameScene = document.getElementById("game");
    const menuScene = document.getElementById("menu");
    const resultScene = document.getElementById("result");

    scenes = [menuScene, gameScene, resultScene];
});
// const gameScene = document.getElementById("game")
// const menuScene = document.getElementById("menu")
// const resultScene = document.getElementById("result")

// const scenes = [menuScene, gameScene, resultScene]

export function RenderScene(key){
    scenes.forEach(scene =>{
        scene.style.display = "none"
    })
    scenes[key].style.display = "block"
}

export function EndGame(message){
    gameData.active = false
    resultScene.style.display = "block"
    document.getElementById("resultMessage").innerHTML = message
}

export function Rematch(){
    Reset()
    gameData.playAsBlack = !gameData.playAsBlack
    gameData.playAsWhite = !gameData.playAsWhite 
    StartGame()
}



