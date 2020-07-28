import * as p5 from 'p5';
import { Settings } from '../dom/settings/settings';
import { Robot } from '../robot/robot';
import { PointsData, SmoothingPointsData, PathGenState, SplinesPointsData } from './points-data';
import { PurePursuitFollower, followPath } from '../robot/pure-pursuit';
import { FollowButton } from '../dom/follow-button';
import { MouseState, MouseClickState, MobileConfig } from '../sketch';
import { cy, cx, SCREEN_WIDTH, SCREEN_HEIGHT } from '../util/conversions';
import { Vector } from '../util/vector';
import { smoothPoints, calculateTargetVelocities, injectPoints } from '../robot/smoothing-gen';
import { drawDebugPoint, drawDebugCircle } from '../util/debug';
import { Waypoint } from '../util/waypoint';
import { IconBar } from '../dom/icon-bar';

export class App {

    sketch: p5;
    settings: Settings;
    iconBar: IconBar;
    followButton: FollowButton;
    
    robot: Robot;
    pointsData: PointsData;
    activePointIndex: number;
    follower: PurePursuitFollower;
    
    pathGenState: PathGenState = PathGenState.SMOOTHING;

    directionVectorDist: number = 15; // TEMP

    constructor(sketch: p5) {
        this.sketch = sketch;
        this.settings = new Settings(sketch);
        this.iconBar = new IconBar(sketch, {
            deleteAllPoints: this.deleteAllPoints.bind(this),
            resetRobotPos: this.moveRobotToStart.bind(this)
        });
        this.followButton = new FollowButton(sketch);

        this.robot = new Robot();
        this.pointsData = new SmoothingPointsData();
        this.follower = new PurePursuitFollower(
            this.settings.getFollowingSettings().lookahead,
            this.settings.getVisualSettings().robotSize,
            this.settings.getFollowingSettings().maxAcceleration
        );
    }

    update(mobileConfig: MobileConfig, mouseState: MouseState) {
        this.updateSettings();
        this.iconBar.update();
        
        if(this.followButton.isActive()) {
            followPath(this.robot, this.follower, this.pointsData.finalPoints, this.sketch.millis());
        }

        this.robot.update(this.sketch.frameRate(), this.settings.getVisualSettings().robotSize);

        if(!mobileConfig.lingeringMouse) this.calculateActivePoint(mobileConfig, mouseState);
        this.updateDraggingPoints(mouseState);

        if(this.pathGenState == PathGenState.SMOOTHING) {
            this.settings.showSmoothingSettings();
            this.settings.hideSplinesSettings();
            let smoothingPointsData: SmoothingPointsData = this.pointsData as SmoothingPointsData
            
            if(mouseState.mouseClickState == MouseClickState.DRAGGING) {
                smoothingPointsData.needAutoInject = true;
                smoothingPointsData.needAutoSmooth = true;
            }

            // handle auto injecting and smoothing
            if(this.settings.getSmoothingSettings().willAutoInject) {
                if(smoothingPointsData.needAutoInject) {
                    this.injectPoints();
                }
            }

            if(this.settings.getSmoothingSettings().willAutoSmooth) {
                if(smoothingPointsData.needAutoSmooth) {
                    this.smoothPoints();
                }
            }
        }
        else {
            this.settings.hideSmoothingSettings();
            this.settings.showSplinesSettings();
            let splinesPointsData: SplinesPointsData = this.pointsData as SplinesPointsData;
            
            if(splinesPointsData.userPoints.length < 2) {
                splinesPointsData.endDirectionVector = null;
            }
            if(splinesPointsData.userPoints.length < 1) {
                splinesPointsData.startDirectionVector = null;
            }

            if(splinesPointsData.startDirectionVector == null && splinesPointsData.userPoints.length > 0) {
                splinesPointsData.startDirectionVector = new Vector(this.directionVectorDist, 0.0);
            }
            if(splinesPointsData.endDirectionVector == null && splinesPointsData.userPoints.length > 1) {
                splinesPointsData.endDirectionVector = new Vector(this.directionVectorDist, 0.0);
            }
        }
    }

    private updateSettings() {
        this.settings.calculateChanges();
    }

    private calculateActivePoint(mobileConfig: MobileConfig, mouseState: MouseState) { 
        if(mouseState.mouseClickState == MouseClickState.DRAGGING) {
            return;
        }
        
        let mouseCX: number = cx(this.sketch.mouseX, this.sketch.width);
        let mouseCY: number = cy(this.sketch.mouseY, this.sketch.height);

        let closestDist: number = this.settings.getVisualSettings().waypointSize ** 2;
        if(mobileConfig.lenientDragging) {
            closestDist *= 4; // make the radius twice as large if on mobile
        }

        this.activePointIndex = -1;
        let mouseVector: Vector = new Vector(mouseCX, mouseCY);

        // look at the direction vectors for splines first
        if(this.pathGenState == PathGenState.SPLINES) {
            let splinesPointsData: SplinesPointsData = this.pointsData as SplinesPointsData;
            if(splinesPointsData.startDirectionVector != null) {
                let startDirection: Vector = splinesPointsData.userPoints[0].add(splinesPointsData.startDirectionVector);
                let dist: number = startDirection.getDistanceToSq(mouseVector);
                if(dist < closestDist) {
                    this.activePointIndex = -2;
                    closestDist = dist;
                }
            }
            if(splinesPointsData.endDirectionVector != null) {
                let numPoints: number = splinesPointsData.userPoints.length;
                let endDirection: Vector = splinesPointsData.userPoints[numPoints - 1].add(splinesPointsData.endDirectionVector);
                let dist: number = endDirection.getDistanceToSq(mouseVector);
                if(dist < closestDist) {
                    this.activePointIndex = -3;
                    closestDist = dist;
                }
            }
        }

        // if none of the direction vectors were chosen, find a user point
        if(this.activePointIndex == -1) {
            for(let pointIndex = 0; pointIndex < this.pointsData.userPoints.length; pointIndex++) {
                let dist: number = this.pointsData.userPoints[pointIndex].getDistanceToSq(mouseVector);
                if(dist < closestDist) {
                    this.activePointIndex = pointIndex;
                    closestDist = dist;
                }
            }
        }
    }

    private updateDraggingPoints(mouseState: MouseState) {
        let mouseCX: number = cx(this.sketch.mouseX, this.sketch.width);
        let mouseCY: number = cy(this.sketch.mouseY, this.sketch.height);

        if(mouseState.mouseClickState != MouseClickState.DRAGGING || mouseState.lastClickLocation == null) {
            mouseState.mouseClickState = MouseClickState.DEFAULT;
            return;
        }

        // ensure that the translation of the active point is only moved relative to the last mouse location
        // this way, when you drag it off-center it doesn't jump
        let lastClickLocation: Vector = mouseState.lastClickLocation;

        if(this.activePointIndex >= 0) {
            this.pointsData.userPoints[this.activePointIndex].x += mouseCX - lastClickLocation.x;
            this.pointsData.userPoints[this.activePointIndex].y += mouseCX - lastClickLocation.y;
            lastClickLocation = new Vector(mouseCX, mouseCY);
        }
        // handle direction vectors
        else if(this.activePointIndex < -1) {
            // calculate the displacement of the mouse and constrain the vectors to a fixed distance 
            // around the original point
            let mouseDisplacementX: number = mouseCX - lastClickLocation.x;
            let mouseDisplacementY: number = mouseCY - lastClickLocation.y;
            let splinesPointData: SplinesPointsData = this.pointsData as SplinesPointsData;
            let numPoints = splinesPointData.userPoints.length;

            let dirVector: Vector = null;
            let origPoint: Vector = null;
            if(this.activePointIndex == -2) {
                dirVector = splinesPointData.startDirectionVector;
                origPoint = splinesPointData.userPoints[0];
            }
            if(this.activePointIndex == -3) {
                dirVector = splinesPointData.endDirectionVector;
                origPoint = splinesPointData.userPoints[numPoints - 1];
            }
            let dragPos: Vector = splinesPointData.directionTempVector.add(
                new Vector(mouseDisplacementX, mouseDisplacementY));
            let newDirVector: Vector = dragPos.sub(origPoint).normalize().mult(this.directionVectorDist);
            dirVector.x = newDirVector.x;
            dirVector.y = newDirVector.y;


            // shorten the lengths of the direction vectors if they go off screen
            if(this.activePointIndex == -2) {
                let currLength: number = this.directionVectorDist;
                let normVector: Vector = splinesPointData.startDirectionVector.normalize();
                let temp: Vector = normVector.mult(currLength);
                while(currLength >= 1 && (temp.x >= SCREEN_WIDTH - splinesPointData.userPoints[0].x || 
                    temp.x <= -splinesPointData.userPoints[0].x || 
                    temp.y >= SCREEN_HEIGHT - splinesPointData.userPoints[0].y || 
                    temp.y <= -splinesPointData.userPoints[0].y)) {

                    currLength -= 0.25;
                    temp = normVector.mult(currLength);
                }

                splinesPointData.startDirectionVector = temp;
            }
            if(this.activePointIndex == -3) {
                let currLength: number = this.directionVectorDist;
                let normVector: Vector = splinesPointData.endDirectionVector.normalize();
                let temp: Vector = normVector.mult(currLength);
                while(currLength >= 1 && (temp.x >= SCREEN_WIDTH - splinesPointData.userPoints[numPoints - 1].x || 
                    temp.x <= -splinesPointData.userPoints[numPoints - 1].x || 
                    temp.y >= SCREEN_HEIGHT - splinesPointData.userPoints[numPoints - 1].y || 
                    temp.y <= -splinesPointData.userPoints[numPoints - 1].y)) {

                    currLength -= 0.25;
                    temp = normVector.mult(currLength);
                }

                splinesPointData.endDirectionVector = temp;
            }
        }
    }

    injectPoints() {
        if(this.pathGenState == PathGenState.SMOOTHING) {
            let smoothingPointsData: SmoothingPointsData = this.pointsData as SmoothingPointsData
            injectPoints(smoothingPointsData.userPoints, smoothingPointsData.injectedPoints, 
                this.settings.getSmoothingSettings().injectSpacing);

            smoothingPointsData.needAutoInject = false;
            smoothingPointsData.needAutoSmooth = true;
            this.resetFollower();
        }
        else {
            console.log('ERROR: called injectPoints() during pathGenState != SMOOTHING');
        }
    }

    smoothPoints() {
        if(this.pathGenState == PathGenState.SMOOTHING) {
            let smoothingPointsData: SmoothingPointsData = this.pointsData as SmoothingPointsData
            smoothPoints(smoothingPointsData.injectedPoints, smoothingPointsData.finalPoints, 
                this.settings.getSmoothingSettings().smoothWeight);
            
            calculateTargetVelocities(smoothingPointsData.finalPoints, this.settings.getFollowingSettings().maxVelocity, 
                this.settings.getFollowingSettings().maxAcceleration, 
                this.settings.getFollowingSettings().turningConstant);
            smoothingPointsData.needAutoSmooth = false;
            this.resetFollower();
        }
        else {
            console.log('ERROR: called smoothPoints() during pathGenState != SMOOTHING');
        }
    }

    resetFollower() {
        this.follower.reset(this.settings.getFollowingSettings().lookahead,
            this.settings.getVisualSettings().robotSize,
            this.settings.getFollowingSettings().maxAcceleration);
    }

    deleteAllPoints() {
        if(this.pathGenState == PathGenState.SMOOTHING) {
            this.pointsData = new SmoothingPointsData();
        }
        else {
            this.pointsData = new SplinesPointsData();
        }
    }

    moveRobotToStart() {
        if(this.pointsData.userPoints.length > 0) {
            this.robot.pos = this.pointsData.userPoints[0];
            if(this.pointsData.userPoints.length > 1) {
                this.angleRobot();
            }
            this.resetFollower();
        }
    }

    // TODO In splines mode make this face direction vector
    angleRobot() {
        this.robot.angle = Math.atan2(this.pointsData.userPoints[1].y - this.pointsData.userPoints[0].y,
            this.pointsData.userPoints[1].x - this.pointsData.userPoints[0].x);
    }

    display() {
        this.sketch.background(220);
        this.sketch.rectMode(this.sketch.CENTER);
        
        if (this.pathGenState == PathGenState.SMOOTHING) {
            let smoothingPointsData: SmoothingPointsData = this.pointsData as SmoothingPointsData;

            // draw all injected points
            if(this.settings.getVisualSettings().showInjected) {
                for(let point of smoothingPointsData.injectedPoints) {
                    point.draw(this.sketch, this.settings.getVisualSettings().waypointSize / 3.0, false, 150);
                }
            }
        }
        else {
            let splinesPointsData: SplinesPointsData = this.pointsData as SplinesPointsData

            // draw direction vectors
            if(splinesPointsData.startDirectionVector != null) {
                let startDirection: Waypoint = new Waypoint(
                    splinesPointsData.userPoints[0].add(splinesPointsData.startDirectionVector));
                    
                startDirection.drawColor(this.sketch, this.settings.getVisualSettings().waypointSize / 1.25, 
                    this.activePointIndex == -2, 200, 20, 20);
            }
            if(splinesPointsData.endDirectionVector != null) {
                let endDirection: Waypoint = new Waypoint(
                    splinesPointsData.userPoints[splinesPointsData.userPoints.length - 1].add(
                        splinesPointsData.endDirectionVector));
                
                endDirection.drawColor(this.sketch, this.settings.getVisualSettings().waypointSize / 1.25, 
                    this.activePointIndex == -3, 200, 20, 20);
            }
        }

        // draw all smoothed points
        if(this.settings.getVisualSettings().showSmoothed) {
            for(let point of this.pointsData.finalPoints) {
                point.draw(this.sketch, this.settings.getVisualSettings().waypointSize / 1.5, false, 100);
            }
        }
        // draw all of the user points
        if(this.settings.getVisualSettings().showUser) {
            for(let pointIndex = 0; pointIndex < this.pointsData.userPoints.length; pointIndex++) {
                // TODO Fill in
            }
        }

        this.robot.draw(this.sketch, this.settings.getVisualSettings().robotSize);

        // debug.drawDebugLine(follower.debug_a, follower.debug_b, follower.debug_c, sketch);
        if(this.settings.getVisualSettings().showLAPoint) 
            drawDebugPoint(this.follower.debug_la_x, this.follower.debug_la_y, this.sketch);
        if(this.settings.getVisualSettings().showLACircle) 
            drawDebugCircle(this.robot.pos.x, this.robot.pos.y, this.settings.getFollowingSettings().lookahead, this.sketch);
    }

    mousePressed(mobileConfig: MobileConfig, mouseState: MouseState) {
        this.calculateActivePoint(mobileConfig, mouseState);

    }

    mouseDragged() {

    }

    mouseReleased() {

    }

    keyPressed() {

    }

    keyReleased() {

    }
}
