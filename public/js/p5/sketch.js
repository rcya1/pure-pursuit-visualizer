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

    let keys = [];
    let keyCodes = [];

    let lastOrientation;
    
    let userWaypointSizeSlider;
    let deletePointsCheckbox;
    let deleteAllPointsButton;

    let userPoints = [];
    let mouseState = MouseState.DEFAULT;
    let mouseClickVector = null;
    let activePoint = -1;
    let lingeringMouse = false;
    
    sketch.setup = function() {
        canvas = sketch.createCanvas(sketch.windowWidth * widthScaling, sketch.windowHeight * heightScaling);
        canvas.mouseOut(mouseOut);
        styleCanvas();
    
        userWaypointSizeSlider = sketch.select('#user-waypoint-size-slider');
        deletePointsCheckbox = sketch.select('#delete-points-checkbox');
        deleteAllPointsButton = sketch.select('#delete-all-points-button');
        deleteAllPointsButton.mousePressed(deleteAllPoints);

        lastOrientation = sketch.deviceOrientation;
    }

    deleteAllPoints = function() {
        userPoints = [];
    }
    
    sketch.draw = function() {
        update();
        display();
    }

    update = function() {
        if(!lingeringMouse) calculateActivePoint();

        if(mouseState == MouseState.DRAGGING) {
            if(activePoint != -1 && mouseClickVector != null) {
                // ensure that the translation of the active point is only moved relative to the last mouse location
                // this way, when you drag it off-center it doesn't jump 
                userPoints[activePoint].setX(userPoints[activePoint].getX() + 
                    conv.cx(sketch.mouseX, sketch.width) - mouseClickVector.getX());
                userPoints[activePoint].setY(userPoints[activePoint].getY() + 
                    conv.cy(sketch.mouseY, sketch.height) - mouseClickVector.getY());
                mouseClickVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
            }
            else mouseState = MouseStates.DEFAULT;
        }

        if(sketch.deviceOrientation != lastOrientation) styleCanvas();
        lastOrientation = sketch.deviceOrientation; 
    }

    calculateActivePoint = function() {
        if(mouseState != MouseState.DRAGGING) {
            let closestDist = userWaypointSizeSlider.value() * userWaypointSizeSlider.value();
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
    }

    display = function() {
        sketch.background(200);
        sketch.rectMode(sketch.CENTER);
        
        // draw all of the points
        for(pointIndex in userPoints) {
            userPoints[pointIndex].draw(sketch, userWaypointSizeSlider.value(), pointIndex == activePoint);
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
        calculateActivePoint();

        // ensure the mouse is within the sketch window doing anything
        if(mouseInSketch()) {

            if(deletePointsCheckbox.elt.checked) {
                // delete the current point
                if(activePoint != -1) {
                    userPoints.splice(activePoint, 1);
                }
            }
            else {
                // add a point or drag the currently selected point
                mouseClickVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
                if(activePoint == -1) {
                    let wp = new Waypoint(mouseClickVector.copy());
                    userPoints.push(wp);
                    activePoint = userPoints.length - 1;
                }

                mouseState = MouseState.DRAGGING;
            }
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

    sketch.mouseDragged = function() {
        
    }

    mouseOut = function() {
        
    }

    sketch.touchStarted = function() {
        lingeringMouse = false;
        sketch.mousePressed();
    }

    sketch.touchMoved = function() {
        if(mouseInSketch()) {
            return false;
        }
        sketch.mouseDragged();
    }

    sketch.touchEnded = function() {
        lingeringMouse = true;
        sketch.mouseReleased();
    }

    sketch.keyPressed = function() {
        keyCodes.push(sketch.keyCode);
        keys.push(sketch.key);

        if(sketch.keyCode == sketch.SHIFT) {
            deletePointsCheckbox.elt.checked = true;
        }
    }

    sketch.keyReleased = function() {
        keyCodes.splice(keyCodes.indexOf(sketch.keyCode), 1);
        keys.splice(keys.indexOf(sketch.key), 1);

        if(sketch.keyCode == sketch.SHIFT) {
            deletePointsCheckbox.elt.checked = false;
        }
    }

    mouseInSketch = function() {
        return sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && 
            sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;
    }
})
