let Slider = class {
    constructor(divId, min, max, value, step, sketch) {
        this.container = sketch.select(divId);
        this.container.class('slider-container row');

        let labelDiv = sketch.createDiv();
        let inputDiv = sketch.createDiv();
        let sliderDiv = sketch.createDiv();

        labelDiv.class('col-xl-4 col-6 align-self-center');
        inputDiv.class('col-xl-3 col-6 align-self-center');
        sliderDiv.class('col-xl-5 col-12 align-self-center');

        labelDiv.parent(this.container);
        inputDiv.parent(this.container);
        sliderDiv.parent(this.container);

        let label = sketch.createElement('label');
        this.input = sketch.createElement('input');
        this.slider = sketch.createElement('input');

        label.parent(labelDiv);
        this.input.parent(inputDiv);
        this.slider.parent(sliderDiv);

        label.attribute('for', divId);
        label.html(this.container.attribute('label-text'));

        this.input.attribute('type', 'number');
        this.input.attribute('min', min);
        this.input.attribute('max', max);
        this.input.attribute('value', value);
        this.input.attribute('step', step);
        this.input.class('slider-input');

        this.slider.attribute('type', 'range');
        this.slider.attribute('min', min);
        this.slider.attribute('max', max);
        this.slider.attribute('value', value);
        this.slider.attribute('step', step);
        this.slider.class('slider');

        this.setCallback(function() {});
    }

    getValue() {
        return this.slider.value();
    }

	setValue(newValue) {
		this.slider.value(newValue);
		this.input.value(newValue);
	}

    setCallback(callback) {
        // double-check to make sure these were set correctly (weird bug with slider)
        if(this.slider.value() == 0) this.slider.value(this.input.value());
        if(this.input.value() == 0) this.input.value(this.slider.value());

        // add the custom callback to the elements
        this.input.input((function() {
            this.slider.value(this.input.value());
            callback();
        }).bind(this)); // use bind to change what "this" refers to in callback
        this.slider.input((function() {
            this.input.value(this.slider.value());
            callback();
        }).bind(this));
    }
}

module.exports = {
    Slider
};
