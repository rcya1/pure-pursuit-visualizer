import * as p5 from 'p5';
import { DOMElement, Component } from './component'

export class Slider implements Component {

    private _container: DOMElement;
    private _input: DOMElement;
    private _slider: DOMElement;

    constructor(divId: string, min: number, max: number, value: number,
        step: number, sketch: p5) {
        
        this._container = new DOMElement(sketch.select(divId));
        this._container.element.class('slider-container row');

        let labelDiv: DOMElement = new DOMElement(sketch.createDiv());
        let inputDiv: DOMElement = new DOMElement(sketch.createDiv());
        let sliderDiv: DOMElement = new DOMElement(sketch.createDiv());

        labelDiv.element.class('col-6 align-self-center label-container');
        inputDiv.element.class('col-6 align-self-center d-flex');
        sliderDiv.element.class('col-12 align-self-center d-flex');

        labelDiv.element.parent(this._container.element);
        inputDiv.element.parent(this._container.element);
        sliderDiv.element.parent(this._container.element);

        let label: DOMElement = new DOMElement(sketch.createElement('label'));
        this._input = new DOMElement(sketch.createElement('input'));
        this._input.element.id(divId.substring(1, divId.length) + "-input");
        this._slider = new DOMElement(sketch.createElement('input'));
        this._slider.element.id(divId.substring(1, divId.length) + "-slider");

        label.element.parent(labelDiv.element);
        this._input.element.parent(inputDiv.element);
        this._slider.element.parent(sliderDiv.element);

        label.element.attribute('for', divId);
        label.element.html(String(this._container.element.attribute('label-text', undefined)));

        this._input.element.attribute('type', 'number');
        this._input.element.attribute('min', String(min));
        this._input.element.attribute('max', String(max));
        this._input.element.attribute('value', String(value));
        this._input.element.attribute('step', String(step));
        this._input.element.class('slider-input');

        this._slider.element.attribute('type', 'range');
        this._slider.element.attribute('min', String(min));
        this._slider.element.attribute('max', String(max));
        this._slider.element.attribute('value', String(value));
        this._slider.element.attribute('step', String(step));
        this._slider.element.class('slider');

        this.setCallback(function() {});
    }

    hide(): void {
        this._container.hide();
    }

    show(): void {
        this._container.show();
    }

    getValue(): number {
        return Number(this._slider.element.value());
    }

	setValue(newValue: number): void {
		this._slider.element.value(newValue);
		this._input.element.value(newValue);
	}

    setCallback(callback: () => void): void {
        // double-check to make sure these were set correctly (weird bug with slider)
        if(this._slider.element.value() == 0) this._slider.element.value(this._input.element.value());
        if(this._input.element.value() == 0) this._input.element.value(this._slider.element.value());

        // add the custom callback to the elements
        // forced to use getElementById here because the P5 TypeScript types doesn't define input() properly
        let input: HTMLElement = document.getElementById(this._input.element.id());
        input.addEventListener("input", (function(): void {
            this._slider.element.value(this._input.element.value());
            callback();
        }).bind(this)); // use bind to change what "this" refers to in callback

        let slider: HTMLElement = document.getElementById(this._slider.element.id());
        slider.addEventListener("input", (function(): void {
            this._input.element.value(this._slider.element.value());
            callback();
        }).bind(this));
    }
}