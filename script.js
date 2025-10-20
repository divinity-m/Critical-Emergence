// SCRIPT.JS
const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');

function resizeCnv() {
    cnv.width = window.innerWidth;
    cnv.height = window.innerHeight;
}
resizeCnv();
window.addEventListener('resize', resizeCnv);

let angle = 0;
function draw() {
    // Background
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // Ball moving in a circle to lowky flex my animation skills lol
    ctx.save();
    ctx.translate(cnv.width/2, cnv.height/2);
    ctx.rotate(angle);
    angle += Math.PI / 20;
    ctx.beginPath();
    ctx.arc(10*Math.cos(Math.PI/4), 10*Math.sin(Math.PI/4), 5, Math.PI*2, 0);
    ctx.fill();
    ctx.restore();

    if (angle >= Math.PI*2) angle = 0;
    
    requestAnimationFrame(draw);
}
draw()
