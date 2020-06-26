import * as p5 from 'p5';
import '../scss/main.scss';

const s = (sketch: p5): void => {

    const widthScaling: number = 0.9;

    let canvas: p5.Renderer;
    let canvasHolder: p5.Element;   

    sketch.setup = function(): void {
        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        canvasHolder = sketch.select('#canvas-visualizer');
        styleCanvas();
    }

    sketch.draw = function(): void {
        update();
        display();
    }

    let update = function() {

    }

    let display = function() {
        sketch.background(220);
        sketch.rectMode(sketch.CENTER);
    }

    sketch.windowResized = function(): void {
        styleCanvas();
    }

    let styleCanvas = function() {
        let holderWidthString: string  = canvasHolder.style('width');
        let holderWidth: number = parseInt(holderWidthString.substring(0, holderWidthString.length - 2));
        sketch.resizeCanvas(holderWidth * widthScaling, holderWidth * widthScaling / 2.0);
        
        canvasHolder.style('display', 'flex');
        canvasHolder.style('justify-content', 'center');
        canvasHolder.style('flex-direction', 'row-reverse');
        canvas.style('border', '1px solid #707070a0');
        
        canvas.parent('canvas-visualizer');
    }

    sketch.mousePressed = function(): void {

    }

    sketch.mouseReleased = function(): void {

    }

    sketch.mouseDragged = function(): void {

    }

    sketch.touchStarted = function(): void {

    }

    sketch.touchEnded = function(): void {

    }

    sketch.keyPressed = function(): void {

    }

    sketch.keyReleased = function(): void {

    }
};

new p5(s);
