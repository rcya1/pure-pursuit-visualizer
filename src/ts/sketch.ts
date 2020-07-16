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

enum PathGenState {
    SMOOTHING,
    SPLINES
}

// TODO Make it so that the direction vector is a fixed distance away, but when it goes offscrene, you make it go closer to the 
// point
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

    // -- path smoothing options --
    let injectSpacingSlider: Slider;
    let injectPointsButton: p5.Element;

    let smoothWeightSlider: Slider;
    let smoothPointsButton: p5.Element;
    
    let autoInjectCheckbox: p5.Element;
    let autoSmoothCheckbox: p5.Element;
    // --

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
    let startDirectionVector: Vector = null;
    let endDirectionVector: Vector = null;
    let directionTempVector: Vector = null;
    let directionVectorDist: number = 15;
    
    let pathGenState: PathGenState = PathGenState.SPLINES;
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
        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        canvasHolder = sketch.select('#canvas-visualizer');
        styleCanvas();

        robot = new Robot();

        followPathButton = sketch.select('#follow-path-button');

        setUpIconBar();
        setUpPathGenerationSmoothing();
        setUpPathGenerationSplines();
        setUpVisuals();
        setUpFollowing();
        resetFollower();
        setUpDebug();

        lastOrientation = sketch.deviceOrientation;
    }

    let setUpIconBar = function(): void {
        deletePointsCheckbox = sketch.select('#delete-points-checkbox');
        deletePointsCheckbox.mousePressed(function(): void {
            if(deletePointsCheckbox.hasClass('checked')) {
                deletePointsCheckbox.removeClass('checked');
            }
            else {
                deletePointsCheckbox.addClass('checked');
            }
        });

        deleteAllPointsButton = sketch.select('#delete-all-points-button');
        deleteAllPointsButton.mousePressed(function(): void {
            if(confirm('Are you sure you would like to remove all points?')) {
                deleteAllPoints();
            }
        });

        resetRobotButton = sketch.select('#reset-robot-button');
        resetRobotButton.mousePressed(function(): void {
            moveRobotToStart();
        });
    }

    let setUpPathGenerationSmoothing = function(): void {
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

    let setUpPathGenerationSplines = function(): void {
        
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
				robot
            ));
        });

		importDataButton = sketch.select('#import-data-button');
		importDataButton.mousePressed(function() {
			let dataString = prompt('Enter JSON Data', '');
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
			
            robot = new Robot();
            robot.pos.x = obj.robot.pos.x;
            robot.pos.y = obj.robot.pos.y;
            robot.angle = obj.robot.angle;
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
            if(mouseClickVector != null) {
                // ensure that the translation of the active point is only moved relative to the last mouse location
                // this way, when you drag it off-center it doesn't jump 
                if(activePoint >= 0) {
                    userPoints[activePoint].x += cx(sketch.mouseX, sketch.width) - mouseClickVector.x;
                    userPoints[activePoint].y += cy(sketch.mouseY, sketch.height) - mouseClickVector.y;
                    mouseClickVector = new Vector(cx(sketch.mouseX, sketch.width), cy(sketch.mouseY, sketch.height));
                }
                else if(activePoint < -1) {
                    // handle direction vectors
                    // calculate the displacement of the mouse, and constrain the vectors to a fixed distance around the original point
                    let mouseDisplacementX: number = cx(sketch.mouseX, sketch.width) - mouseClickVector.x;
                    let mouseDisplacementY: number = cy(sketch.mouseY, sketch.height) - mouseClickVector.y;

                    let dirVector: Vector = null;
                    let origPoint: Vector = null;
                    if(activePoint == -2) {
                        dirVector = startDirectionVector;
                        origPoint = userPoints[0];
                    }
                    if(activePoint == -3) {
                        dirVector = endDirectionVector;
                        origPoint = userPoints[userPoints.length - 1];
                    }
                    let dragPos: Vector = directionTempVector.add(new Vector(mouseDisplacementX, mouseDisplacementY));
                    let newDirVector: Vector = dragPos.sub(origPoint).normalize().mult(directionVectorDist);
                    dirVector.x = newDirVector.x;
                    dirVector.y = newDirVector.y;
                }

                // shorten the lengths of the direction vectors if they go off screen
                if(startDirectionVector != null) {
                    let currLength: number = directionVectorDist;
                    let normVector: Vector = startDirectionVector.normalize();
                    startDirectionVector = normVector.mult(currLength);
                    while(currLength >= 0 && (startDirectionVector.x >= SCREEN_WIDTH - userPoints[0].x || 
                        startDirectionVector.x <= -userPoints[0].x || 
                        startDirectionVector.y >= SCREEN_HEIGHT - userPoints[0].y || 
                        startDirectionVector.y <= -userPoints[0].y)) {

                        currLength -= 0.25;
                        startDirectionVector = normVector.mult(currLength);
                    }
                }

                if(endDirectionVector != null) {
                    let currLength: number = directionVectorDist;
                    let normVector: Vector = endDirectionVector.normalize();
                    endDirectionVector = normVector.mult(currLength);
                    while(currLength > 1 && (endDirectionVector.x >= SCREEN_WIDTH - userPoints[userPoints.length - 1].x || 
                        endDirectionVector.x <= -userPoints[userPoints.length - 1].x || 
                        endDirectionVector.y >= SCREEN_HEIGHT - userPoints[userPoints.length - 1].y || 
                        endDirectionVector.y <= -userPoints[userPoints.length - 1].y)) {

                        currLength -= 0.25;
                        endDirectionVector = normVector.mult(currLength);
                    }
                }
            }
            else mouseState = MouseState.DEFAULT;
        }

        // handle updating the icon
        if(deletePointsCheckbox.hasClass('checked')) {
            if(deletePointsCheckbox.hasClass('fa-plus')) {
                deletePointsCheckbox.removeClass('fa-plus');
                deletePointsCheckbox.addClass('fa-trash-alt');
            }
        }
        else {
            if(deletePointsCheckbox.hasClass('fa-trash-alt')) {
                deletePointsCheckbox.removeClass('fa-trash-alt');
                deletePointsCheckbox.addClass('fa-plus');
            }
        }

        // handle updating the cursor sprite
        if(deletePointsCheckbox.hasClass('checked') && activePoint != -1) {
            sketch.cursor('not-allowed')
        }
        else if(!deletePointsCheckbox.hasClass('checked') && activePoint != -1) {
            sketch.cursor('grab');
        }
        else {
            sketch.cursor('default');
        }

        if(mouseState == MouseState.DRAGGING) {
            needAutoInject = true;
            needAutoSmooth = true;
        }

        if(pathGenState == PathGenState.SMOOTHING) {
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
        }
        else {
            if(userPoints.length < 2) {
                endDirectionVector = null;
            }
            if(userPoints.length < 1) {
                startDirectionVector = null;
            }

            if(startDirectionVector == null && userPoints.length > 0) {
                startDirectionVector = new Vector(directionVectorDist, 0.0);
            }
            if(endDirectionVector == null && userPoints.length > 1) {
                endDirectionVector = new Vector(directionVectorDist, 0.0);
            }
        }

        // handle device orientation switches
        if(sketch.deviceOrientation != lastOrientation) styleCanvas();
        lastOrientation = sketch.deviceOrientation;

        // handle updating the control options for the path generation
        if(pathGenState == PathGenState.SMOOTHING) {
            sketch.select('#smoothing-elements').style('display', 'block');
            sketch.select('#spline-elements').style('display', 'none');
        }
        else if(pathGenState == PathGenState.SPLINES) {
            sketch.select('#smoothing-elements').style('display', 'none');
            sketch.select('#spline-elements').style('display', 'block');
        }
    }

    let display = function(): void {
        sketch.background(220);
        sketch.rectMode(sketch.CENTER);
        
        if(pathGenState == PathGenState.SMOOTHING) {
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
        }
        else {
            // draw direction vectors
            if(startDirectionVector != null) {
                let startDirection: Waypoint = new Waypoint(userPoints[0].add(startDirectionVector));
                startDirection.drawColor(sketch, userWaypointSizeSlider.getValue() / 1.25, activePoint == -2, 200, 20, 20);
            }
            if(endDirectionVector != null) {
                let endDirection: Waypoint = new Waypoint(userPoints[userPoints.length - 1].add(endDirectionVector));
                endDirection.drawColor(sketch, userWaypointSizeSlider.getValue() / 1.25, activePoint == -3, 200, 20, 20);
            }
        }

        // draw all of the user points
        if(showUserCheckbox.elt.checked) {
            for(let pointIndex = 0; pointIndex < userPoints.length; pointIndex++) {
                if(deletePointsCheckbox.hasClass('checked') && pointIndex == activePoint) {
                    userPoints[pointIndex].drawColor(sketch, userWaypointSizeSlider.getValue(),
                        pointIndex == activePoint, 255, 0, 0);
                }
                else {
                    userPoints[pointIndex].draw(sketch, userWaypointSizeSlider.getValue(), pointIndex == activePoint, 0);
                }
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
            if(deletePointsCheckbox.hasClass('checked')) {
                // delete the current point
                if(activePoint >= 0) {
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
                if(activePoint == -2) {
                    directionTempVector = userPoints[0].add(startDirectionVector);
                }
                if(activePoint == -3) {
                    directionTempVector = userPoints[userPoints.length - 1].add(endDirectionVector);
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

        if(activePoint >= 0) {
            // clamp the dropped position to inside the sketch
            userPoints[activePoint].x = Math.min(SCREEN_WIDTH,  userPoints[activePoint].x);
            userPoints[activePoint].x = Math.max(0,             userPoints[activePoint].x);
            userPoints[activePoint].y = Math.min(SCREEN_HEIGHT, userPoints[activePoint].y);
            userPoints[activePoint].y = Math.max(0,             userPoints[activePoint].y);

            needAutoInject = true;
            needAutoSmooth = true;
        }

        if(pathGenState == PathGenState.SPLINES) {
        }

        if(activePoint != -1) {
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
    }

    sketch.keyReleased = function(): void {
        keyCodes.splice(keyCodes.indexOf(sketch.keyCode), 1);
        keys.splice(keys.indexOf(sketch.key), 1);
    }

    // calculate the closest point to the cursor to determine which one to grab
    let calculateActivePoint = function(): void {
        if(mouseState != MouseState.DRAGGING) {
            let closestDist: number = userWaypointSizeSlider.getValue() * userWaypointSizeSlider.getValue();
            if(lenientDragging) closestDist *= 4; // make the radius twice as large if on mobile
            activePoint = -1;
            let mouseVector: Vector = new Vector(cx(sketch.mouseX, sketch.width), cy(sketch.mouseY, sketch.height));

            // look at the direction vectors for splines first
            if(pathGenState == PathGenState.SPLINES) {
                if(startDirectionVector != null) {
                    let startDirection: Vector = userPoints[0].add(startDirectionVector);
                    let dist: number = startDirection.getDistanceToSq(mouseVector);
                    if(dist < closestDist) {
                        activePoint = -2;
                        closestDist = dist;
                    }
                }
                if(endDirectionVector != null) {
                    let endDirection: Vector = userPoints[userPoints.length - 1].add(endDirectionVector);
                    let dist: number = endDirection.getDistanceToSq(mouseVector);
                    if(dist < closestDist) {
                        activePoint = -3;
                        closestDist = dist;
                    }
                }
            }

            // if none of the direction vectors were chosen, find a user point
            if(activePoint == -1) {
                for(let pointIndex = 0; pointIndex < userPoints.length; pointIndex++) {
                    let dist: number = userPoints[pointIndex].getDistanceToSq(mouseVector);
                    if(dist < closestDist) {
                        activePoint = pointIndex;
                        closestDist = dist;
                    }
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
        if(pathGenState == PathGenState.SMOOTHING) {
            path_gen.injectPoints(userPoints, injectedPoints, injectSpacingSlider.getValue());
            needAutoInject = false;
            needAutoSmooth = true;
            resetFollower();
        }
        else {
            console.log('ERROR: called injectPoints() during pathGenState != SMOOTHING');
        }
    }   

    let smoothPoints = function(): void {
        if(pathGenState == PathGenState.SMOOTHING) {
            path_gen.smoothPoints(injectedPoints, smoothedPoints, smoothWeightSlider.getValue());
            path_gen.calculateTargetVelocities(smoothedPoints, maxVelocitySlider.getValue(), maxAccelerationSlider.getValue(), 
                turningConstantSlider.getValue());
            needAutoSmooth = false;
            resetFollower();
        }
        else {
            console.log('ERROR: called injectPoints() during pathGenState != SMOOTHING');
        }
    }

    let moveRobotToStart = function(): void {
        robot.pos = userPoints[0];
        if(userPoints.length > 1) {
            angleRobot();
        }
        resetFollower();
    }

    // TODO In the splines mode, make this angle it towards the first direction vector instead
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
