import { gameData } from "./UI.js"

const gameScene = document.getElementById("game")
const menuScene = document.getElementById("menu")
const resultScene = document.getElementById("result")

const processELEMENT = document.getElementById("process")


const scenes = [menuScene, gameScene, resultScene]

export function RenderScene(key){
    scenes.forEach(scene =>{
        scene.style.display = "none"
    })
    scenes[key].style.display = "block"
}

export function EndGame(message){
    resultScene.style.display = "block"
    document.getElementById("resultMessage").innerHTML = message
}

export function Rematch(){
    gameData.playAsBlack = !gameData.playAsBlack
    gameData.playAsWhite = !gameData.playAsWhite 
    StartGame()
}



