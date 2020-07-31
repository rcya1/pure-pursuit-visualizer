import * as p5 from 'p5';
import '../scss/main.scss';
import { SCREEN_HEIGHT, SCREEN_WIDTH, cx, cy} from './util/conversions'
import { Vector } from './util/vector'
import { App } from './visualization/app';

export enum MouseClickState {
    DEFAULT,
    DRAGGING
}

export class MouseState {
    mouseClickState: MouseClickState;
    lastLocation: Vector;
}

export class MobileConfig {
    lingeringMouse: boolean;
    lenientDragging: boolean;
}

const s = (sketch: p5): void => {

    const widthScaling: number = 0.9;

    let canvas: p5.Renderer;
    let canvasHolder: p5.Element;

    let app: App;

    let keys: string[]  = [];
    let keyCodes: number[] = [];

    // let lastOrientation: string;
    
    let mobileConfig: MobileConfig;
    let mouseState: MouseState;

    sketch.setup = function(): void {
        canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        canvasHolder = sketch.select('#canvas-visualizer');
        styleCanvas();
        
        app = new App(this);

        // lastOrientation = sketch.deviceOrientation;
        mobileConfig = {
            lingeringMouse: false,
            lenientDragging: false
        };
        mouseState = {
            mouseClickState: MouseClickState.DEFAULT,
            lastLocation: null
        }
    }

    sketch.draw = function(): void {
        app.update(mobileConfig, mouseState);
        app.display();
    }

    sketch.windowResized = function(): void {
        styleCanvas();
    }

    let styleCanvas = function() {
        let holderWidthString: string  = canvasHolder.style('width');
        let holderWidth: number = parseInt(holderWidthString.substring(0, holderWidthString.length - 2));
        sketch.resizeCanvas(holderWidth * widthScaling, holderWidth * widthScaling * SCREEN_HEIGHT / SCREEN_WIDTH);
        
        canvasHolder.style('display', 'flex');
        canvasHolder.style('justify-content', 'center');
        canvasHolder.style('flex-direction', 'row-reverse');
        canvas.style('border', '1px solid #707070a0');
        
        canvas.parent('canvas-visualizer');
    }

    sketch.mousePressed = function(): void {
        if(mouseInSketch()) {
            if(mouseState.lastLocation == null) {
                mouseState.lastLocation = new Vector(0, 0);
            }
            mouseState.lastLocation.x = cx(sketch.mouseX, sketch.width);
            mouseState.lastLocation.y = cy(sketch.mouseY, sketch.height);

            app.mousePressed(mobileConfig, mouseState);
            mouseState.mouseClickState = MouseClickState.DRAGGING;
        }
    }

    sketch.mouseDragged = function(): void {
        app.mouseDragged();
    }

    sketch.mouseReleased = function(): void {
        app.mouseReleased();
        mouseState.mouseClickState = MouseClickState.DEFAULT;
    }

    sketch.touchStarted = function(): void {
        mobileConfig.lingeringMouse = false;
        mobileConfig.lenientDragging = true;
        sketch.mousePressed();
    }

    sketch.touchMoved = function(): boolean {
        if(mouseInSketch()) {
            return false;
        }
        sketch.mouseDragged();
    }

    sketch.touchEnded = function(): void {
        mobileConfig.lingeringMouse = true;
        mobileConfig.lenientDragging = false;
        sketch.mouseReleased();
    }

    sketch.keyPressed = function(): void {
        keyCodes.push(sketch.keyCode);
        keys.push(sketch.key);
    }

    sketch.keyReleased = function(): void {
        keyCodes.splice(keyCodes.indexOf(sketch.keyCode), 1);
        keys.splice(keys.indexOf(sketch.key), 1);
    }

    let mouseInSketch = function(): boolean {
        return sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && 
            sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;
    }
};

new p5(s);
