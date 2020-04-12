const p5 = require('./p5.min');
const conv = require('./conversions.js');
const Vector = require("./vector");

const MouseState = {
    DEFAULT: 'default',
    DRAGGING: 'dragging'
}

var currentSketch = new p5(function(sketch) {
    
    const widthScaling = 0.9;
    const heightScaling = 0.6;

    let canvas; // purely for stylizing purposes
    let testSlider;
    let userPoints = [];
    let mouseState = MouseState.DEFAULT;
    let activePoint = -1;
    
    sketch.setup = function() {
        canvas = sketch.createCanvas(sketch.windowWidth * widthScaling, sketch.windowHeight * heightScaling);
        canvas.mouseOut(mouseOut);
        styleCanvas();
    
        testSlider = sketch.select('#test-slider');
    }
    
    sketch.draw = function() {
        update();
        display();
    }

    update = function() {
        if(mouseState != MouseState.DRAGGING) {
            let closestDist = 2 * 2;
            activePoint = -1;
            mouseVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cx(sketch.mouseY, sketch.height));
            for(pointIndex in userPoints) {
                dist = mouseVector.sub(userPoints[pointIndex]).getMagSq();
                if(dist < closestDist) {
                    activePoint = pointIndex;
                    closestDist = dist;
                }
            }
        }

        if(mouseState == MouseState.DRAGGING) {
            if(activePoint != -1) {
                userPoints[activePoint].setX(conv.cx(sketch.mouseX, sketch.width));
                userPoints[activePoint].setY(conv.cy(sketch.mouseY, sketch.height));
            }
            else mouseState = MouseStates.DEFAULT;
        }

        // TODO extrapolate the code into a waypoint class
    }

    display = function() {
        sketch.background(200);
        sketch.rectMode(sketch.CENTER);

        sketch.fill(255);
        sketch.rect(sketch.width / 2, sketch.height / 2, 
            testSlider.value() / 100.0 * sketch.width, testSlider.value() / 100.0 * sketch.height);
        
        for(point of userPoints) {
            sketch.fill(0);
            sketch.ellipse(conv.px(point.getX(), sketch.width), conv.py(point.getY(), sketch.height),
                conv.px(2, sketch.width), conv.px(2, sketch.width));
        }
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

    sketch.mousePressed = function() {
        if(sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && 
            sketch.mouseY >= 0 && sketch.mouseY <= sketch.height) {

            if(activePoint == -1) {
                let v = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cx(sketch.mouseY, sketch.height));
                userPoints.push(v);
                activePoint = userPoints.length - 1;
            }
            mouseState = MouseState.DRAGGING;
        }
    }

    sketch.mouseReleased = function() {
        mouseState = MouseState.DEFAULT;
        // TODO add safety against people dropping things out of bounds
        activePoint = -1;
    }

    mouseOut = function() {
        
    }
})
