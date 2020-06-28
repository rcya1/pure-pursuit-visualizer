# Pure Pursuit Visualizer

This project is an implementation of the adaptive pure pursuit algorithm for path following. The application allows you to place points and have a robot follow them, while also allowing certain visualization and following parameters be modified.

Most of the original code is based off of [this paper](https://www.chiefdelphi.com/uploads/default/original/3X/b/e/be0e06de00e07db66f97686505c3f4dde2e332dc.pdf)

However, the following augmentations to the algorithm were made:

- The algorithm will only look for look ahead points farther than the last found point
- When starting the algorithm, the robot will start on the point that is closest on it and look forward from there
- The robot will make 180 degree turns if the lookahead point is within a certain angle threshold (TODO)

## Project Structure

- All source code is located in the `/src` folder, which includes HTML, TypeScript, and Sass code
- Webpack is used to to bundle all of the code into the `/dist` directory
- Webpack compiles`p5.js` with the application for the visualization tool
- Webpack also compiles Bootstrap with the application for the UI elements
- Express is used to serve the compiled files

The project was originally built with JavaScript with Watchify and CSS, but the transition to TypeScript and Sass was made to improve code quality and reduce bugs.

## Instructions

Build the source code and run the web server:

```terminal
npm install
npm run build
npm start
```

Run the development environment for incremental builds

```terminal
npm install
npm run watch
```

## Credits

- The project structure was borrowed from [pierpo's starter kit for p5 and TypeScript](https://github.com/pierpo/p5-ts-starter-kit)
- The original project was inspired by [clementmihailescu's project for visualizing pathfinding algorithms](https://github.com/clementmihailescu/Pathfinding-Visualizer)
