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
    x: GAME_WIDTH*0.5, y: GAME_HEIGHT*0.5, r: 15, speed: GAME_WIDTH/275, baseSpeed: GAME_WIDTH/275, color: "#FFFFFF", subColor: "#E6E6E6", img: "none", inBattle: false,
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
        player.color = "#FF0000CC";
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

// Game related functions
let slimes = [];
function makeSlime() {
    let slime = { // width and height are 70
        x: Math.random() * GAME_WIDTH*2 - GAME_WIDTH/2 + mapX,
        y: Math.random() * GAME_HEIGHT*2 - GAME_HEIGHT/2 + mapY,
        img: document.getElementById("slime-png"),
        index: 0,
        encountered: false,
        defeated: false,
    }

    function checkSlimeDistances() {
        let distSlime = Math.hypot(player.x - slime.x+35+mapX, player.y - slime.y+35+mapY); // player
        let slimeDistances = [distSlime];
        for (let createdSlime of slimes) {
            slimeDistances.push(Math.hypot(slime.x - createdSlime.x, slime.y - createdSlime.y)); // other slimes
        }
        slimeDistances.push(Math.hypot(slime.x+35 - 1150+50, slime.y+35 - GAME_HEIGHT/2)); // sword statue
        return slimeDistances;
    }
    let distances = checkSlimeDistances();
    
    let validPosition = false;
    while (!validPosition) {
        validPosition = true;
        for (let i = 0; i < distances.length; i++) {
            if (distances[i] < GAME_WIDTH*0.5) {
                validPosition = false;
                slime.x = Math.random() * GAME_WIDTH*2 - GAME_WIDTH/2 + mapX;
                slime.y = Math.random() * GAME_HEIGHT*2 - GAME_HEIGHT/2 + mapY;
                distances = checkSlimeDistances();
                break;
            }
        }
    }
    slime.nextSprite = Date.now();
    return slime;
}
for (let i = 0; i < 5; i++) slimes.push(makeSlime());

let encounterColor = "#FF000000";
let loopingEncounterColor = false;
let encColorCD = 0;
let nextEncColor = 1;
function loopEncounterColor() {
    let encounterColors = ["#FF000000", "#FF000033", "#FF000066", "#FF000099", "#FF0000CC", "#FF0000FF"];
    if (now - encColorCD > 250) {
        for (let i = 0; i < encounterColors.length; i++) {
            if (encounterColor === encounterColors[i]) encounterColor = encounterColors[i+nextEncColor];
            if (encounterColor === "#FF0000FF") nextEncColor *= -1;
            if (encounterColor === "#FF000000") { nextEncColor *= -1; loopingEncounterColor = false;}
        }
        encColorCD = Date.now();
    }
}

console.log("250ms encColorCD");
function draw() {
    now = Date.now();
    detectHover();
    
    // Background #RRGGBBAA
    ctx.fillStyle = "#C8C8C8";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    ctx.fillStyle = "#999999";
    ctx.font = "10px Verdana";
    ctx.textAlign = "left";
    ctx.fillText(`Map XY: ${Math.round(-mapX)}, ${Math.round(-mapY)}`, 15, 30);
    ctx.fillText(`Player XY: ${Math.round(player.x - mapX)}, ${Math.round(player.y - mapY)}`, 15, 50);
    
    // Movement
    keyboardMovement();
    let mapLimit;
    if (player.inBattle) mapLimit = 0;
    else mapLimit = 200;
        
    if (player.x < mapLimit) { player.x = Math.max(player.x, mapLimit); mapX += player.speed; }
    if (player.x > GAME_WIDTH-mapLimit) { player.x = Math.min(player.x, GAME_WIDTH-mapLimit); mapX -= player.speed; }
    if (player.y < mapLimit) { player.y = Math.max(player.y, mapLimit); mapY += player.speed; }
    if (player.y > GAME_HEIGHT-mapLimit) { player.y = Math.min(player.y, GAME_HEIGHT-mapLimit); mapY -= player.speed; }
    if (player.inBattle) {
        let angleToCenter = Math.atan2(player.y - GAME_HEIGHT/2, player.x - GAME_WIDTH/2);
        let distToCenter = Math.hypot(player.x - GAME_WIDTH/2, player.y - GAME_HEIGHT/2);
        
        if (distToCenter+player.r+1.5+1.375 > GAME_HEIGHT*0.48) {
            player.x = GAME_HEIGHT*0.48 * Math.cos(angleToCenter) + GAME_WIDTH/2 - (player.r+1.5+1.375) * Math.cos(angleToCenter);
            player.y = GAME_HEIGHT*0.48 * Math.sin(angleToCenter) + GAME_HEIGHT/2 - (player.r+1.5+1.375) * Math.sin(angleToCenter);
        }
    }

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
        ctx.drawImage(slime.img, 34.5 + 100 * slime.index, 35, 30, 30, slime.x+mapX, slime.y+mapY, 70, 70);
        if (now-slime.nextSprite > 200) { slime.index++; slime.nextSprite = Date.now(); }
        if (slime.index > 7) slime.index = 0;
        ctx.strokeStyle = "#00FF00";
        if (!slime.encountered) circle(slime.x+35+mapX, slime.y+35+mapY, GAME_WIDTH*0.0652-player.r-1.5, "stroke");
    
        // Encountering
        let distSlime = Math.hypot(player.x - (slime.x+35+mapX), player.y - (slime.y+35+mapY));
        if (distSlime < GAME_WIDTH*0.0652 && !player.inBattle) {
            player.inBattle = true;
            slime.encountered = true;
            loopingEncounterColor = true;
            encColorCD = Date.now();
            let addx = GAME_WIDTH/2 - (slime.x+35+mapX);
            let addy = GAME_HEIGHT/2 - (slime.y+35+mapY);
            mapX += addx;
            mapY += addy;
            player.x += addx;
            player.y += addy;
        }
        if (slime.encountered) {
            ctx.strokeStyle = "#00FF00";
            circle(slime.x+35+mapX, slime.y+35+mapY, GAME_HEIGHT*0.48, "stroke");
            if (loopingEncounterColor) {
                ctx.fillStyle = encounterColor;
                ctx.fillRect(slime.x+32.5+mapX, slime.y-25+mapY, 5, 20);
                circle(slime.x+35+mapX, slime.y+5+mapY, 2.75);
            }
        }
    }

    if (loopingEncounterColor) loopEncounterColor();

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

