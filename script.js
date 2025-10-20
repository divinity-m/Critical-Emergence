// SCRIPT.JS
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

function resizeCnv() { cnv.width = window.innerWidth; cnv.height = window.innerHeight; }
resizeCnv();
window.addEventListener('resize', resizeCnv);

// Controls
document.addEventListener('keydown', keyDownEventListener);
document.addEventListener('keyup', keyUpEventListener);
let moveUp = false, moveDown = false, moveLeft = false, moveRight = false;
function keyDownEventListener(e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveUp = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveDown = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = true;
    if (e.code === "KeyQ") dash();
}
function keyUpEventListener(e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveUp = false;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = false;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveDown = false;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = false;
}
function keyboardMovement() {
    if (moveUp) player.y -= player.speed;
    if (moveLeft) player.x -= player.speed;
    if (moveDown) player.y += player.speed;
    if (moveRight) player.x += player.speed;
}


let player = {
    x: cnv.width/2, y: cnv.height/2, r: 20, speed: 5, baseSpeed: 5, color: "#FFFFF", subColor: "#E6E6E6",
}
let now = Date.now();

function draw() {
    now = Date.now();
    // Background #RRGGBBAA
    ctx.fillStyle = "#C8C8C8";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // Player
    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.subColor;
    ctx.lineWidth = 2;
    circle(player.x, player.y, player.r, "fill");
    circle(player.x, player.y, player.r, "stroke");
    
    requestAnimationFrame(draw);
}
draw()

function cricle(x, y, r, type) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, 0);
    if (type === "stroke") ctx.stroke();
    else ctx.fill();
}
function dash() {
    console.log(dash);
}



