// SCRIPT.JS
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

// Resizing the canvas
function resizeCnv() { cnv.width = window.innerWidth; cnv.height = window.innerHeight; }
resizeCnv();
window.addEventListener('resize', resizeCnv);

// Variables
let player = {
    x: cnv.width*0.5, y: cnv.height*0.5, r: 15, speed: cnv.width*0.575, baseSpeed: cnv.width/275, color: "#FFFFFF", subColor: "#E6E6E6",
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

// Mouse
document.addEventListener('mousemove', mousemoveEventListener);
document.addEventListener('click', clickEventListener);
let mouseX = 0, mouseY = 0;
let mouseover = {
    equipSword: false,
}
function mousemoveEventListener(e) {
    [mouseX, mouseY] = [e.clientX, e.clientY];
}
function detectHover() {
    mouseover.equipSword = (mouseX > cnv.width*0.75-5+mapX && mouseX < cnv.width*0.75-5+mapX+110
        && mouseY > cnv.height*0.5+60+mapY && mouseY < cnv.height*0.5+60+mapY + 20);
}
function clickEventListener(e) {
    if (mouseover.equipSword) { player.color = "#FF0000"; player.subColor = "#E60000"};
}

// Controls
document.addEventListener('keydown', keydownEventListener);
document.addEventListener('keyup', keyupEventListener);
let moveUp = false, moveDown = false, moveLeft = false, moveRight = false;
function keydownEventListener(e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveUp = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveDown = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = true;
    if (e.code === "KeyQ" && now - dash.lastEnded > 1500) dash.activated = true;
}
function keyupEventListener(e) {
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

console.log("mous");
function draw() {
    now = Date.now();
    detectHover();
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
        ctx.roundRect(cnv.width-175, cnv.height*0.5-6.25, 150, 12.5, 6.25);
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(cnv.width-175, cnv.height*0.5-6.25, 150-(now-dash.lastEnded)/10, 12.5, 6.25);
        ctx.fill();

        ctx.fillStyle = "#E6E6E6";
        ctx.font = "15px Verdana";
        ctx.textAlign = "right";
        ctx.fillText("Dash", cnv.width-185, cnv.height*0.5+5);
        ctx.font = "10px Verdana";
        ctx.textAlign = "center";
        ctx.fillText(`${(1.5-(now-dash.lastEnded)/1000).toFixed(2)}s`, cnv.width-100, cnv.height/2+10/3);
    }

    // Sword Statue
    ctx.fillStyle = "#FF000050";
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2.5;
    ctx.fillRect(cnv.width*0.75+mapX, cnv.height*0.5-50+mapY, 100, 100);
    ctx.drawImage(document.getElementById("sword-icon"), cnv.width*0.75+mapX, cnv.height*0.5-50+mapY, 100, 100);
    ctx.strokeRect(cnv.width*0.75+mapX, cnv.height*0.5-50+mapY, 100, 100);
    let distSword = Math.hypot(player.x - (cnv.width*0.75+50+mapX), player.y - (cnv.height*0.5+mapY));
    if (distSword < 150) {
        ctx.lineWidth = 1.25;
        if (mouseover.equipSword) ctx.fillStyle = "#FF000025";
        ctx.fillRect(cnv.width*0.75-5+mapX, cnv.height*0.5+60+mapY, 110, 20);
        ctx.strokeRect(cnv.width*0.75-5+mapX, cnv.height*0.5+60+mapY, 110, 20);
        
        ctx.fillStyle = "#FF0000";
        ctx.textAlign = "center";
        ctx.font = "bold 15px Verdana";
        ctx.fillText("Equip Sword", cnv.width*0.75+50+mapX, cnv.height*0.5+75+mapY);
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

