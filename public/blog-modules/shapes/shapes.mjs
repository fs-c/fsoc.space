import { randomInt, randomFloat } from './utils.mjs';

// add up relative points
export const add = (...points) =>
    points.reduce(
        (acc, cur) => {
            acc[0] += cur[0];
            acc[1] += cur[1];

            return acc;
        },
        [0, 0]
    );

// scale a relative point by some factor
export const scale = (point, factor) => [
    Math.floor(point[0] * factor),
    Math.floor(point[1] * factor),
];

// length of the line between two points (magnitude of vector between them)
export const length = (p1, p2) =>
    Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));

// convert relative to absolute point
export const relToAbs = (center, point) => [
    center[0] + point[0],
    center[1] - point[1],
];

// convert absolute to relative point
export const absToRel = (center, point) => [
    point[0] - center[0],
    center[1] - point[1],
];

// distribute a number of points evenly along a circle, for each choose a random
// point some distance away from it
export const generatePointsAroundCircle = (
    total,
    { radius = 100, spread = 20, offset = randomFloat(0, maxRadians) } = {}
) => {
    const points = [];

    const maxRadians = Math.PI * 2; // 360 degrees
    const radianSteps = maxRadians / total;

    for (let i = 0; i < total; i++) {
        // -i to make it go clockwise, just for presentation
        const radians = radianSteps * -i;

        points.push([
            Math.floor(Math.cos(radians) * radius) + randomInt(-spread, spread),
            Math.floor(Math.sin(radians) * radius) + randomInt(-spread, spread),
        ]);
    }

    return points;
};

export const generateRandomPoints = (total, area, padding = 0) => {
    const points = [];

    for (let i = 0; i < total; i++) {
        points.push([
            randomInt(padding - area[0], area[0] - padding),
            randomInt(padding - area[1], area[1] - padding),
        ]);
    }

    return points;
};
