var p5 = require('./p5.min');
var conv = require('./conversions.js');
var path_gen = require('./path_gen');
var dom_util = require('./dom_util');
var follower_util = require('./follower_util');
var debug = require('./debug');
var Vector = require("./vector");
var Waypoint = require("./waypoint");
var Robot = require("./robot");
var MouseState = {
    DEFAULT: 'default',
    DRAGGING: 'dragging'
};
var currentSketch = new p5(function (sketch) {
    var widthScaling = 0.9;
    var canvas; // purely for stylizing purposes
    var canvasHolder;
    var robot;
    var keys = [];
    var keyCodes = [];
    var lastOrientation;
    // DOM elements
    var followPathButton;
    var robotSizeSlider;
    var userWaypointSizeSlider;
    var deletePointsCheckbox;
    var deleteAllPointsButton;
    var resetRobotButton;
    var injectSpacingSlider;
    var injectPointsButton;
    var smoothWeightSlider;
    var smoothPointsButton;
    var autoInjectCheckbox;
    var autoSmoothCheckbox;
    var showUserCheckbox;
    var showInjectedCheckbox;
    var showSmoothedCheckbox;
    var showLACircleCheckbox;
    var showLAPointCheckbox;
    var maxVelocitySlider;
    var maxAccelerationSlider;
    var lookaheadSlider;
    var turningConstantSlider;
    // debug
    var exportDataButton;
    var importDataButton;
    var userPoints = [];
    var injectedPoints = [];
    var smoothedPoints = [];
    var mouseState = MouseState.DEFAULT;
    var mouseClickVector = null;
    var activePoint = -1;
    var needAutoInject = true;
    var needAutoSmooth = true;
    var follower;
    // mobile
    var lingeringMouse = false;
    var lenientDragging = false;
    sketch.setup = function () {
        canvas = sketch.createCanvas(sketch.windowWidth * widthScaling, sketch.windowWidth * widthScaling / 2);
        canvas.mouseOut(mouseOut);
        canvasHolder = sketch.select('#canvas-visualizer');
        styleCanvas();
        robot = new Robot();
        followPathButton = sketch.select('#follow-path-button');
        setUpIconBar();
        setUpPathGeneration();
        setUpVisuals();
        setUpVisuals();
        setUpFollowing();
        resetFollower();
        setUpDebug();
        lastOrientation = sketch.deviceOrientation;
    };
    setUpIconBar = function () {
        deletePointsCheckbox = sketch.select('#delete-points-checkbox');
        deletePointsCheckbox.mousePressed(function () {
            if (deletePointsCheckbox.hasClass("checked"))
                deletePointsCheckbox.removeClass("checked");
            else
                deletePointsCheckbox.addClass("checked");
        });
        deleteAllPointsButton = sketch.select('#delete-all-points-button');
        deleteAllPointsButton.mousePressed(function () {
            if (confirm("Are you sure you would like to remove all points?"))
                deleteAllPoints();
        });
        resetRobotButton = sketch.select("#reset-robot-button");
        resetRobotButton.mousePressed(function () {
            moveRobotToStart();
        });
    };
    setUpPathGeneration = function () {
        // Inject Points
        injectSpacingSlider = new dom_util.Slider('#inject-spacing-slider', 1.5, 10, 5, 0.1, sketch);
        injectSpacingSlider.setCallback(function () {
            needAutoInject = true;
            needAutoSmooth = true;
        });
        injectPointsButton = sketch.select('#inject-points-button');
        injectPointsButton.mousePressed(injectPoints);
        autoInjectCheckbox = sketch.select('#auto-inject-checkbox');
        // Smooth Points
        smoothWeightSlider = new dom_util.Slider('#smooth-weight-slider', 0.00, 0.99, 0.75, 0.01, sketch);
        smoothWeightSlider.setCallback(function () {
            needAutoSmooth = true;
        });
        smoothPointsButton = sketch.select('#smooth-points-button');
        smoothPointsButton.mousePressed(smoothPoints);
        autoSmoothCheckbox = sketch.select('#auto-smooth-checkbox');
    };
    setUpVisuals = function () {
        robotSizeSlider = new dom_util.Slider('#robot-size-slider', 1, 20, 5, 0.1, sketch);
        userWaypointSizeSlider = new dom_util.Slider('#user-waypoint-size-slider', 1, 3, 1.7, 0.1, sketch);
        showUserCheckbox = sketch.select('#show-user-checkbox');
        showInjectedCheckbox = sketch.select('#show-injected-checkbox');
        showSmoothedCheckbox = sketch.select('#show-smoothed-checkbox');
        showLACircleCheckbox = sketch.select('#show-lookahead-circle-checkbox');
        showLAPointCheckbox = sketch.select('#show-lookahead-point-checkbox');
    };
    setUpFollowing = function () {
        maxVelocitySlider = new dom_util.Slider('#max-velocity-slider', 10, 100, 50, 1, sketch);
        maxVelocitySlider.setCallback(function () {
            smoothPoints();
        });
        maxAccelerationSlider = new dom_util.Slider('#max-acceleration-slider', 10, 100, 75, 1, sketch);
        maxAccelerationSlider.setCallback(function () {
            follower.maxAcceleration = maxAccelerationSlider.getValue();
        });
        lookaheadSlider = new dom_util.Slider('#lookahead-slider', 5, 40, 15, 1, sketch);
        lookaheadSlider.setCallback(function () {
            follower.lookaheadDist = lookaheadSlider.getValue();
        });
        turningConstantSlider = new dom_util.Slider('#turning-constant-slider', 0.5, 2.0, 1.5, 0.1, sketch);
        turningConstantSlider.setCallback(function () {
            smoothPoints();
        });
    };
    setUpDebug = function () {
        exportDataButton = sketch.select('#export-data-button');
        exportDataButton.mousePressed(function () {
            console.log(debug.getString(injectSpacingSlider.getValue(), smoothWeightSlider.getValue(), maxVelocitySlider.getValue(), maxAccelerationSlider.getValue(), lookaheadSlider.getValue(), turningConstantSlider.getValue(), userPoints, robot.getPosition()));
        });
        importDataButton = sketch.select('#import-data-button');
        importDataButton.mousePressed(function () {
            var dataString = prompt("Enter JSON Data", "");
            var obj = JSON.parse(dataString);
            injectSpacingSlider.setValue(obj.injectSpacing);
            smoothWeightSlider.setValue(obj.smoothWeight);
            maxVelocitySlider.setValue(obj.maxVel);
            maxAccelerationSlider.setValue(obj.maxAcc);
            lookaheadSlider.setValue(obj.laDist);
            turningConstantSlider.setValue(obj.turnConst);
            deleteAllPoints();
            for (pointIndex in obj.userPoints) {
                var point = new Waypoint(new Vector(obj.userPoints[pointIndex].position.x, obj.userPoints[pointIndex].position.y));
                userPoints.push(point);
            }
            needAutoInject = true;
            needAutoSmooth = true;
            robot.setPosition(new Vector(obj.robotPos.x, obj.robotPos.y));
        });
    };
    sketch.draw = function () {
        update();
        display();
    };
    update = function () {
        if (followPathButton.hasClass('active')) {
            follower_util.followPath(robot, follower, smoothedPoints, sketch.millis(), sketch);
        }
        robot.update(sketch.frameRate(), robotSizeSlider.getValue());
        if (!lingeringMouse)
            calculateActivePoint();
        if (mouseState == MouseState.DRAGGING) {
            if (activePoint != -1 && mouseClickVector != null) {
                // ensure that the translation of the active point is only moved relative to the last mouse location
                // this way, when you drag it off-center it doesn't jump 
                userPoints[activePoint].setX(userPoints[activePoint].getX() +
                    conv.cx(sketch.mouseX, sketch.width) - mouseClickVector.getX());
                userPoints[activePoint].setY(userPoints[activePoint].getY() +
                    conv.cy(sketch.mouseY, sketch.height) - mouseClickVector.getY());
                mouseClickVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
            }
            else
                mouseState = MouseState.DEFAULT;
        }
        // handle updating the icon
        if (deletePointsCheckbox.hasClass("checked")) {
            if (deletePointsCheckbox.hasClass("fa-plus")) {
                deletePointsCheckbox.removeClass("fa-plus");
                deletePointsCheckbox.addClass("fa-trash-alt");
            }
        }
        else {
            if (deletePointsCheckbox.hasClass("fa-trash-alt")) {
                deletePointsCheckbox.removeClass("fa-trash-alt");
                deletePointsCheckbox.addClass("fa-plus");
            }
        }
        // handle updating the cursor sprite
        if (deletePointsCheckbox.hasClass("checked")) {
            sketch.cursor('not-allowed');
        }
        else if (activePoint != -1) {
            sketch.cursor('grab');
        }
        else {
            sketch.cursor('default');
        }
        if (mouseState == MouseState.DRAGGING) {
            needAutoInject = true;
            needAutoSmooth = true;
        }
        // handle auto injecting points
        if (autoInjectCheckbox.elt.checked) {
            if (needAutoInject) {
                injectPoints();
            }
            injectPointsButton.elt.disabled = true;
        }
        else {
            injectPointsButton.elt.disabled = false;
        }
        // handle auto smoothing points
        if (autoSmoothCheckbox.elt.checked) {
            if (needAutoSmooth) {
                smoothPoints();
            }
            smoothPointsButton.elt.disabled = true;
        }
        else {
            smoothPointsButton.elt.disabled = false;
        }
        // handle device orientation switches
        if (sketch.deviceOrientation != lastOrientation)
            styleCanvas();
        lastOrientation = sketch.deviceOrientation;
    };
    display = function () {
        sketch.background(220);
        sketch.rectMode(sketch.CENTER);
        // draw all injected points
        if (showInjectedCheckbox.elt.checked) {
            for (var _i = 0, injectedPoints_1 = injectedPoints; _i < injectedPoints_1.length; _i++) {
                point = injectedPoints_1[_i];
                point.draw(sketch, userWaypointSizeSlider.getValue() / 3.0, false, 150);
            }
        }
        // draw all smoothed points
        if (showSmoothedCheckbox.elt.checked) {
            for (var _a = 0, smoothedPoints_1 = smoothedPoints; _a < smoothedPoints_1.length; _a++) {
                point = smoothedPoints_1[_a];
                point.draw(sketch, userWaypointSizeSlider.getValue() / 1.5, false, 100);
            }
        }
        // draw all of the user points
        if (showUserCheckbox.elt.checked) {
            for (pointIndex in userPoints) {
                userPoints[pointIndex].draw(sketch, userWaypointSizeSlider.getValue(), pointIndex == activePoint, 0);
            }
        }
        robot.draw(sketch, robotSizeSlider.getValue());
        // debug.drawDebugLine(follower.debug_a, follower.debug_b, follower.debug_c, sketch);
        if (showLAPointCheckbox.elt.checked)
            debug.drawDebugPoint(follower.debug_la_x, follower.debug_la_y, sketch);
        if (showLACircleCheckbox.elt.checked)
            debug.drawDebugCircle(robot.getX(), robot.getY(), lookaheadSlider.getValue(), sketch);
    };
    sketch.windowResized = function () {
        styleCanvas();
    };
    // center the canvas on the screen horizontally and scale it
    function styleCanvas() {
        var holderWidthString = canvasHolder.style('width');
        var holderWidth = parseInt(holderWidthString.substring(0, holderWidthString.length - 2));
        sketch.resizeCanvas(holderWidth * widthScaling, holderWidth * widthScaling / 2.0);
        canvasHolder.style('display', 'flex');
        canvasHolder.style('justify-content', 'center');
        canvasHolder.style('flex-direction', 'row-reverse');
        canvas.style('border', '1px solid #707070a0');
        canvas.parent('canvas-visualizer');
    }
    sketch.mousePressed = function () {
        calculateActivePoint();
        // ensure the mouse is within the sketch window doing anything
        if (mouseInSketch()) {
            if (deletePointsCheckbox.hasClass("checked")) {
                // delete the current point
                if (activePoint != -1) {
                    userPoints.splice(activePoint, 1);
                }
                needAutoInject = true;
                needAutoSmooth = true;
            }
            else {
                // add a point or drag the currently selected point
                mouseClickVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
                if (activePoint == -1) {
                    var wp = new Waypoint(mouseClickVector.copy());
                    userPoints.push(wp);
                    activePoint = userPoints.length - 1;
                }
                mouseState = MouseState.DRAGGING;
                // move the robot to the first point
                if (activePoint == 0) {
                    moveRobotToStart();
                }
                // angle the robot to the second point
                if (activePoint == 1) {
                    moveRobotToStart();
                    angleRobot();
                }
            }
        }
    };
    sketch.mouseReleased = function () {
        mouseState = MouseState.DEFAULT;
        if (activePoint != -1) {
            // clamp the dropped position to inside the sketch
            userPoints[activePoint].setX(Math.min(200, userPoints[activePoint].getX()));
            userPoints[activePoint].setX(Math.max(0, userPoints[activePoint].getX()));
            userPoints[activePoint].setY(Math.min(100, userPoints[activePoint].getY()));
            userPoints[activePoint].setY(Math.max(0, userPoints[activePoint].getY()));
            needAutoInject = true;
            needAutoSmooth = true;
            activePoint = -1;
        }
    };
    sketch.mouseDragged = function () {
        // move the robot to the first point
        if (activePoint == 0) {
            moveRobotToStart();
        }
        // angle the robot to the second point
        if (activePoint == 1) {
            moveRobotToStart();
            angleRobot();
        }
    };
    // calculate the closest point to the cursor to determine which one to grab
    calculateActivePoint = function () {
        if (mouseState != MouseState.DRAGGING) {
            var closestDist = userWaypointSizeSlider.getValue() * userWaypointSizeSlider.getValue();
            if (lenientDragging)
                closestDist *= 4; // make the radius twice as large if on mobile
            activePoint = -1;
            mouseVector = new Vector(conv.cx(sketch.mouseX, sketch.width), conv.cy(sketch.mouseY, sketch.height));
            for (pointIndex in userPoints) {
                dist = userPoints[pointIndex].getDistanceToSq(mouseVector);
                if (dist < closestDist) {
                    activePoint = pointIndex;
                    closestDist = dist;
                }
            }
        }
    };
    resetFollower = function () {
        follower = new follower_util.PurePursuitFollower(lookaheadSlider.getValue(), robotSizeSlider.getValue(), maxAccelerationSlider.getValue());
    };
    deleteAllPoints = function () {
        userPoints = [];
        injectedPoints = [];
        smoothedPoints = [];
        resetFollower();
    };
    injectPoints = function () {
        path_gen.injectPoints(userPoints, injectedPoints, injectSpacingSlider.getValue());
        needAutoInject = false;
        needAutoSmooth = true;
        resetFollower();
    };
    smoothPoints = function () {
        path_gen.smoothPoints(injectedPoints, smoothedPoints, smoothWeightSlider.getValue());
        path_gen.calculateTargetVelocities(smoothedPoints, maxVelocitySlider.getValue(), maxAccelerationSlider.getValue(), turningConstantSlider.getValue());
        needAutoSmooth = false;
        resetFollower();
    };
    moveRobotToStart = function () {
        robot.setPosition(userPoints[0].getPosition());
        if (userPoints.length > 1) {
            angleRobot();
        }
        resetFollower();
    };
    angleRobot = function () {
        robot.setAngle(Math.atan2(userPoints[1].getPosition().getY() - userPoints[0].getPosition().getY(), userPoints[1].getPosition().getX() - userPoints[0].getPosition().getX()));
    };
    mouseOut = function () {
    };
    mouseInSketch = function () {
        return sketch.mouseX >= 0 && sketch.mouseX <= sketch.width &&
            sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;
    };
    sketch.touchStarted = function () {
        lingeringMouse = false;
        lenientDragging = true;
        sketch.mousePressed();
    };
    sketch.touchMoved = function () {
        if (mouseInSketch()) {
            return false;
        }
        sketch.mouseDragged();
    };
    sketch.touchEnded = function () {
        lingeringMouse = true;
        lenientDragging = false;
        sketch.mouseReleased();
    };
    sketch.keyPressed = function () {
        keyCodes.push(sketch.keyCode);
        keys.push(sketch.key);
        if (sketch.keyCode == sketch.SHIFT) {
            if (!deletePointsCheckbox.hasClass("checked"))
                deletePointsCheckbox.addClass("checked");
        }
    };
    sketch.keyReleased = function () {
        keyCodes.splice(keyCodes.indexOf(sketch.keyCode), 1);
        keys.splice(keys.indexOf(sketch.key), 1);
        if (sketch.keyCode == sketch.SHIFT) {
            if (deletePointsCheckbox.hasClass("checked"))
                deletePointsCheckbox.removeClass("checked");
        }
    };
});
