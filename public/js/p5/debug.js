const conv = require('./conversions');
const Vector = require('./vector');
const Waypoint = require('./waypoint');

let drawDebugLine = function(a, b, c, sketch) {
    for(let x = 0; x <= 200; x += 5) {
        let y = (-c - a * x) / b;
        sketch.fill(255, 0, 0);
        sketch.noStroke();
        sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height),
            conv.px(0.5, sketch.width), conv.px(0.5, sketch.width));

    }
}

let drawDebugPoint = function(x, y, sketch) {
    sketch.fill(0, 255, 0);
    sketch.noStroke();
    sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height),
        conv.px(2, sketch.width), conv.px(2, sketch.width));
}

let drawDebugCircle = function(x, y, r, sketch) {
    sketch.noFill();
    sketch.stroke(0);
    sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height), conv.px(r * 2, sketch.width), conv.px(r * 2, sketch.width));
}

let getString = function(_injectSpacing, _smoothWeight, _maxVel, _maxAcc, _laDist, _turnConst, _userPoints, _robotPos) {
	let obj = {
		injectSpacing: _injectSpacing,
		smoothWeight: _smoothWeight,
		maxVel: _maxVel,
		maxAcc: _maxAcc,
		laDist: _laDist,
		turnConst: _turnConst,
		userPoints: _userPoints,
		robotPos: _robotPos
	};

	return JSON.stringify(obj);
}

module.exports = {
    drawDebugLine,
    drawDebugPoint,
    drawDebugCircle,
	getString,
};
