import { SettingsContainer } from './settings-container'
import * as p5 from 'p5';
import { Slider } from '../slider';
import { DOMElement } from '../component';

export interface SmoothingSettings {
    injectSpacing: number,
    smoothWeight: number,
    willAutoInject: boolean,
    willAutoSmooth: boolean
}

export class SmoothingSettingsContainer extends SettingsContainer {

    private injectSpacingSlider: Slider;
    private smoothWeightSlider: Slider;
    
    private willAutoInjectCheckbox: DOMElement;
    private willAutoSmoothCheckbox: DOMElement;

    constructor(sketch: p5) {
        super(true);

        // inject points
        this.injectSpacingSlider = new Slider('#inject-spacing-slider', 1.5, 10, 5, 0.1, sketch);
        this.willAutoInjectCheckbox = new DOMElement(sketch.select('#auto-inject-checkbox'));

        // smooth points
        this.smoothWeightSlider = new Slider('#smooth-weight-slider', 0.00, 0.99, 0.75, 0.01, sketch);
        this.willAutoSmoothCheckbox = new DOMElement(sketch.select('#auto-smooth-checkbox'));

        this.register(this.injectSpacingSlider);
        this.register(this.smoothWeightSlider);

        this.register(this.willAutoInjectCheckbox);
        this.register(this.willAutoSmoothCheckbox);
    }
    
    updateComponents(): void {

    }

    getSettings(): SmoothingSettings {
        return {
            injectSpacing: this.getInjectSpacing(),
            smoothWeight: this.getSmoothWeight(),
            willAutoInject: this.willAutoInject(),
            willAutoSmooth: this.willAutoSmooth()
        };
    }

    setSettings(settings: SmoothingSettings): void {
        this.setInjectSpacing(settings.injectSpacing);
        this.setSmoothWeight(settings.smoothWeight);

        this.setWillAutoInject(settings.willAutoInject);
        this.setWillAutoSmooth(settings.willAutoSmooth);
    }

    getInjectSpacing(): number {
        return this.injectSpacingSlider.getValue();
    }

    getSmoothWeight(): number {
        return this.smoothWeightSlider.getValue();
    }

    willAutoInject(): boolean {
        return this.willAutoInjectCheckbox.element.elt.checked;
    }

    willAutoSmooth(): boolean {
        return this.willAutoSmoothCheckbox.element.elt.checked;
    }

    setInjectSpacing(injectSpacing: number): void {
        this.injectSpacingSlider.setValue(injectSpacing);
    }

    setSmoothWeight(smoothWeight: number): void {
        this.smoothWeightSlider.setValue(smoothWeight);
    }

    setWillAutoInject(willAutoInject: boolean): void {
        this.willAutoInjectCheckbox.element.elt.checked = willAutoInject;
    }

    setWillAutoSmooth(willAutoSmooth: boolean): void {
        this.willAutoSmoothCheckbox.element.elt.checked = willAutoSmooth;
    }
}