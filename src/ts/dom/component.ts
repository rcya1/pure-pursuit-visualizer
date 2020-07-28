import p5 from "p5";

export interface Component {
    hide(): void;
    show(): void;
}

export class DOMElement {

    private previousDisplay: string;
    element: p5.Element;

    constructor(element: p5.Element) {
        this.element = element;
    }

    hide(): DOMElement {
        this.previousDisplay = this.element.style('display');
        this.element.hide();
        return this;
    }

    show(): DOMElement {
        this.previousDisplay = this.element.style('display');
        this.element.style('display', this.previousDisplay);
        return this;
    }
}
