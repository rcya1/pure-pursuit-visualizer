const p5 = require('./p5.min');
const conv = require('./conversions.js');
const path_gen = require("./path_gen");
const dom_util = require('./dom_util');
const Vector = require("./vector");
const Waypoint = require("./waypoint");
const Robot = require("./robot");

const MouseState = {
    DEFAULT: 'default',
    DRAGGING: 'dragging'
}

// TODO Add keyboard shortcuts
// TODO Fix smooth slider starting at 0

var currentSketch = new p5(function(sketch) {
    
    const widthScaling = 0.75;

    let canvas; // purely for stylizing purposes
    let canvasHolder;

    let robot;

    let keys = [];
    let keyCodes = [];

    let lastOrientation;
    
    // DOM elements
    let robotSizeSlider;
    let userWaypointSizeSlider;

    let deletePointsCheckbox;
    let deleteAllPointsButton;

    let injectSpacingSlider;
    let injectPointsButton;

    let smoothWeightSlider;
    let smoothPointsButton;
    
    let autoInjectCheckbox;
    let autoSmoothCheckbox;

    let showUserCheckbox;
    let showInjectedCheckbox;
    let showSmoothedCheckbox;

    let userPoints = [];
    let injectedPoints = [];
    let smoothedPoints = [];
    let mouseState = MouseState.DEFAULT;
    let mouseClickVector = null;
    let activePoint = -1;

    let needAutoInject = true;
    let needAutoSmooth = true;
    
    // mobile
    let lingeringMouse = false;
    let lenientDragging = false;
    
    sketch.setup = function() {
        canvas = sketch.createCanvas(sketch.windowWidth * widthScaling, sketch.windowWidth * widthScaling / 2);
        canvas.mouseOut(mouseOut);
        canvasHolder = sketch.select('#canvas-visualizer');
        styleCanvas();

        robot = new Robot();

        // Top Configuration Box
        robotSizeSlider = new dom_util.Slider('#robot-size-slider', 20, 70, 40, 1, sketch);
        userWaypointSizeSlider = new dom_util.Slider('#user-waypoint-size-slider', 1, 3, 1.7, 0.1, sketch);

        // Path Configuration
        deletePointsCheckbox = sketch.select('#delete-points-checkbox');
        deleteAllPointsButton = sketch.select('#delete-all-points-button');
        deleteAllPointsButton.mousePressed(deleteAllPoints);

        // Inject Points
        injectSpacingSlider = new dom_util.Slider('#inject-spacing-slider', 1.5, 10, 5, 0.1, sketch);
        injectSpacingSlider.setCallback(function() {
            needAutoInject = true;
            needAutoSmooth = true;
        });
        injectPointsButton = sketch.select('#inject-points-button');
        injectPointsButton.mousePressed(injectPoints);
        autoInjectCheckbox = sketch.select('#auto-inject-checkbox');

        // Smooth Points
        smoothWeightSlider = new dom_util.Slider('#smooth-weight-slider', 0.00, 0.99, 0.75, 0.01, sketch);
        smoothWeightSlider.setCallback(function() {
            needAutoSmooth = true;
        });
        smoothPointsButton = sketch.select('#smooth-points-button');
        smoothPointsButton.mousePressed(smoothPoints);
        autoSmoothCheckbox = sketch.select('#auto-smooth-checkbox');

        // Visibility
        showUserCheckbox = sketch.select('#show-user-checkbox');
        showInjectedCheckbox = sketch.select('#show-injected-checkbox');
        showSmoothedCheckbox = sketch.select('#show-smoothed-checkbox');

        lastOrientation = sketch.deviceOrientation;
    }

    deleteAllPoints = function() {
        userPoints = [];
        injectedPoints = [];
        smoothedPoints = [];
    }

    injectPoints = function() {
        path_gen.injectPoints(userPoints, injectedPoints, injectSpacingSlider.getValue());
        needAutoInject = false;
    }   

    smoothPoints = function() {
        path_gen.smoothPoints(injectedPoints, smoothedPoints, smoothWeightSlider.getValue());
        needAutoSmooth = false;
    }
    
    sketch.draw = function() {
        update();
        display();
    }

    update = function() {
        robot.update(sketch.frameRate(), robotSizeSlider.getValue());

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
            else mouseState = MouseState.DEFAULT;
        }

        if(deletePointsCheckbox.elt.checked) {
            sketch.cursor('not-allowed');
        }
        else if(activePoint != -1) {
            sketch.cursor('grab');
        }
        else {
            sketch.cursor('default');
        }

        if(mouseState == MouseState.DRAGGING) {
            needAutoInject = true;
            needAutoSmooth = true;
        }

        if(autoInjectCheckbox.elt.checked) {
            if(needAutoInject) {
                injectPoints();
            }
            injectPointsButton.elt.disabled = true;
        }
        if(needAutoSmooth && autoSmoothCheckbox.elt.checked) {
            if(needAutoSmooth) {
                smoothPoints();
            }
            smoothPointsButton.elt.disabled = true;
        }

        if(sketch.deviceOrientation != lastOrientation) styleCanvas();
        lastOrientation = sketch.deviceOrientation; 
    }

    // calculate the closest point to the cursor to determine which one to grab
    calculateActivePoint = function() {
        if(mouseState != MouseState.DRAGGING) {
            let closestDist = userWaypointSizeSlider.getValue() * userWaypointSizeSlider.getValue();
            if(lenientDragging) closestDist *= 4;
            activePoint = -1;
            mouseVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
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
        
        // draw all injected points
        if(showInjectedCheckbox.elt.checked) {
            for(point of injectedPoints) {
                point.draw(sketch, userWaypointSizeSlider.getValue() / 3.0, false, 150);
            }
        }
        // draw all smoothed points
        if(showSmoothedCheckbox.elt.checked) {
            for(point of smoothedPoints) {
                point.draw(sketch, userWaypointSizeSlider.getValue() / 1.5, false, 100);
            }
        }
        // draw all of the user points
        if(showUserCheckbox.elt.checked) {
            for(pointIndex in userPoints) {
                userPoints[pointIndex].draw(sketch, userWaypointSizeSlider.getValue(), pointIndex == activePoint, 0);
            }
        }

        robot.draw(sketch, robotSizeSlider.getValue());
    }
    
    sketch.windowResized = function() {
        styleCanvas();
    }

    // center the canvas on the screen horizontally and scale it
    function styleCanvas() {
        sketch.resizeCanvas(sketch.windowWidth * widthScaling, sketch.windowWidth * widthScaling / 2.0);
        let x = (sketch.windowWidth - sketch.width) / 2;
        let y = 0;
        canvas.position(x);

        canvasHolder.style('width', sketch.width + 'px');
        canvasHolder.style('height', sketch.height + 'px');
        canvasHolder.style('display', 'block');
        canvasHolder.style('margin', '10px');
        
        canvas.parent('canvas-visualizer');
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
                needAutoInject = true;
                needAutoSmooth = true;

                if(userPoints.length > 0) {
                    moveRobotToStart();
                    if(userPoints.length > 1) {
                        angleRobot();
                    }
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

                // move the robot to the first point
                if(activePoint == 0) {
                    moveRobotToStart();
                }
                // angle the robot to the second point
                if(activePoint == 1) {
                    angleRobot();
                }
            }
        }
    }

    sketch.mouseReleased = function() {
        mouseState = MouseState.DEFAULT;

        if(activePoint != -1) {
            // clamp the dropped position to inside the sketch
            userPoints[activePoint].setX(Math.min(200, userPoints[activePoint].getX()));
            userPoints[activePoint].setX(Math.max(0, userPoints[activePoint].getX()));
            userPoints[activePoint].setY(Math.min(100, userPoints[activePoint].getY()));
            userPoints[activePoint].setY(Math.max(0, userPoints[activePoint].getY()));

            needAutoInject = true;
            needAutoSmooth = true;

            activePoint = -1;
        }
    }

    sketch.mouseDragged = function() {
        // move the robot to the first point
        if(activePoint == 0) {
            moveRobotToStart();
            if(userPoints.length > 1) {
                angleRobot();
            }
        }
        // angle the robot to the second point
        if(activePoint == 1) {
            angleRobot();
        }
    }

    moveRobotToStart = function() {
        robot.setPos(userPoints[0].getPosition());
    }

    angleRobot = function() {
        robot.setAngle(Math.atan2(userPoints[1].getPosition().getY() - userPoints[0].getPosition().getY(),
            userPoints[1].getPosition().getX() - userPoints[0].getPosition().getX()));
    }

    mouseOut = function() {
        
    }

    mouseInSketch = function() {
        return sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && 
            sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;
    }

    sketch.touchStarted = function() {
        lingeringMouse = false;
        lenientDragging = true;
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
        lenientDragging = false;
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
})
