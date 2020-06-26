var conv = require('./conversions');
var drawDebugLine = function (a, b, c, sketch) {
    for (var x = 0; x <= 200; x += 5) {
        var y = (-c - a * x) / b;
        sketch.fill(255, 0, 0);
        sketch.noStroke();
        sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height), conv.px(0.5, sketch.width), conv.px(0.5, sketch.width));
    }
};
var drawDebugPoint = function (x, y, sketch) {
    sketch.fill(0, 255, 0);
    sketch.noStroke();
    sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height), conv.px(2, sketch.width), conv.px(2, sketch.width));
};
var drawDebugCircle = function (x, y, r, sketch) {
    sketch.noFill();
    sketch.stroke(0);
    sketch.ellipse(conv.px(x, sketch.width), conv.py(y, sketch.height), conv.px(r * 2, sketch.width), conv.px(r * 2, sketch.width));
};
var getString = function (_injectSpacing, _smoothWeight, _maxVel, _maxAcc, _laDist, _turnConst, _userPoints, _robotPos) {
    var obj = {
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
};
module.exports = {
    drawDebugLine: drawDebugLine,
    drawDebugPoint: drawDebugPoint,
    drawDebugCircle: drawDebugCircle,
    getString: getString,
};
