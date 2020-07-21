import { SettingsContainer } from './settings-container'
import * as p5 from 'p5';
import { Slider } from '../dom-elements';

export interface VisualSettings {
    robotSize: number;
    waypointSize: number;

    showUser: boolean;
    showInjected: boolean;
    showSmoothed: boolean;
    showLACircle: boolean;
    showLAPoint: boolean;
}

export class VisualSettingsContainer extends SettingsContainer {

    private robotSizeSlider: Slider;
    private userWaypointSizeSlider: Slider;

    private showUserCheckbox: p5.Element;
    private showInjectedCheckbox: p5.Element;
    private showSmoothedCheckbox: p5.Element;
    private showLACircleCheckbox: p5.Element;
    private showLAPointCheckbox: p5.Element;

    constructor(sketch: p5) {
        super(true);

        this.robotSizeSlider = new Slider('#robot-size-slider', 1, 20, 5, 0.1, sketch);
        this.userWaypointSizeSlider = new Slider('#user-waypoint-size-slider', 1, 3, 1.7, 0.1, sketch);
        
        this.showUserCheckbox = sketch.select('#show-user-checkbox');
        this.showInjectedCheckbox = sketch.select('#show-injected-checkbox');
        this.showSmoothedCheckbox = sketch.select('#show-smoothed-checkbox');
        this.showLACircleCheckbox = sketch.select('#show-lookahead-circle-checkbox');
        this.showLAPointCheckbox = sketch.select('#show-lookahead-point-checkbox');

        this.register(this.robotSizeSlider);
        this.register(this.userWaypointSizeSlider);

        this.register(this.showUserCheckbox);
        this.register(this.showInjectedCheckbox);
        this.register(this.showSmoothedCheckbox);
        this.register(this.showLACircleCheckbox);
        this.register(this.showLAPointCheckbox);
    }
    
    updateComponents(): void {

    }

    getSettings(): VisualSettings {
        return {
            robotSize: this.getRobotSize(),
            waypointSize: this.getWaypointSize(),
        
            showUser: this.getShowUser(),
            showInjected: this.getShowInjected(),
            showSmoothed: this.getShowSmoothed(),
            showLACircle: this.getShowLACircle(),
            showLAPoint: this.getShowLAPoint()
        };
    }

    setSettings(settings: VisualSettings): void {
        this.setRobotSize(settings.robotSize);
        this.setWaypointSize(settings.waypointSize);

        this.setShowUser(settings.showUser);
        this.setShowInjected(settings.showInjected);
        this.setShowSmoothed(settings.showSmoothed);
        this.setShowLACircle(settings.showLACircle);
        this.setShowLAPoint(settings.showLAPoint);
    }

    getRobotSize(): number {
        return this.robotSizeSlider.getValue();
    }
    
    getWaypointSize(): number {
        return this.userWaypointSizeSlider.getValue();
    }

    getShowUser(): boolean {
        return this.showUserCheckbox.elt.checked;
    }

    getShowInjected(): boolean {
        return this.showInjectedCheckbox.elt.checked;
    }

    getShowSmoothed(): boolean {
        return this.showSmoothedCheckbox.elt.checked;
    }

    getShowLACircle(): boolean {
        return this.showLACircleCheckbox.elt.checked;
    }
    
    getShowLAPoint(): boolean {
        return this.showLAPointCheckbox.elt.checked;
    }

    setRobotSize(robotSize: number) {
        this.robotSizeSlider.setValue(robotSize);
    }

    setWaypointSize(waypointSize: number) {
        this.userWaypointSizeSlider.setValue(waypointSize);
    }
    
    setShowUser(showUser: boolean) {
        this.showUserCheckbox.elt.checked = showUser;
    }
    
    setShowInjected(showInjected: boolean) {
        this.showInjectedCheckbox.elt.checked = showInjected;
    }

    setShowSmoothed(showSmoothed: boolean) {
        this.showSmoothedCheckbox.elt.checked = showSmoothed;
    }

    setShowLACircle(showLACircle: boolean) {
        this.showLACircleCheckbox.elt.checked = showLACircle;
    }

    setShowLAPoint(showLAPoint: boolean) {
        this.showLAPointCheckbox.elt.checked = showLAPoint;
    }
}