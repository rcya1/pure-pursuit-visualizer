import * as p5 from 'p5';
import { DOMElement } from './component';

export class FollowButton {
    
    private followPathButton: DOMElement;

    constructor(sketch: p5) {
        this.followPathButton = new DOMElement(sketch.select('#follow-path-button'));
    }

    isActive(): boolean {
        return this.followPathButton.element.hasClass('active');
    }
}