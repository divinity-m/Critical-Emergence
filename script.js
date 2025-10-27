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
    type: "player",
    x: GAME_WIDTH*0.5, y: GAME_HEIGHT*0.5, r: 15,
    speed: GAME_WIDTH/275, baseSpeed: GAME_WIDTH/275,
    color: "#FFFFFFCC", subColor: "#E6E6E6",
    maxHealth: 100, maxShield: 0, maxMana: 250,
    health: 100, shield: 0, mana: 250,
    weapon: "fist", img: document.getElementById("fist-icon"), inBattle: false,
    equipFist: function () { this.color = "#FFFFFFCC"; this.subColor = "#E6E6E6"; this.weapon = "fist"; this.img = document.getElementById("fist-icon"); },
    equipSword: function() { this.color = "#FF0000CC"; this.subColor = "#E60000"; this.weapon = "sword"; this.img = document.getElementById("sword-icon2"); },
    spawnedAttacks: [], newAttackCd: 0, spawnAttack: function () {
        let randDistance, randAngle, attack, distAtk;
        do {
            randDistance = Math.random() * GAME_HEIGHT*0.48 - 50 - 1.375 - 1;
            randAngle = Math.random() * (Math.PI*2);
            attack = { x: randDistance * Math.cos(randAngle) + GAME_WIDTH/2, y: randDistance * Math.sin(randAngle) + GAME_HEIGHT/2, despawn: Date.now(),};
            distAtk = Math.hypot(attack.x - player.x, attack.y - player.y);
        }
        while (distAtk <= 150 + player.r+1.5+50+1)
        
        if (this.weapon === "fist") { [attack.damage, attack.name, attack.color] = [20, "punch", "#FFFFFF"]; }
        if (this.weapon === "sword") { [attack.damage, attack.name, attack.color] = [30, "slash", "#FF0000"]; }
        
        return attack;
    },
}
let now = Date.now();
let mapY = 0, mapX = 0;
let dash = {
    activated: false, accel: 1, lastEnded: 0, color: "#FFFFFFCC", subColor: "#E6E6E6",
    use: function() {  
        player.speed += this.accel;
        player.color = `${this.subColor}CC`;
        player.subColor = this.color;
        if (player.speed >= player.baseSpeed*3 && this.accel === 1) this.accel = -1;
        if (this.accel === -1 && player.speed <= player.baseSpeed) {
            player.speed = player.baseSpeed;    
            player.color = this.color;
            player.subColor = this.subColor;
            this.activated = false;
            this.accel = 1;
            this.lastEnded = Date.now();
        }
    },
};

// Mouse
let mouseX = 0, mouseY = 0, mouseMovementOn = false, track;
let mouseover = { equipSword: false, }

document.addEventListener('mousemove', mousemoveEventListener);
document.addEventListener('click', clickEventListener);
document.addEventListener("auxclick", (e) => {
    if (e.button === 1) {
        e.preventDefault();
        if (mouseMovementOn) mouseMovementOn = false;
        else mouseMovementOn = true;
    }
});

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
        if (player.weapon != "sword") player.equipSword();
        else player.equipFist();
    }
}
function mouseMovement(mapLimit) {
    if (!kbMovementOn && mouseMovementOn) {
        let dx = mouseX - player.x, dy = mouseY - player.y;
        let dist = Math.hypot(dx, dy);
        let slowFactor = Math.sqrt(Math.min(100, dist)) / 10;
        let speed = player.speed * shiftPressed * slowFactor;
        if (dist > 0.25) {
            player.x += dx/dist * speed;
            player.y += dy/dist * speed;
        }
        
        if (player.x < mapLimit || player.x > GAME_WIDTH-mapLimit) mapX -= dx/dist * speed;
        if (player.y < mapLimit || player.y > GAME_HEIGHT-mapLimit) mapY -= dy/dist * speed;
    }
}

// Keyboard
document.addEventListener('keydown', keydownEventListener);
document.addEventListener('keyup', keyupEventListener);
let moveUp = false, moveDown = false, moveLeft = false, moveRight = false, kbMovementOn = false, shiftPressed = 1;
function keydownEventListener(e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveUp = true;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = true;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveDown = true;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = true;
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") shiftPressed = 0.5;
    if (e.code === "KeyQ" && now - dash.lastEnded > 1500 && !dash.activated) [dash.activated, dash.color, dash.subColor] = [true, player.color, player.subColor];
}
function keyupEventListener(e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") moveUp = false;
    if (e.code === "KeyA" || e.code === "ArrowLeft") moveLeft = false;
    if (e.code === "KeyS" || e.code === "ArrowDown") moveDown = false;
    if (e.code === "KeyD" || e.code === "ArrowRight") moveRight = false;
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") shiftPressed = 1;
}
function keyboardMovement(mapLimit) {
    let xKb = 0; yKb = 0;
    
    if (moveRight) xKb += 1;
    if (moveLeft) xKb -= 1;
    if (moveDown) yKb += 1;
    if (moveUp) yKb -= 1;

    if (xKb != 0 && yKb != 0) {
        xKb *= Math.SQRT1_2;
        yKb *= Math.SQRT1_2;
    }
    if (xKb === 0 && yKb === 0) kbMovementOn = false;
    else kbMovementOn = true;

    let speed = player.speed * shiftPressed;
    player.x += xKb * speed;
    player.y += yKb * speed;

    if (player.x < mapLimit || player.x > GAME_WIDTH-mapLimit) mapX -= xKb * speed;
    if (player.y < mapLimit || player.y > GAME_HEIGHT-mapLimit) mapY -= yKb * speed;
}

// Quick Draw functions
function circle(x, y, r, type) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, 0);
    if (type === "stroke") ctx.stroke();
    else ctx.fill();
}
function roundRect(x, y, w, h, r, type) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (type === "stroke") ctx.stroke();
    else ctx.fill();
}
function drawStatBar(entity, x, y, w, h, lW, font, fill, stroke, stat) {
    if (stat === "SHIELD" && entity.shield <= 0) return;

    const realStat = stat.toLowerCase();
    const maxStat = "max" + stat[0] + stat.substring(1).toLowerCase();
        
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lW;
    roundRect(x, y, entity[realStat]/entity[maxStat] * w, h, 1000, "fill");
    roundRect(x, y, w, h, 1000, "stroke");

    
    ctx.font = `bold ${font}px Verdana`;
    ctx.textAlign = "center";
    ctx.fillStyle = stroke;
    if (stat != "HEALTH" || (stat === "HEALTH" && entity.shield <= 0)) {
        if (entity.type != "player") stat = `ENEMY ${stat}`;
        ctx.fillText(`${stat}: ${entity[realStat]}/${entity[maxStat]}`, x + w*0.5, y+h*0.7);
    }
}

// Game related functions
let enemies = [];
let encEnemy;
function makeSlime() {
    let slime = { // width and height are 70
        type: "slime",
        x: Math.random() * GAME_WIDTH*2 - GAME_WIDTH/2 + mapX,
        y: Math.random() * GAME_HEIGHT*2 - GAME_HEIGHT/2 + mapY,
        img: document.getElementById("slime-png"), sprite: 0,
        encountered: false, defeated: false,
        maxHealth: Math.round(Math.random() * 50 + 100), maxShield: 0, shield: 0,
    }
    slime.health = slime.maxHealth;

    function checkSlimeDistances() {
        let distSlime = Math.hypot(player.x - slime.x+35+mapX, player.y - slime.y+35+mapY); // player
        let slimeDistances = [distSlime];
        for (let enemy of enemies) {
            if (enemy.type === "slime") slimeDistances.push(Math.hypot(slime.x - enemy.x, slime.y - enemy.y)); // other slimes
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
for (let i = 0; i < 5; i++) enemies.push(makeSlime());

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

function enemyEncountered(enemy, w, distance, encounterDistance) {
    if (distance < encounterDistance && !player.inBattle) {
        player.inBattle = true;
        player.newAttackCd = now - 4000;
        enemy.encountered = true;
        loopingEncounterColor = true;
        encColorCD = Date.now();
        const addX = GAME_WIDTH/2 - (enemy.x+w+mapX);
        const addY = GAME_HEIGHT/2 - (enemy.y+w+mapY);
        [mapX, mapY, player.x, player.y] = [mapX+addX, mapY+addY, player.x+addX, player.y+addY];
    }
}

function drawEnemyBorderAndStats(enemy, w, borderColor) {
    if (enemy.encountered) {
        // Border Circle
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2.75;
        circle(enemy.x+w+mapX, enemy.y+w+mapY, GAME_HEIGHT*0.48, "stroke");
        if (loopingEncounterColor) {
            // Exclamation Mark
            ctx.fillStyle = encounterColor;
            ctx.fillRect(enemy.x+w-2.5+mapX, enemy.y-25+mapY, 5, 20);
            circle(enemy.x+w+mapX, enemy.y+5+mapY, 2.75);
            loopEncounterColor();
        }

        // Health and Shield Bar
        const barX = GAME_WIDTH*0.05, barY = GAME_HEIGHT*0.075, barW = GAME_WIDTH*0.25, barH = GAME_HEIGHT*0.035;
        drawStatBar(enemy, barX, barY, barW, barH, 5, GAME_HEIGHT*0.02, "#00DD00", "#00BB00", "HEALTH");
        drawStatBar(enemy, barX, barY, barW, barH, 5, GAME_HEIGHT*0.02, "#DDDD00", "#BBBB00", "SHIELD");
    }
}

console.log("player abilities 2");
function draw() {
    now = Date.now();
    detectHover();
    
    // Background #RRGGBBAA
    ctx.fillStyle = "#00C800";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    ctx.fillStyle = "#000000";
    ctx.font = "10px Verdana";
    ctx.textAlign = "left";
    ctx.fillText(`Map XY: ${Math.round(-mapX)}, ${Math.round(-mapY)}`, 15, 30);
    ctx.fillText(`Player XY: ${Math.round(player.x - mapX)}, ${Math.round(player.y - mapY)}`, 15, 50);
    
    // Movement
    let mapLimit;
    if (player.inBattle) mapLimit = 0;
    else mapLimit = 150;
    keyboardMovement(mapLimit);
    mouseMovement(mapLimit);
    
    player.x = Math.min(Math.max(player.x, mapLimit), GAME_WIDTH-mapLimit);
    player.y = Math.min(Math.max(player.y, mapLimit), GAME_HEIGHT-mapLimit);

    if (player.inBattle) {
        const angleToCenter = Math.atan2(player.y - GAME_HEIGHT/2, player.x - GAME_WIDTH/2);
        const distToCenter = Math.hypot(player.x - GAME_WIDTH/2, player.y - GAME_HEIGHT/2);
        
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
        roundRect(GAME_WIDTH-175, GAME_HEIGHT*0.5-6.25, 150, 12.5, 6.25, "stroke");
        roundRect(GAME_WIDTH-175, GAME_HEIGHT*0.5-6.25, 150-(now-dash.lastEnded)/10, 12.5, 6.25, "fill");

        ctx.fillStyle = "#DFDFDF";
        ctx.font = "15px Verdana";
        ctx.textAlign = "right";
        ctx.fillText("Dash", GAME_WIDTH-185, GAME_HEIGHT*0.5+5);
        ctx.font = "10px Verdana";
        ctx.textAlign = "center";
        ctx.fillText(`${(1.5-(now-dash.lastEnded)/1000).toFixed(2)}s`, GAME_WIDTH-100, GAME_HEIGHT/2+10/3);
    }

    // Sword Statue
    ctx.fillStyle = "#FF000050";
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 2.5;
    ctx.fillRect(1150+mapX, GAME_HEIGHT/2-50+mapY, 100, 100);
    ctx.drawImage(document.getElementById("sword-icon"), 1150+mapX, GAME_HEIGHT/2-50+mapY, 100, 100);
    ctx.strokeRect(1150+mapX, GAME_HEIGHT/2-50+mapY, 100, 100);
    const distSword = Math.hypot(player.x - (1150+50+mapX), player.y - (GAME_HEIGHT/2+mapY));
    if (distSword < 150) {
        ctx.lineWidth = 1.25;
        if (mouseover.equipSword) ctx.fillStyle = "#FF000025";
        ctx.fillRect(1150-5+mapX, GAME_HEIGHT/2+60+mapY, 110, 20);
        ctx.strokeRect(1150-5+mapX, GAME_HEIGHT/2+60+mapY, 110, 20);
        
        ctx.fillStyle = "#FF0000";
        ctx.textAlign = "center";
        ctx.font = "bold 12px Verdana";
        if (player.weapon != "sword") ctx.fillText(`Equip Sword`, 1150+50+mapX, GAME_HEIGHT/2+75+mapY);
        else ctx.fillText(`Unequip Sword`, 1150+50+mapX, GAME_HEIGHT/2+75+mapY);
    }

    // Slime (Sprite Sheet Dimensions: Width - 800 | Height - 100)
    for (let slime of enemies) {
        if (slime.type === "slime") {
            // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            ctx.drawImage(slime.img, 34.5 + 100 * slime.sprite, 35, 30, 30, slime.x+mapX, slime.y+mapY, 70, 70);
            if (now-slime.nextSprite > 200) { slime.sprite++; slime.nextSprite = Date.now(); }
            if (slime.sprite > 7) slime.sprite = 0;
            ctx.strokeStyle = "#00FF00";
            if (!slime.encountered) circle(slime.x+35+mapX, slime.y+35+mapY, GAME_WIDTH*0.0652-player.r-1.5, "stroke");
        }
    }

    // Spawn Abilities During Battle
    if (player.inBattle) {
        if (now - player.newAttackCd > 5000) {
            player.spawnedAttacks.push(player.spawnAttack());
            player.newAttackCd = Date.now();
        }
        let atklen = player.spawnedAttacks.length;
        for (let i = atklen-1; i >= 0; i--) {
            let attack = player.spawnedAttacks[i];
            if (now - attack.despawn > 13000) { player.spawnedAttacks.splice(i, 1); continue; }

            ctx.fillStyle = `${attack.color}BF`;
            circle(attack.x, attack.y, (13000 - (now - attack.despawn)) / 13000 * 50);
            
            ctx.strokeStyle = attack.color;
            ctx.lineWidth = 2;
            circle(attack.x, attack.y, 50, "stroke");

            ctx.fillStyle = attack.color;
            ctx.font = "bold 17.5px Verdana";
            ctx.textAlign = "center";
            ctx.fillText(attack.name.toUpperCase(), attack.x, attack.y+4.5);

            let distAttack = Math.hypot(player.x - attack.x, player.y - attack.y);

            if (distAttack <= player.r+1.5+50+1) {
                if (encEnemy.shield > 0) encEnemy.shield -= attack.damage;
                if (encEnemy.shield < 0) encEnemy.health += encEnemy.shield;
                else if (encEnemy.shield === 0) encEnemy.health -= attack.damage;

                encEnemy.shield = Math.max(0, encEnemy.shield);
                encEnemy.health = Math.max(0, encEnemy.health);

                player.spawnedAttacks.splice(i, 1);
            }
        }
    }

    // Player
    ctx.fillStyle = player.color;
    ctx.strokeStyle = player.subColor;
    ctx.lineWidth = 3;
    circle(player.x, player.y, player.r, "fill");
    circle(player.x, player.y, player.r, "stroke");
    ctx.drawImage(player.img, player.x-17.5, player.y-16, 35, 35);

    // Enemy Encountering, Border, and Health/Shield
    for (let enemy of enemies) {
        if (enemy.type === "slime") {
            enemyEncountered(enemy, 35, Math.hypot(player.x - (enemy.x+35+mapX), player.y - (enemy.y+35+mapY)), GAME_WIDTH*0.0652);
            drawEnemyBorderAndStats(enemy, 35, "#00FF00");
        }
        if (enemy.encountered) encEnemy = enemy;
    }

    // Player Bars
    const barY = GAME_HEIGHT*0.925, barW = GAME_WIDTH*0.2, barH = GAME_HEIGHT*0.03;
    let [barX1, barX2] = [GAME_WIDTH*0.33-barW*0.5, GAME_WIDTH*0.66-barW*0.5];
    if (player.inBattle) [barX1, barX2] = [GAME_WIDTH*0.25-barW*0.5, GAME_WIDTH*0.75-barW*0.5];
    
    drawStatBar(player, barX1, barY, barW, barH, 3, GAME_HEIGHT*0.0175, "#00DD00", "#00BB00", "HEALTH"); // Health Bar
    drawStatBar(player, barX1, barY, barW, barH, 3, GAME_HEIGHT*0.0175, "#DDDD00", "#BBBB00", "SHIELD"); // Shield Bar
    drawStatBar(player, barX2, barY, barW, barH, 3, GAME_HEIGHT*0.0175, "#0033FF", "#0000BB", "MANA"); // Mana Bar

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

