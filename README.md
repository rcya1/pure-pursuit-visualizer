# Pure Pursuit Visualizer

This project is an implementation of the adaptive pure pursuit algorithm for path following. The application allows you to place points and have a robot follow them, while also allowing certain visualization and following parameters be modified.

Most of the original code is based off of [this paper](https://www.chiefdelphi.com/uploads/default/original/3X/b/e/be0e06de00e07db66f97686505c3f4dde2e332dc.pdf)

However, the following augmentations to the algorithm were made:

- The algorithm will only look for look ahead points farther than the last found point
- When starting the algorithm, the robot will start on the point that is closest on it and look forward from there
- The robot will make 180 degree turns if the lookahead point is within a certain angle threshold (TODO)

## Project Structure

- All source code is located in the `/src` folder, which includes both TypeScript and Sass code
- All TypeScript code is compiled into JavaScript code in the `/build` folder
- All JavaScript code is bundled and minified into `bundle.min.js` in the `/dist` folder
- All Sass code is compiled into CSS code in the `/dist` folder

## Instructions

Build the source code and run the web server:

```terminal
npm install
npm run build
npm start
```
