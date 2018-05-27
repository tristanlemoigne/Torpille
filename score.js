"use strict"

function drawScore(){
    scoreContainer.style.display = "block"

    if(highScore === null){
        highScore = 0
    }
    highScoreContainer.innerHTML = highScore        
    interval = setInterval(updateScore, REFRESH_TIMER)  
}

function updateScore(){
    if (!document.hasFocus()) {  // Pause game if no focus
        return
    } else {
        currentScoreContainer.innerHTML = score
        score ++    
    }    
}

const REFRESH_TIMER = 250

let scoreContainer = document.getElementsByClassName("scores")[0]
let currentScoreContainer = document.getElementsByClassName("currentScore")[0]
let highScoreContainer = document.getElementsByClassName("highscore")[0]
let highScore = localStorage.getItem("highScore")
let score = 0
let interval
    


