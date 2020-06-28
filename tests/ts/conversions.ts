import * as conversions from "../../src/ts/conversions"
import { expect } from 'chai';
import 'mocha';

describe('Conversions', () => {
    // the internal coordinates stored as fractions of the internal width / height
    const internalCoords: number[][] = [
        [1.0 / 4, 1.0 / 3],
        [3.0 / 4, 2.0 / 3],
        [8.0 / 9, 3.0 / 7]
    ];

    const screenCoords: number[][] = [
        [60.00, 80.00],
        [174.00, 43.00],
        [177.77, 514.29]
    ];

    const canvasSizes: number[][] = [
        [240, 120],
        [232, 129],
        [200, 900]
    ];

    const numTests = internalCoords.length;

    it('converting internal coordinates to canvas pixels', () => {
        for(let i = 0; i < numTests; i++) {
            const cx: number = internalCoords[i][0] * conversions.SCREEN_WIDTH;
            const cy: number = internalCoords[i][1] * conversions.SCREEN_HEIGHT;

            const px: number = conversions.px(cx, canvasSizes[i][0]);
            const py: number = conversions.py(cy, canvasSizes[i][1]);

            validateCoords(px, py, screenCoords[i][0], screenCoords[i][1]);
        }
    });

    it('converting canvas pixels to internal coordinates', () => {
        for(let i = 0; i < numTests; i++) {
            const px: number = screenCoords[i][0];
            const py: number = screenCoords[i][1];

            const cx: number = conversions.cx(px, canvasSizes[i][0]) / conversions.SCREEN_WIDTH;
            const cy: number = conversions.cy(py, canvasSizes[i][1]) / conversions.SCREEN_HEIGHT;

            validateCoords(cx, cy, internalCoords[i][0], internalCoords[i][1]);
        }
    });

    function validateCoords(x: number, y: number, ex: number, ey: number, e: number = 0.01) {
        expect(x).to.be.closeTo(ex, e);
        expect(y).to.be.closeTo(ey, e);
    }
});
