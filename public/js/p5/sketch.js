const p5 = require('./p5.min');
const conv = require('./conversions.js');
const Vector = require("./vector");
const Waypoint = require("./waypoint");

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
    let mouseClickVector = null;
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
            let closestDist = 1.5 * 1.5;
            activePoint = -1;
            mouseVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cx(sketch.mouseY, sketch.height));
            for(pointIndex in userPoints) {
                dist = userPoints[pointIndex].getDistanceToSq(mouseVector);
                if(dist < closestDist) {
                    activePoint = pointIndex;
                    closestDist = dist;
                }
            }
        }

        if(mouseState == MouseState.DRAGGING) {
            if(activePoint != -1 && mouseClickVector != null) {
                userPoints[activePoint].setX(userPoints[activePoint].getX() + 
                    conv.cx(sketch.mouseX, sketch.width) - mouseClickVector.getX());
                userPoints[activePoint].setY(userPoints[activePoint].getY() + 
                    conv.cy(sketch.mouseY, sketch.height) - mouseClickVector.getY());
                mouseClickVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
            }
            else mouseState = MouseStates.DEFAULT;
        }
    }

    display = function() {
        sketch.background(200);
        sketch.rectMode(sketch.CENTER);

        sketch.fill(255);
        sketch.rect(sketch.width / 2, sketch.height / 2, 
            testSlider.value() / 100.0 * sketch.width, testSlider.value() / 100.0 * sketch.height);
        
        for(pointIndex in userPoints) {
            userPoints[pointIndex].draw(sketch, pointIndex == activePoint);
        }
    }
    
    sketch.windowResized = function() {
        sketch.resizeCanvas(sketch.windowWidth * widthScaling, sketch.windowHeight * heightScaling);
        styleCanvas();
    }

    // center the canvas on the screen horizontally
    function styleCanvas() {
        canvas.style('display', 'block');
        canvas.style('margin', '10px');
        let x = (sketch.windowWidth - sketch.width) / 2;
        canvas.position(x);
    }

    sketch.mousePressed = function() {
        if(sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && 
            sketch.mouseY >= 0 && sketch.mouseY <= sketch.height) {

            mouseClickVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
            if(activePoint == -1) {
                let wp = new Waypoint(mouseClickVector.copy());
                userPoints.push(wp);
                activePoint = userPoints.length - 1;
            }

            mouseState = MouseState.DRAGGING;
        }
    }

    sketch.mouseReleased = function() {
        mouseState = MouseState.DEFAULT;

        if(activePoint != -1) {
            // clamp the dropped position to inside the sketch
            userPoints[activePoint].setX(Math.min(100, userPoints[activePoint].getX()));
            userPoints[activePoint].setX(Math.max(0, userPoints[activePoint].getX()));
            userPoints[activePoint].setY(Math.min(100, userPoints[activePoint].getY()));
            userPoints[activePoint].setY(Math.max(0, userPoints[activePoint].getY()));

            activePoint = -1;
        }
    }

    mouseOut = function() {
        
    }
})
