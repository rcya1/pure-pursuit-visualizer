import { Waypoint } from "../util/waypoint";
import { Vector } from "../util/vector";

export interface PointsData {
    userPoints: Waypoint[];
    finalPoints: Waypoint[];
}

export enum PathGenState {
    SMOOTHING,
    SPLINES
}

export class SmoothingPointsData implements PointsData {
    userPoints: Waypoint[] = [];
    injectedPoints: Waypoint[] = [];
    finalPoints: Waypoint[] = [];

    needAutoInject: boolean = true;
    needAutoSmooth: boolean = true;
}

export class SplinesPointsData implements PointsData {
    userPoints: Waypoint[] = [];
    finalPoints: Waypoint[] = [];

    startDirectionVector: Vector = null;
    endDirectionVector: Vector = null;
    directionTempVector: Vector = null;
}
