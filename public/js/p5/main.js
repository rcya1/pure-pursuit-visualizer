const p5 = require('./p5.min');
const Vector = require("./vector");

var currentSketch = new p5(function(sketch) {
    
    const widthScaling = 0.9;
    const heightScaling = 0.6;

    let canvas; // purely for stylizing purposes
    let testSlider;
    
    sketch.setup = function() {
        canvas = sketch.createCanvas(sketch.windowWidth * widthScaling, sketch.windowHeight * heightScaling);
        styleCanvas();
    
        testSlider = sketch.select('#test-slider');
    }
    
    sketch.draw = function() {
        sketch.background(255);
        sketch.rectMode(sketch.CENTER);
        sketch.rect(sketch.width / 2, sketch.height / 2, 
            testSlider.value() / 100.0 * sketch.width, testSlider.value() / 100.0 * sketch.height);
    }
    
    sketch.windowResized = function() {
        sketch.resizeCanvas(sketch.windowWidth * widthScaling, sketch.windowHeight * heightScaling);
        styleCanvas();
    }

    function styleCanvas() {
        canvas.style('display', 'block');
        canvas.style('margin', '10px');
        let x = (sketch.windowWidth - sketch.width) / 2;
        canvas.position(x);
    }
})
