// SCRIPT.JS
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

// Resizing the canvas
function resizeCnv() { cnv.width = window.innerWidth; cnv.height = window.innerHeight; }
resizeCnv();
window.addEventListener('resize', resizeCnv);

// Variables
let player = {
    x: cnv.width/2, y: cnv.height/2, r: 15, speed: cnv.width/275, baseSpeed: cnv.width/275, color: "#FFFFFF", subColor: "#E6E6E6",
}
let now = Date.now();
let mapY = 0, mapX = 0;
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
    let xKb = 0; yKb = 0;
    
    if (moveRight) xKb += 1;
    if (moveLeft) xKb -= 1;
    if (moveDown) yKb += 1;
    if (moveUp) yKb -= 1;

    if (xKb != 0 && yKb != 0) {
        xKb *= Math.SQRT1_2;
        yKb *= Math.SQRT1_2;
    }

    player.x += xKb * player.speed;
    player.y += yKb * player.speed;
}

// Quick Draw functions
function circle(x, y, r, type) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, 0);
    if (type === "stroke") ctx.stroke();
    else ctx.fill();
}

console.log("rezised box");
function draw() {
    now = Date.now();
    // Background #RRGGBBAA
    ctx.fillStyle = "#C8C8C8";
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    // Border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, cnv.width-10, cnv.height-10);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(5, 5, cnv.width-10, cnv.height-10);
    // Movement
    keyboardMovement();
    if (player.x < 100) { player.x = Math.max(player.x, 100); mapX += player.speed; }
    if (player.x > cnv.width-100) { player.x = Math.min(player.x, cnv.width-100); mapX -= player.speed; }
    if (player.y < 100) { player.y = Math.max(player.y, 100); mapY += player.speed; }
    if (player.y > cnv.height-100) { player.y = Math.min(player.y, cnv.height-100); mapY -= player.speed; }

    // Dashing
    if (dash.activated) dash.use();

    if (now - dash.lastEnded <= 1500) {
        ctx.fillStyle = "#FFFFFF";
        ctx.lineWidth = 2;
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

    // Sword Statue
    ctx.fillStyle = "#FF000050";
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cnv.width*3/4+mapX, cnv.height/2-22.5+mapY, 45, 45);
    ctx.strokeRect(cnv.width*3/4+mapX, cnv.height/2-22.5+mapY, 45, 45);
    let distSword = Math.hypot(player.x - (cnv.width*3/4+22.5+mapX), player.y - (cnv.height/2+mapY));
    if (distSword < 100) {
        ctx.lineWidth = 1.25;
        ctx.fillRect(cnv.width*3/4-32.5+mapX, cnv.height/2+35+mapY, 110, 20);
        ctx.strokeRect(cnv.width*3/4-32.5+mapX, cnv.height/2+35+mapY, 110, 20);
        
        ctx.fillStyle = "#FF0000";
        ctx.textAlign = "center";
        ctx.font = "bold 15px Verdana";
        ctx.fillText("Equip Sword", cnv.width*3/4+22.5+mapX, cnv.height/2+50+mapY);
    }

    // Player
    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.subColor;
    ctx.lineWidth = 2;
    circle(player.x, player.y, player.r, "fill");
    circle(player.x, player.y, player.r, "stroke");

    // Animate
    requestAnimationFrame(draw);
}

draw();

