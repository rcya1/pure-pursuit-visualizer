export const SCREEN_WIDTH: number = 200;
export const SCREEN_HEIGHT: number = 100;

export function cx(px: number, canvasWidth: number): number {
    return px * SCREEN_WIDTH / canvasWidth;
}

export function cy(py: number, canvasHeight: number): number {
    return (canvasHeight - py) * SCREEN_HEIGHT / canvasHeight;
}

export function px(cx: number, canvasWidth: number): number {
    return cx / SCREEN_WIDTH * canvasWidth;
}

export function py(cy: number, canvasHeight: number): number {
    return canvasHeight - (cy / SCREEN_HEIGHT * canvasHeight);
}

export const PI: number = 3.14159265359;
