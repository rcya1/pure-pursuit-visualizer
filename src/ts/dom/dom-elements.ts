import * as p5 from 'p5';
import { Component } from './settings/settings-container';

export class Slider implements Component {

    private _container: p5.Element;
    private _input: p5.Element;
    private _slider: p5.Element;

    constructor(divId: string, min: number, max: number, value: number,
        step: number, sketch: p5) {
        
        this._container = sketch.select(divId);
        this._container.class('slider-container row');

        let labelDiv = sketch.createDiv();
        let inputDiv = sketch.createDiv();
        let sliderDiv = sketch.createDiv();

        labelDiv.class('col-6 align-self-center label-container');
        inputDiv.class('col-6 align-self-center d-flex');
        sliderDiv.class('col-12 align-self-center d-flex');

        labelDiv.parent(this._container);
        inputDiv.parent(this._container);
        sliderDiv.parent(this._container);

        let label = sketch.createElement('label');
        this._input = sketch.createElement('input');
        this._input.id(divId.substring(1, divId.length) + "-input");
        this._slider = sketch.createElement('input');
        this._slider.id(divId.substring(1, divId.length) + "-slider");

        label.parent(labelDiv);
        this._input.parent(inputDiv);
        this._slider.parent(sliderDiv);

        label.attribute('for', divId);
        label.html(String(this._container.attribute('label-text', undefined)));

        this._input.attribute('type', 'number');
        this._input.attribute('min', String(min));
        this._input.attribute('max', String(max));
        this._input.attribute('value', String(value));
        this._input.attribute('step', String(step));
        this._input.class('slider-input');

        this._slider.attribute('type', 'range');
        this._slider.attribute('min', String(min));
        this._slider.attribute('max', String(max));
        this._slider.attribute('value', String(value));
        this._slider.attribute('step', String(step));
        this._slider.class('slider');

        this.setCallback(function() {});
    }

    hide(): void {
        this._container.hide();
    }

    show(): void {
        this._container.show();
    }

    getValue(): number {
        return Number(this._slider.value());
    }

	setValue(newValue: number): void {
		this._slider.value(newValue);
		this._input.value(newValue);
	}

    setCallback(callback: () => void): void {
        // double-check to make sure these were set correctly (weird bug with slider)
        if(this._slider.value() == 0) this._slider.value(this._input.value());
        if(this._input.value() == 0) this._input.value(this._slider.value());

        // add the custom callback to the elements
        // forced to use getElementById here because the P5 TypeScript types doesn't define input() properly
        let input: HTMLElement = document.getElementById(this._input.id());
        input.addEventListener("input", (function(): void {
            this._slider.value(this._input.value());
            callback();
        }).bind(this)); // use bind to change what "this" refers to in callback

        let slider: HTMLElement = document.getElementById(this._slider.id());
        slider.addEventListener("input", (function(): void {
            this._input.value(this._slider.value());
            callback();
        }).bind(this));
    }
}