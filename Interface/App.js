import { gameData } from "./index.js"
import { RenderBoard, Reset } from "./UI.js"

const gameScene = document.getElementById("game")
const menuScene = document.getElementById("menu")
const resultScene = document.getElementById("result")

const scenes = [menuScene, gameScene, resultScene]

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



