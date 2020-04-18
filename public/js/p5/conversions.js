cx = function(px, width) {
    return px * 100 / width;
}

cy = function(py, height) {
    return (height - py) * 100 / height;
}

px = function(cx, width) {
    return cx / 100 * width;
}

py = function(cy, height) {
    return height - (cy / 100 * height);
}

const PI = 3.14159265359;

module.exports = {
    cx,
    cy,
    px,
    py,
    PI
}
