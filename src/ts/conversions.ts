export function cx(px: number, width: number): number {
    return px * 200 / width;
}

export function cy(py: number, height: number): number {
    return (height - py) * 100 / height;
}

export function px(cx: number, width: number): number {
    return cx / 200 * width;
}

export function py(cy: number, height: number): number {
    return height - (cy / 100 * height);
}

export const PI: number = 3.14159265359;
