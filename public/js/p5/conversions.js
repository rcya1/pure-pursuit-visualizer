cx = function(px, width) {
    return px * 100 / width;
}

cy = function(py, height) {
    return py * 100 / height;
}

px = function(cx, width) {
    return cx / 100 * width;
}

py = function(cy, height) {
    return cy / 100 * height;
}

module.exports = {
    cx,
    cy,
    px,
    py
}