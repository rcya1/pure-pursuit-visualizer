import * as p5 from 'p5';
import '../scss/main.scss';
import { cx, cy, SCREEN_HEIGHT, SCREEN_WIDTH} from './conversions'
import * as path_gen from './path_gen'
import * as follower_util from './follower_util'
import { Slider } from './dom_util'
import * as debug from './debug'
import { Robot } from './robot'
import { Vector } from './vector'
import { Waypoint } from './waypoint'

enum MouseState {
    DEFAULT,
    DRAGGING
}

const s = (sketch: p5): void => {

    const widthScaling: number = 0.9;

    let canvas: p5.Renderer;
    let canvasHolder: p5.Element;

    let robot: Robot;

    let keys: string[]  = [];
    let keyCodes: number[] = [];

    let lastOrientation: string;
    
    // DOM elements
    let followPathButton: p5.Element;

    let robotSizeSlider: Slider;
    let userWaypointSizeSlider: Slider;

    let deletePointsCheckbox: p5.Element;
    let deleteAllPointsButton: p5.Element;
    let resetRobotButton: p5.Element;

    let injectSpacingSlider: Slider;
    let injectPointsButton: p5.Element;

    let smoothWeightSlider: Slider;
    let smoothPointsButton: p5.Element;
    
    let autoInjectCheckbox: p5.Element;
    let autoSmoothCheckbox: p5.Element;

    let showUserCheckbox: p5.Element;
    let showInjectedCheckbox: p5.Element;
    let showSmoothedCheckbox: p5.Element;
    let showLACircleCheckbox: p5.Element;
    let showLAPointCheckbox: p5.Element;

    let maxVelocitySlider: Slider;
    let maxAccelerationSlider: Slider;
    let lookaheadSlider: Slider;
    let turningConstantSlider: Slider;

	// debug
	let exportDataButton: p5.Element;
	let importDataButton: p5.Element;

    let userPoints: Waypoint[] = [];
    let injectedPoints: Waypoint[] = [];
    let smoothedPoints: Waypoint[] = [];
    let mouseState: MouseState = MouseState.DEFAULT;
    let mouseClickVector: Vector = null;
    let activePoint: number = -1;

    let needAutoInject: boolean = true;
    let needAutoSmooth: boolean = true;

    let follower: follower_util.PurePursuitFollower;
    
    // mobile
    let lingeringMouse: boolean = false;
    let lenientDragging: boolean = false;

    sketch.setup = function(): void {
        let a: Vector = new Vector(3, 4);
        a.printInfoVerbose();

        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        canvasHolder = sketch.select('#canvas-visualizer');
        styleCanvas();

        robot = new Robot();

        followPathButton = sketch.select('#follow-path-button');

        setUpIconBar();
        setUpPathGeneration();
        setUpVisuals();
        setUpFollowing();
        resetFollower();
        setUpDebug();

        lastOrientation = sketch.deviceOrientation;
    }

    let setUpIconBar = function(): void {
        deletePointsCheckbox = sketch.select('#delete-points-checkbox');
        deletePointsCheckbox.mousePressed(function(): void {
            if(deletePointsCheckbox.hasClass("checked")) {
                deletePointsCheckbox.removeClass("checked");
            }
            else {
                deletePointsCheckbox.addClass("checked");
            }
        });

        deleteAllPointsButton = sketch.select('#delete-all-points-button');
        deleteAllPointsButton.mousePressed(function(): void {
            if(confirm("Are you sure you would like to remove all points?")) {
                deleteAllPoints();
            }
        });

        resetRobotButton = sketch.select("#reset-robot-button");
        resetRobotButton.mousePressed(function(): void {
            moveRobotToStart();
        });
    }

    let setUpPathGeneration = function(): void {
        // Inject Points
        injectSpacingSlider = new Slider('#inject-spacing-slider', 1.5, 10, 5, 0.1, sketch);
        injectSpacingSlider.setCallback(function() {
            needAutoInject = true;
            needAutoSmooth = true;
        });
        injectPointsButton = sketch.select('#inject-points-button');
        injectPointsButton.mousePressed(injectPoints);
        autoInjectCheckbox = sketch.select('#auto-inject-checkbox');

        // Smooth Points
        smoothWeightSlider = new Slider('#smooth-weight-slider', 0.00, 0.99, 0.75, 0.01, sketch);
        smoothWeightSlider.setCallback(function() {
            needAutoSmooth = true;
        });
        smoothPointsButton = sketch.select('#smooth-points-button');
        smoothPointsButton.mousePressed(smoothPoints);
        autoSmoothCheckbox = sketch.select('#auto-smooth-checkbox');
    }

    let setUpVisuals = function(): void {
        robotSizeSlider = new Slider('#robot-size-slider', 1, 20, 5, 0.1, sketch);
        userWaypointSizeSlider = new Slider('#user-waypoint-size-slider', 1, 3, 1.7, 0.1, sketch);
        
        showUserCheckbox = sketch.select('#show-user-checkbox');
        showInjectedCheckbox = sketch.select('#show-injected-checkbox');
        showSmoothedCheckbox = sketch.select('#show-smoothed-checkbox');
        showLACircleCheckbox = sketch.select('#show-lookahead-circle-checkbox');
        showLAPointCheckbox = sketch.select('#show-lookahead-point-checkbox');
    }
    
    let setUpFollowing = function(): void {
        maxVelocitySlider = new Slider('#max-velocity-slider', 10, 100, 50, 1, sketch);
        maxVelocitySlider.setCallback(function() {
            smoothPoints();
        });
        maxAccelerationSlider = new Slider('#max-acceleration-slider', 10, 100, 75, 1, sketch);
        maxAccelerationSlider.setCallback(function() {
            follower.maxAcceleration = maxAccelerationSlider.getValue();
        });
        lookaheadSlider = new Slider('#lookahead-slider', 5, 40, 15, 1, sketch);
        lookaheadSlider.setCallback(function() {
            follower.lookaheadDist = lookaheadSlider.getValue();
        });
        turningConstantSlider = new Slider('#turning-constant-slider', 0.5, 2.0, 1.5, 0.1, sketch);
        turningConstantSlider.setCallback(function() {
            smoothPoints();
        });
    }

    let setUpDebug = function(): void {
		exportDataButton = sketch.select('#export-data-button');
		exportDataButton.mousePressed(function() {
			console.log(debug.getString(
				injectSpacingSlider.getValue(),
				smoothWeightSlider.getValue(),
				maxVelocitySlider.getValue(),
				maxAccelerationSlider.getValue(),
				lookaheadSlider.getValue(),
				turningConstantSlider.getValue(),
				userPoints,
				robot.pos
            ));
        });

		importDataButton = sketch.select('#import-data-button');
		importDataButton.mousePressed(function() {
			let dataString = prompt("Enter JSON Data", "");
			let obj = JSON.parse(dataString);

			injectSpacingSlider.setValue(obj.injectSpacing);
			smoothWeightSlider.setValue(obj.smoothWeight);
			maxVelocitySlider.setValue(obj.maxVel);
			maxAccelerationSlider.setValue(obj.maxAcc);
			lookaheadSlider.setValue(obj.laDist);
			turningConstantSlider.setValue(obj.turnConst);
		
			deleteAllPoints();
			for(let pointIndex = 0; pointIndex < obj.userPoints.length(); pointIndex++) {
				let point: Waypoint = new Waypoint(new Vector(obj.userPoints[pointIndex].position.x, obj.userPoints[pointIndex].position.y));
				userPoints.push(point);
			}
			needAutoInject = true;
			needAutoSmooth = true;
			
			robot.pos = new Vector(obj.robotPos.x, obj.robotPos.y);
		});
    }

    sketch.draw = function(): void {
        update();
        display();
    }

    let update = function(): void {
        if(followPathButton.hasClass('active')) {
            follower_util.followPath(robot, follower, smoothedPoints, sketch.millis());
        }

        robot.update(sketch.frameRate(), robotSizeSlider.getValue());

        if(!lingeringMouse) calculateActivePoint();

        if(mouseState == MouseState.DRAGGING) {
            if(activePoint != -1 && mouseClickVector != null) {
                // ensure that the translation of the active point is only moved relative to the last mouse location
                // this way, when you drag it off-center it doesn't jump 
                userPoints[activePoint].x = userPoints[activePoint].x + 
                    cx(sketch.mouseX, sketch.width) - mouseClickVector.x;
                userPoints[activePoint].y = userPoints[activePoint].y + 
                    cy(sketch.mouseY, sketch.height) - mouseClickVector.y;
                mouseClickVector = new Vector(cx(sketch.mouseX, sketch.width), cy(sketch.mouseY, sketch.height));
            }
            else mouseState = MouseState.DEFAULT;
        }

        // handle updating the icon
        if(deletePointsCheckbox.hasClass("checked")) {
            if(deletePointsCheckbox.hasClass("fa-plus")) {
                deletePointsCheckbox.removeClass("fa-plus");
                deletePointsCheckbox.addClass("fa-trash-alt");
            }
        }
        else {
            if(deletePointsCheckbox.hasClass("fa-trash-alt")) {
                deletePointsCheckbox.removeClass("fa-trash-alt");
                deletePointsCheckbox.addClass("fa-plus");
            }
        }

        // handle updating the cursor sprite
        if(deletePointsCheckbox.hasClass("checked")) {
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

        // handle auto injecting points
        if(autoInjectCheckbox.elt.checked) {
            if(needAutoInject) {
                injectPoints();
            }
            injectPointsButton.elt.disabled = true;
        }
        else {
            injectPointsButton.elt.disabled = false;
        }

        // handle auto smoothing points
        if(autoSmoothCheckbox.elt.checked) {
            if(needAutoSmooth) {
                smoothPoints();
            }
            smoothPointsButton.elt.disabled = true;
        }
        else {
            smoothPointsButton.elt.disabled = false;
        }

        // handle device orientation switches
        if(sketch.deviceOrientation != lastOrientation) styleCanvas();
        lastOrientation = sketch.deviceOrientation; 
    }

    let display = function(): void {
        sketch.background(220);
        sketch.rectMode(sketch.CENTER);
        
        // draw all injected points
        if(showInjectedCheckbox.elt.checked) {
            for(let point of injectedPoints) {
                point.draw(sketch, userWaypointSizeSlider.getValue() / 3.0, false, 150);
            }
        }
        // draw all smoothed points
        if(showSmoothedCheckbox.elt.checked) {
            for(let point of smoothedPoints) {
                point.draw(sketch, userWaypointSizeSlider.getValue() / 1.5, false, 100);
            }
        }
        // draw all of the user points
        if(showUserCheckbox.elt.checked) {
            for(let pointIndex = 0; pointIndex < userPoints.length; pointIndex++) {
                userPoints[pointIndex].draw(sketch, userWaypointSizeSlider.getValue(), pointIndex == activePoint, 0);
            }
        }

        robot.draw(sketch, robotSizeSlider.getValue());

        // debug.drawDebugLine(follower.debug_a, follower.debug_b, follower.debug_c, sketch);
        if(showLAPointCheckbox.elt.checked) debug.drawDebugPoint(follower.debug_la_x, follower.debug_la_y, sketch);
        if(showLACircleCheckbox.elt.checked) debug.drawDebugCircle(robot.pos.x, robot.pos.y, lookaheadSlider.getValue(), sketch);
    }

    sketch.windowResized = function(): void {
        styleCanvas();
    }

    let styleCanvas = function() {
        let holderWidthString: string  = canvasHolder.style('width');
        let holderWidth: number = parseInt(holderWidthString.substring(0, holderWidthString.length - 2));
        sketch.resizeCanvas(holderWidth * widthScaling, holderWidth * widthScaling * SCREEN_HEIGHT / SCREEN_WIDTH);
        
        canvasHolder.style('display', 'flex');
        canvasHolder.style('justify-content', 'center');
        canvasHolder.style('flex-direction', 'row-reverse');
        canvas.style('border', '1px solid #707070a0');
        
        canvas.parent('canvas-visualizer');
    }

    sketch.mousePressed = function(): void {
        calculateActivePoint();

        // ensure the mouse is within the sketch window doing anything
        if(mouseInSketch()) {

            if(deletePointsCheckbox.hasClass("checked")) {
                // delete the current point
                if(activePoint != -1) {
                    userPoints.splice(activePoint, 1);
                }
                needAutoInject = true;
                needAutoSmooth = true;
            }
            else {
                // add a point or drag the currently selected point
                mouseClickVector = new Vector(cx(sketch.mouseX, sketch.width), cy(sketch.mouseY, sketch.height));

                if(activePoint == -1) {
                    let wp: Waypoint = new Waypoint(mouseClickVector);
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
                    moveRobotToStart();
                    angleRobot();
                }
            }
        }
    }

    sketch.mouseDragged = function(): void {
        // move the robot to the first point
        if(activePoint == 0) {
            moveRobotToStart();
        }
        // angle the robot to the second point
        if(activePoint == 1) {
            moveRobotToStart();
            angleRobot();
        }
    }

    sketch.mouseReleased = function(): void {
        mouseState = MouseState.DEFAULT;

        if(activePoint != -1) {
            // clamp the dropped position to inside the sketch
            userPoints[activePoint].x = Math.min(SCREEN_WIDTH, userPoints[activePoint].x);
            userPoints[activePoint].x = Math.max(0, userPoints[activePoint].x);
            userPoints[activePoint].y = Math.min(SCREEN_HEIGHT, userPoints[activePoint].y);
            userPoints[activePoint].y = Math.max(0, userPoints[activePoint].y);

            needAutoInject = true;
            needAutoSmooth = true;

            activePoint = -1;
        }
    }

    sketch.touchStarted = function(): void {
        lingeringMouse = false;
        lenientDragging = true;
        sketch.mousePressed();
    }

    sketch.touchMoved = function(): boolean {
        if(mouseInSketch()) {
            return false;
        }
        sketch.mouseDragged();
    }

    sketch.touchEnded = function(): void {
        lingeringMouse = true;
        lenientDragging = false;
        sketch.mouseReleased();
    }

    sketch.keyPressed = function(): void {
        keyCodes.push(sketch.keyCode);
        keys.push(sketch.key);

        if(sketch.keyCode == sketch.SHIFT) {
            if(!deletePointsCheckbox.hasClass("checked")) 
                deletePointsCheckbox.addClass("checked");
        }
    }

    sketch.keyReleased = function(): void {
        keyCodes.splice(keyCodes.indexOf(sketch.keyCode), 1);
        keys.splice(keys.indexOf(sketch.key), 1);

        if(sketch.keyCode == sketch.SHIFT) {
            if(deletePointsCheckbox.hasClass("checked")) 
                deletePointsCheckbox.removeClass("checked");
        }
    }

    // calculate the closest point to the cursor to determine which one to grab
    let calculateActivePoint = function(): void {
        if(mouseState != MouseState.DRAGGING) {
            let closestDist: number = userWaypointSizeSlider.getValue() * userWaypointSizeSlider.getValue();
            if(lenientDragging) closestDist *= 4; // make the radius twice as large if on mobile

            activePoint = -1;
            let mouseVector: Vector = new Vector(cx(sketch.mouseX, sketch.width), cy(sketch.mouseY, sketch.height));
            for(let pointIndex = 0; pointIndex < userPoints.length; pointIndex++) {
                let dist: number = userPoints[pointIndex].getDistanceToSq(mouseVector);
                if(dist < closestDist) {
                    activePoint = pointIndex;
                    closestDist = dist;
                }
            }
        }
    }

    let resetFollower = function(): void {
        follower = new follower_util.PurePursuitFollower(lookaheadSlider.getValue(), robotSizeSlider.getValue(), 
            maxAccelerationSlider.getValue());
    }

    let deleteAllPoints = function(): void {
        userPoints = [];
        injectedPoints = [];
        smoothedPoints = [];
        resetFollower();
    }

    let injectPoints = function(): void {
        path_gen.injectPoints(userPoints, injectedPoints, injectSpacingSlider.getValue());
        needAutoInject = false;
        needAutoSmooth = true;
        resetFollower();
    }   

    let smoothPoints = function(): void {
        path_gen.smoothPoints(injectedPoints, smoothedPoints, smoothWeightSlider.getValue());
        path_gen.calculateTargetVelocities(smoothedPoints, maxVelocitySlider.getValue(), maxAccelerationSlider.getValue(), 
            turningConstantSlider.getValue());
        needAutoSmooth = false;
        resetFollower();
    }

    let moveRobotToStart = function(): void {
        robot.pos = userPoints[0];
        if(userPoints.length > 1) {
            angleRobot();
        }
        resetFollower();
    }

    let angleRobot = function(): void {
        robot.angle = Math.atan2(userPoints[1].y - userPoints[0].y,
            userPoints[1].x - userPoints[0].x);
    }

    let mouseInSketch = function(): boolean {
        return sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && 
            sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;
    }
};

new p5(s);
