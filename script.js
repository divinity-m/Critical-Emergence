// SCRIPT.JS
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

// Resizing the canvas
function resizeCnv() { cnv.width = window.innerWidth; cnv.height = window.innerHeight; }
resizeCnv();
window.addEventListener('resize', resizeCnv);

// Variables
let player = {
    x: cnv.width/2, y: cnv.height/2, r: 15, speed: 5, baseSpeed: 5, color: "#FFFFFF", subColor: "#E6E6E6",
}
let now = Date.now();
let dash = {
    activated: false, accel: 1, lastEnded: 0,
    use: function() {  
        player.speed += this.accel;
        player.color = "#E6E6E6";
        player.subColor = "#FFFFFF";
        if (player.speed >= player.baseSpeed*3 && this.accel === 1) this.accel = -1;
        if (this.accel === -1 && player.speed <= player.baseSpeed) {
            player.speed = player.baseSpeed;    
            player.color = "#FFFFFF";
            player.subColor = "#E6E6E6";
            this.activated = false;
            this.accel = 1;
            this.lastEnded = Date.now();
        }
    }
};

// Controls
document.addEventListener('keydown', keyDownEventListener);
document.addEventListener('keyup', keyUpEventListener);
let moveUp = false, moveDown = false, moveLeft = false, moveRight = false;
function keyDownEventListener(e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveUp = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveDown = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = true;
    if (e.code === "KeyQ" && now - dash.lastEnded > 1500) dash.activated = true;
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

// Quick Draw functions
function circle(x, y, r, type) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, 0);
    if (type === "stroke") ctx.stroke();
    else ctx.fill();
}

console.log("border");
function draw() {
    now = Date.now();
    // Background #RRGGBBAA
    ctx.fillStyle = "#C8C8C8";
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.strokeStyle = "#E8E8E8";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, cnv.width, cnv.height);

    // Dashing
    if (dash.activated) dash.use();

    if (now - dash.lastEnded <= 1500) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(cnv.width-175, cnv.height/2-6.25, 150, 12.5, 6.25);
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(cnv.width-175, cnv.height/2-6.25, 150-(now-dash.lastEnded)/10, 12.5, 6.25);
        ctx.fill();

        ctx.fillStyle = "#E6E6E6";
        ctx.font = "15px Verdana";
        ctx.textAlign = "right";
        ctx.fillText("Dash", cnv.width-185, cnv.height/2+5);
        ctx.font = "10px Verdana";
        ctx.textAlign = "center";
        ctx.fillText(`${(1.5-(now-dash.lastEnded)/1000).toFixed(2)}s`, cnv.width-100, cnv.height/2+10/3);
        
    }

    // Player
    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.subColor;
    ctx.lineWidth = 2;
    circle(player.x, player.y, player.r, "fill");
    circle(player.x, player.y, player.r, "stroke");
    keyboardMovement();
    player.x = Math.max(player.x, player.r+2);
    player.x = Math.min(player.x, cnv.width-player.r-2);
    player.y = Math.max(player.y, player.r+2);
    player.y = Math.min(player.y, cnv.height-player.r-2);
    
    requestAnimationFrame(draw);
}

draw();

