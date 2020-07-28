import * as p5 from 'p5';
import { DOMElement } from './component';

interface IconBarCallbacks {
    deleteAllPoints: () => void;
    resetRobotPos: () => void;
}

export enum CursorActionState {
    ADDING,
    REMOVING
}

export class IconBar {
    
    private deleteAllPointsButton: DOMElement;
    private deletePointsCheckbox: DOMElement;
    private resetRobotButton: DOMElement;

    constructor(sketch: p5, callbacks: IconBarCallbacks) {
        this.deletePointsCheckbox = new DOMElement(sketch.select('#delete-points-checkbox'));
        this.deletePointsCheckbox.element.mousePressed((function(): void {
            console.log(this.deletePointsCheckbox);
            if(this.deletePointsCheckbox.element.hasClass('checked')) {
                this.deletePointsCheckbox.element.removeClass('checked');
            }
            else {
                this.deletePointsCheckbox.element.addClass('checked');
            }
        }).bind(this));

        this.deleteAllPointsButton = new DOMElement(sketch.select('#delete-all-points-button'));
        this.deleteAllPointsButton.element.mousePressed(function(): void {
            if(confirm('Are you sure you would like to remove all points?')) {
                callbacks.deleteAllPoints();
            }
        });

        this.resetRobotButton = new DOMElement(sketch.select('#reset-robot-button'));
        this.resetRobotButton.element.mousePressed(function(): void {
            callbacks.resetRobotPos();
        });
    }

    update(): void {
        if(this.deletePointsCheckbox.element.hasClass('checked')) {
            if(this.deletePointsCheckbox.element.hasClass('fa-plus')) {
                this.deletePointsCheckbox.element.removeClass('fa-plus');
                this.deletePointsCheckbox.element.addClass('fa-trash-alt');
            }
        }
        else {
            if(this.deletePointsCheckbox.element.hasClass('fa-trash-alt')) {
                this.deletePointsCheckbox.element.removeClass('fa-trash-alt');
                this.deletePointsCheckbox.element.addClass('fa-plus');
            }
        }
    }

    getCursorActionState(): CursorActionState {
        if(this.deletePointsCheckbox.element.hasClass('checked')) {
            return CursorActionState.REMOVING;
        }
        else {
            return CursorActionState.ADDING;
        }
    } 
}