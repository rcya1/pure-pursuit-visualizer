const conv = require("./conversions");

drawDebugLine = function(a, b, c, sketch) {
    for(let x = 0; x <= 200; x += 5) {
        let y = (-c - a * x) / b;
        sketch.fill(255, 0, 0);
        sketch.noStroke();
        sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height),
            conv.px(0.5, sketch.width), conv.px(0.5, sketch.width));

    }
}

drawDebugPoint = function(x, y, sketch) {
    sketch.fill(0, 255, 0);
    sketch.noStroke();
    sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height),
        conv.px(2, sketch.width), conv.px(2, sketch.width));
}

drawDebugCircle = function(x, y, r, sketch) {
    sketch.noFill();
    sketch.stroke(0);
    sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height), conv.px(r * 2, sketch.width), conv.px(r * 2, sketch.width));
}

module.exports = {
    drawDebugLine,
    drawDebugPoint,
    drawDebugCircle
};