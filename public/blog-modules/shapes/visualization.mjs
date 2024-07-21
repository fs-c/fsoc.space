import { getCenter } from './utils.mjs';
import { scale, add, length } from './shapes.mjs';

const namespace = 'http://www.w3.org/2000/svg';

// wrap an array index such that going below 0 wraps around to the maximum and
// vice versa
const wrapIndex = (i, max) => (i < 0 ? max + i : i) % max;

// get the svg path description fragment for the given bezier curve
const getBezierDescription = (cp1, cp2, end) =>
    `C ${cp1.join(' ')}, ${cp2.join(' ')}, ${end.join(' ')} `;

// create a new svg element of the given type with the given attributes
// and add it to the new parent
export const addSVGElement = (
    parent,
    type,
    { children, ...attributes } = {}
) => {
    const element = document.createElementNS(namespace, type);

    for (const attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute]);
    }

    parent.appendChild(element);

    return element;
};

// draw markers at the given absolute points
export const drawMarkers = (element, points, attributes = {}) => {
    const addedElements = [];

    for (let i = 0; i < points.length; i++) {
        const point = points[i];

        addedElements.push(
            addSVGElement(element, 'circle', {
                cx: point[0],
                cy: point[1],
                r: 3,
                class: 'fill-transparent stroke-gray-800 dark:stroke-gray-200',
                ...attributes,
            })
        );

        if (attributes.index !== false) {
            const text = document.createElementNS(namespace, 'text');
            addedElements.push(text);

            text.setAttribute('x', point[0] + 9);
            text.setAttribute('y', point[1] - 4);
            text.setAttribute(
                'class',
                'dark:fill-gray-300 fill-gray-700 text-sm stroke-transparent'
            );

            text.appendChild(document.createTextNode(i));

            for (const attribute in attributes) {
                text.setAttribute(attribute, attributes[attribute]);
            }

            element.appendChild(text);
        }
    }

    console.log(addedElements);

    return () => addedElements.forEach((el) => el.remove());
};

// draw a polygon through the given absolute points
export const drawPolygon = (element, points, attributes = {}) => {
    addSVGElement(element, 'polygon', {
        class:
            `${
                attributes.fill === false
                    ? 'fill-transparent'
                    : 'fill-gray-100 dark:fill-gray-700'
            }` + ` stroke-gray-500`,
        points: points.map((p) => `${p[0]},${p[1]}`).join(' '),
        ...attributes,
    });
};

// for every sequential pair of points (line) get the point in the middle of them
export const getMidpoints = (points) => {
    const middles = [];

    for (let i = 0; i < points.length; i++) {
        middles.push(
            scale(add(points[i], points[wrapIndex(i + 1, points.length)]), 0.5)
        );
    }

    return middles;
};

export const getAnchorPoints = (points, middlePoints) => {
    const anchors = [];

    for (let i = 0; i < points.length; i++) {
        // first line is p[i - 1] to p[i], second one is p[i] to p[i + 1]
        const l1 = length(points[wrapIndex(i - 1, points.length)], points[i]);
        const l2 = length(points[i], points[wrapIndex(i + 1, points.length)]);

        // ratio between the shorter and the longer line
        const factor = (l1 < l2 ? l1 / l2 : l2 / l1) / 2;

        const shorterMiddle =
            l1 < l2
                ? middlePoints[wrapIndex(i - 1, middlePoints.length)]
                : middlePoints[i];
        const longerMiddle =
            l1 > l2
                ? middlePoints[wrapIndex(i - 1, middlePoints.length)]
                : middlePoints[i];

        const vector = add(longerMiddle, scale(shorterMiddle, -1));

        anchors.push(add(scale(vector, factor), shorterMiddle));
    }

    return anchors;
};

export const getControlPoints = (points, middlePoints, anchorPoints) => {
    const controls = [];

    for (let i = 0; i < points.length; i++) {
        const vector = add(points[i], scale(anchorPoints[i], -1));

        controls.push(
            add(middlePoints[wrapIndex(i - 1, middlePoints.length)], vector)
        );
        controls.push(add(middlePoints[i], vector));
    }

    return controls;
};

export const getSmoothPath = (points) => {
    const midpoints = getMidpoints(points);
    const anchorPoints = getAnchorPoints(points, midpoints);
    const controlPoints = getControlPoints(points, midpoints, anchorPoints);

    let pathDescription = `M ${points[0][0]} ${points[0][1]} `;

    for (let i = 0; i < points.length; i++) {
        pathDescription += getBezierDescription(
            controlPoints[wrapIndex(i * 2 + 1, controlPoints.length)],
            controlPoints[wrapIndex(i * 2 + 2, controlPoints.length)],
            points[wrapIndex(i + 1, points.length)]
        );
    }

    return pathDescription;
};

export const setupDemoElement = (element, drawFn) => {
    const args = { center: getCenter(element) };

    const wrappedDrawFn = () => {
        element.innerHTML = '';

        drawFn(args);
    };

    wrappedDrawFn();

    element.addEventListener('click', () => {
        wrappedDrawFn();
    });
};
