// SCRIPT.JS
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

// Resizing the canvas
// My window dimensions are 1536 by 864
function resizeCnv() { cnv.width = window.innerWidth; cnv.height = window.innerHeight; }
resizeCnv();
window.addEventListener('resize', resizeCnv);    
const GAME_WIDTH = window.screen.width, GAME_HEIGHT = window.screen.height; // to prevent bugs due to zooming

// Variables
let player = {
    x: GAME_WIDTH*0.5, y: GAME_HEIGHT*0.5, r: 15, speed: GAME_WIDTH/275, baseSpeed: GAME_WIDTH/275, color: "#FFFFFF", subColor: "#E6E6E6", img: "none",
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
let mouseX = 0, mouseY = 0, track;
let mouseover = {
    equipSword: false,
}
function mousemoveEventListener(e) {
    [mouseX, mouseY] = [e.clientX, e.clientY];
    if (track) console.log(`(${mouseX}, ${mouseY})`);
}
function detectHover() {
    let distSword = Math.hypot(player.x - (1150+50+mapX), player.y - (GAME_HEIGHT/2+mapY));
    mouseover.equipSword = distSword < 150 && mouseX > 1150-5+mapX && mouseX < 1150-5+mapX+110 && mouseY > GAME_HEIGHT/2+60+mapY && mouseY < GAME_HEIGHT/2+60+mapY+20;
}
function clickEventListener(e) {
    if (mouseover.equipSword) {
        player.color = "#FF000090";
        player.subColor = "#E60000";
        player.img = document.getElementById("sword-icon2");
    }
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
let slimes = [];
function makeSlime() {
    let slime = { // width and height are 70
        x: Math.random() * GAME_WIDTH*2 - GAME_WIDTH/2,
        y: Math.random() * GAME_HEIGHT*2 - GAME_HEIGHT/2,
        img: document.getElementById("slime-png"),
        index: 0,
        encountered: false,
        defeated: false,
    }
    
    let distSlime = Math.hypot(player.x-slime.x+35, player.y-slime.y+35);
    let allDistances = [distSlime];
    for (let createdSlime of slimes) {
        allDistances.push(Math.hypot(slime.x-createdSlime.x, slime.y-createdSlime.y));
    }
    
    let validPosition = false;
    while (!validPosition) {
        validPosition = true;
        for (let i = 0; i < allDistances.length; i++) {
            if (allDistances[i] < 400) {
                validPosition = false;
                slime.x = Math.random() * GAME_WIDTH*2 - GAME_WIDTH/2;
                slime.y = Math.random() * GAME_HEIGHT*2 - GAME_HEIGHT/2;
                break;
            }
        }
    }
    slime.nextSprite = Date.now();
    return slime;
}
for (let i = 0; i < 5; i++) slimes.push(makeSlime());

console.log("slime array and screen dimensions");
function draw() {
    now = Date.now();
    detectHover();
    
    // Background #RRGGBBAA
    ctx.fillStyle = "#C8C8C8";
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    
    // Movement
    keyboardMovement();
    if (player.x < 100) { player.x = Math.max(player.x, 100); mapX += player.speed; }
    if (player.x > GAME_WIDTH-100) { player.x = Math.min(player.x, GAME_WIDTH-100); mapX -= player.speed; }
    if (player.y < 100) { player.y = Math.max(player.y, 100); mapY += player.speed; }
    if (player.y > GAME_HEIGHT-100) { player.y = Math.min(player.y, GAME_HEIGHT-100); mapY -= player.speed; }

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
    ctx.fillRect(1150+mapX, GAME_HEIGHT/2-50+mapY, 100, 100);
    ctx.drawImage(document.getElementById("sword-icon"), 1150+mapX, GAME_HEIGHT/2-50+mapY, 100, 100);
    ctx.strokeRect(1150+mapX, GAME_HEIGHT/2-50+mapY, 100, 100);
    let distSword = Math.hypot(player.x - (1150+50+mapX), player.y - (GAME_HEIGHT/2+mapY));
    if (distSword < 150) {
        ctx.lineWidth = 1.25;
        if (mouseover.equipSword) ctx.fillStyle = "#FF000025";
        ctx.fillRect(1150-5+mapX, GAME_HEIGHT/2+60+mapY, 110, 20);
        ctx.strokeRect(1150-5+mapX, GAME_HEIGHT/2+60+mapY, 110, 20);
        
        ctx.fillStyle = "#FF0000";
        ctx.textAlign = "center";
        ctx.font = "bold 15px Verdana";
        ctx.fillText("Equip Sword", 1150+50+mapX, GAME_HEIGHT/2+75+mapY);
    }

    // Slime (Sprite Sheet Dimensions: Width - 800 | Height - 100)
    for (let slime of slimes) {
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(slime.img, 35 + 100 * slime.index, 35, 30, 30, slime.x+mapX, slime.y+mapY, 70, 70);
        if (now-slime.nextSprite > 200) { slime.index++; slime.nextSprite = Date.now(); }
        if (slime.index > 7) slime.index = 0;
        ctx.strokeStyle = "#00FF00";
        circle(slime.x+35, slime.y+35, 100-player.r-1.5, "stroke");
    
        // Encountering
        let distSlime = Math.hypot(player.x - 235+mapX, player.y - 235+mapY);
        if (distSlime < 100) {
            slime.encountered = true;
            ctx.drawRect(slime.x+25, slime.y-120, 20, 80);
            circle(slime.x+35, slime.y-20, 10);
        }
    }

    // Player
    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.subColor;
    ctx.lineWidth = 3;
    circle(player.x, player.y, player.r, "fill");
    circle(player.x, player.y, player.r, "stroke");
    let corner = player.r*Math.sin(45);
    if (player.img != "none") ctx.drawImage(player.img, player.x-17.5, player.y-16, 35, 35);

    // Border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, cnv.width-10, cnv.height-10);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(5, 5, cnv.width-10, cnv.height-10);

    // Animate
    requestAnimationFrame(draw);
}

draw();

