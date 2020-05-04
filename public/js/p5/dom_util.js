let Slider = class {
    constructor(divId, min, max, value, step, sketch) {
        this.container = sketch.select(divId);
        this.container.class('input-slider-container');

        this.input = sketch.createElement('input');
        this.slider = sketch.createElement('input');

        this.input.parent(this.container);
        this.slider.parent(this.container);

        this.input.attribute('type', 'number');
        this.input.attribute('min', min);
        this.input.attribute('max', max);
        this.input.attribute('value', value);
        this.input.attribute('step', step);

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
