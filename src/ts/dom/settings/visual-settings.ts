import { SettingsContainer } from './settings-container'
import * as p5 from 'p5';
import { Slider } from '../slider';
import { DOMElement } from '../component'

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

    private showUserCheckbox: DOMElement;
    private showInjectedCheckbox: DOMElement;
    private showSmoothedCheckbox: DOMElement;
    private showLACircleCheckbox: DOMElement;
    private showLAPointCheckbox: DOMElement;

    constructor(sketch: p5) {
        super(true);

        this.robotSizeSlider = new Slider('#robot-size-slider', 1, 20, 5, 0.1, sketch);
        this.userWaypointSizeSlider = new Slider('#user-waypoint-size-slider', 1, 3, 1.7, 0.1, sketch);
        
        this.showUserCheckbox = new DOMElement(sketch.select('#show-user-checkbox'));
        this.showInjectedCheckbox = new DOMElement(sketch.select('#show-injected-checkbox'));
        this.showSmoothedCheckbox = new DOMElement(sketch.select('#show-smoothed-checkbox'));
        this.showLACircleCheckbox = new DOMElement(sketch.select('#show-lookahead-circle-checkbox'));
        this.showLAPointCheckbox = new DOMElement(sketch.select('#show-lookahead-point-checkbox'));

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
        return this.showUserCheckbox.element.elt.checked;
    }

    getShowInjected(): boolean {
        return this.showInjectedCheckbox.element.elt.checked;
    }

    getShowSmoothed(): boolean {
        return this.showSmoothedCheckbox.element.elt.checked;
    }

    getShowLACircle(): boolean {
        return this.showLACircleCheckbox.element.elt.checked;
    }
    
    getShowLAPoint(): boolean {
        return this.showLAPointCheckbox.element.elt.checked;
    }

    setRobotSize(robotSize: number) {
        this.robotSizeSlider.setValue(robotSize);
    }

    setWaypointSize(waypointSize: number) {
        this.userWaypointSizeSlider.setValue(waypointSize);
    }
    
    setShowUser(showUser: boolean) {
        this.showUserCheckbox.element.elt.checked = showUser;
    }
    
    setShowInjected(showInjected: boolean) {
        this.showInjectedCheckbox.element.elt.checked = showInjected;
    }

    setShowSmoothed(showSmoothed: boolean) {
        this.showSmoothedCheckbox.element.elt.checked = showSmoothed;
    }

    setShowLACircle(showLACircle: boolean) {
        this.showLACircleCheckbox.element.elt.checked = showLACircle;
    }

    setShowLAPoint(showLAPoint: boolean) {
        this.showLAPointCheckbox.element.elt.checked = showLAPoint;
    }
}