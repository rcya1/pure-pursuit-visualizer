const widthScaling = 0.9;
const heightScaling = 0.6;

let canvas;
let testSlider;

function styleCanvas() {
    canvas.style('display', 'block');
    canvas.style('margin', '10px');
    let x = (windowWidth - width) / 2;
    canvas.position(x);
}

function setup() {
    canvas = createCanvas(windowWidth * widthScaling, windowHeight * heightScaling);
    styleCanvas();

    testSlider = select('#test-slider');
}

function draw() {
    background(255);
    rectMode(CENTER);
    rect(width / 2, height / 2, testSlider.value() / 100.0 * width, testSlider.value() / 100.0 * height);
}

function windowResized() {
    resizeCanvas(windowWidth * widthScaling, windowHeight * heightScaling);
    styleCanvas();
}
