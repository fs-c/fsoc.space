---
title: More Tinkering with Random Shapes
date: 2022-10-16
description: Thoughts and visualisations loosely related to randomly generating simple polygons.
---

In a [recent post](https://fsoc.space/words/drawing-squiggly-lines) I talked about generating random shapes. The goal was to generate aesthetically consistent but still random shapes with smooth curves. One of the primary challenges was generating polygons which would not self-intersect (for aesthetic reasons). To get an idea for what I'm talking about, the following is an interactive illustration of the algorithm, taken from the linked post.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="random-points"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

This algorithm works fine and it was well suited to the needs of that project. But I did a lot of experimentation in different directions while working on it, and this post is an attempt to make some of the resulting thoughts and results accessible.

The first section talks about the travelling salesman problem and its relation to simple polygons. The following section explores a trivial algorithm that I overlooked in the first post. Finally I'll apply some of the above to a hexagonal lattice.

## Shortest Path

When you generate a number of completely random points and connect them, the resulting polygon is usually self intersecting. But when you order the points such that the cumulative distance between them is minimal, you get the following.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="tsp"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_Yes, this is equivalent to the [travelling salesman problem](https://en.wikipedia.org/wiki/Travelling_salesman_problem) (TSP)._

The shortest route through a given number of points (in two-dimensional Euclidian space) will always form the boundary of a simple polygon. This is probably obvious to some, but I found it fascinating. (Intuition: Every crossing can be eliminated while also decreasing local length.)

Of course, algorithms for (exactly) solving the TSP and related problems have terrible time efficiency. They are only a conceivably acceptable solution if we are given completely arbitrary points. This isn't usually the case, for example the "aesthetic" algorithm in the illustrated in the introduction was specifically designed to yield points that form a simple polygon--it's not designed to work on arbitrary points.

But the above observation has an important consequence: The problem of generating a simple polygon can be equivalently reformulated to the problem of finding an ordering for a set of points such that the path through them is minimal. So any and all algorithms that we may devise for yielding the vertices of a simple polygon must necessarily yield points in an order such that their path is minimal.

This is something I hadn't realized when I worked on the project that inspired the first post, or when writing said post, and it narrows the solution space significantly. The options are either generating completely random points and using a TSP algorithm. Or generating points such that they will already be in an order that satisfies the TSP. An obvious way to do this is to start with some notion of circularity, as in the algorithm illustrated in the introduction for example. Another is to take a simple polygon that is trivial to randomly generate and build off of it in a way that doesn't violate the simpleness.

## Triangles

An interesting topic in computational geometry (from my perspective as someone who presently has no clue about computational geometry) is [triangulation](https://en.wikipedia.org/wiki/Polygon_triangulation), the subdivision of a simple polygon into a set of triangles. This section isn't about that, the [algorithms](https://kenclarkson.org/tri/p.pdf) with practical time complexities are beyond me at the moment, but an important result is that every simple polygon has a triangulation. That is a fancy way of saying that we can build more complex (simple) polygons from trivially simple polygons such as triangles, as was already alluded to in the last section. So let's do that!

Start with three completely random points and let them be the initial triangle. For each edge, imagine a square that has dimensions equal to the length of the edge and generate a random point inside of that square. Add them between the points of the initial triangle and you have a simple irregular hexagon. 

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="triangles"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_You might have to regenerate the illustration a couple of times to see a good example, the algorithm is not very consistent. The initial triangle has a gray outline, the squares in which the additional random points are generated have a dashed gray outline._

One could now continue this transformation recursively on the "outer sides" of the newly generated triangles, perhaps inspired by constructions like the [Koch snoflake](https://en.wikipedia.org/wiki/Koch_snowflake). Of course, this will often produce self-intersecting polygons.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="more-triangles"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_Performing the previously described steps repeatedly on the generated triangles, maximum recursion depth 3._

This (sometimes) looks cool but the result is neither a simple polynom nor particularly practical so I'll leave it at that. As an aside, this neatly shows that an arbitrary n-gon can be partitioned into no less than `n - 2` triangles.

(In case it is not obvious, note that my choice to limit the additional random points to the square that can be constructed from the length of the respective edge is arbitrary. It was inspired by [illustrations](https://en.wikipedia.org/wiki/Pythagorean_theorem#/media/File:Pythagorean.svg) of the Pythagorean theorem.)

## It's Lattice not Lettuce

According to Wikipedia, a [lattice](https://en.wikipedia.org/wiki/Lattice_(group) is an infinite set of points in the real coordinate space such that

- adding or subtracting two lattice points produces another lattice point
- the lattice points are separated by some minimum distance
- every point in the space is within some maximum distance of a lattice point

The following is an example of a lattice, with a line between randomly selected adjacent lattice points.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="lattice-example"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_The (fixed) starting point is highlighted with a colored outline. By the way, this is an example of a [random walk](https://en.wikipedia.org/wiki/Random_walk)._

Again according to the linked Wikipedia article, lattices have many applications in pure mathematics, cryptography and physics. But let's not worry about any of that, I'm talking about them here because I think they look cool. The following is an implementation of a TSP algorithm operating with [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry).

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="lattice-tsp"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

What is particularly interesting about lattices is that in this space, solutions to the TSP are no longer unique because there may be more than one shortest path between two points. For the same reason we are also losing the property of simpleness. We have abandoned Euclid and must live with the consequences. But I like the look.

## Art?

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="failed-experiment-1"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_To be expanded..._

<script type="text/javascript">
    //
    // --- utils ---
    //

    const namespace = 'http://www.w3.org/2000/svg';

    // convert relative to absolute point
    const relToAbs = (center, point) => [
        center[0] + point[0], center[1] - point[1]
    ];

    // convert absolute to relative point
    const absToRel = (center, point) => [
        point[0] - center[0], center[1] - point[1]
    ];

    // min and max inclusive
    const randomInt = (min, max) => (
        Math.floor(Math.random() * (max - min + 1) + min)  
    );

    // min inclusive, max exclusive
    const randomFloat = (min, max) => (
        Math.random() * (max - min) + min
    );

    // add up relative points
    const add = (...points) => points.reduce((acc, cur) => {
        acc[0] += cur[0];
        acc[1] += cur[1];

        return acc;
    }, [ 0, 0 ]);

    // scale a relative point by some factor
    const scale = (point, factor) => [
        Math.floor(point[0] * factor),
        Math.floor(point[1] * factor)
    ];

    // length of the line between two points (magnitude of vector between them)
    const length = (p1, p2) => Math.sqrt(
        Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
    );

    // create a new svg element of the given type with the given attributes
    // and add it to the new parent
    const addSVGElement = (parent, type, { children, ...attributes }) => {
        const element = document.createElementNS(namespace, type);

        for (const attribute in attributes) {
            element.setAttribute(attribute, attributes[attribute]);
        }

        parent.appendChild(element);
    };

    // get the center of a DOM element
    const getCenter = (element) => {
        const { height, width } = element.getBoundingClientRect();

        return [ Math.floor(width / 2), Math.floor(height / 2) ];
    };

    // wrap an array index such that going below 0 wraps around to the maximum and 
    // vice versa
    const wrapIndex = (i, max) => (
        (i < 0 ? max + i : i) % max
    );

    // get the svg path description fragment for the given bezier curve
    const getBezierDescription = (cp1, cp2, end) => (
        `C ${cp1.join(' ')}, ${cp2.join(' ')}, ${end.join(' ')} `
    );

    // this is heap's algorithm
    // https://en.wikipedia.org/wiki/Heap%27s_algorithm
    const getPermutations = (points) => {
        const result = [];

        const permute = (k, array) => {
            const swap = (i, j) => {
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            };

            if (k == 1) {
                return result.push([ ...array ]);
            }

            permute(k - 1, array);

            for (let i = 0; i < k - 1; i++) {
                if (k % 2) {
                    swap(0, k - 1);
                } else {
                    swap(i, k - 1);
                }

                permute(k - 1, array);
            }
        };

        permute(points.length, points);

        return result;
    };

    const tsp = (points, getLength = length) => {
        const permutations = getPermutations(points);

        let shortestPermutation;
        let shortestLength = Infinity;

        for (const permutation of permutations) {
            let currentLength = 0;

            for (let i = 0; i < permutation.length; i++) {
                const next = i === permutation.length - 1
                    ? permutation[0] : permutation[i + 1]

                currentLength += getLength(permutation[i], next);
            }

            if (currentLength < shortestLength) {
                shortestLength = currentLength;
                shortestPermutation = permutation;
            }
        }

        return shortestPermutation;
    };

    const rotatePoint = (point, origin, angle) => {
        const radians = angle * Math.PI / 180;

        const relative = [
            point[0] - origin[0], point[1] - origin[1]
        ];

        const rotatedRelative = [
            relative[0] * Math.cos(radians) - relative[1] * Math.sin(radians),
            relative[1] * Math.cos(radians) + relative[0] * Math.sin(radians),
        ];

        return [ rotatedRelative[0] + origin[0], rotatedRelative[1] + origin[1] ];
    };

    const angleBetween = (v1, v2) => {
        return Math.acos(
            (v1[0] * v2[0] + v1[1] * v2[1]) /
            (
                Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2)) *
                Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2))
            )
        ) / (Math.PI / 180);
    };

    const triangleIsClockwise = (triangle) => (
        (triangle[1][1] - triangle[0][1]) * (triangle[2][0] - triangle[1][0]) - (triangle[2][1] - triangle[1][1]) * (triangle[1][0] - triangle[0][0])
    ) > 0;

    // 
    // --- main api ---
    //

    const generateRandomPoints = (total, area, padding = 0) => {
        const points = [];

        for (let i = 0; i < total; i++) {
            points.push([
                randomInt(padding - area[0], area[0] - padding),
                randomInt(padding - area[1], area[1] - padding)
            ]);
        }

        return points;
    };

    // generate aesthetic random points (distribute a number of points evenly along
    // a circle, for each choose a random point some distance away from it)
    // points are relative to some center
    const generateAesteticPoints = (total, { radius = 100, spread = 20 } = {}) => {
        const points = [];

        const maxRadians = Math.PI * 2; // 360 degrees
        const randomOffset = randomFloat(0, maxRadians);
        const radianSteps = maxRadians / total;

        for (let i = 0; i < total; i++) {
            // -i to make it go clockwise, just for presentation
            const radians = (radianSteps * -i) + randomOffset;

            points.push([
                Math.floor((Math.cos(radians) * radius)) + randomInt(-spread, spread),
                Math.floor((Math.sin(radians) * radius)) + randomInt(-spread, spread),
            ]);
        }

        return points;
    };

    // for every sequential pair of points (line) get the point in the middle of them
    const getMidpoints = (points) => {
        const middles = [];

        for (let i = 0; i < points.length; i++) {
            middles.push(
                scale(add(points[i], points[wrapIndex(i + 1, points.length)]), 0.5)
            );
        }

        return middles;
    };

    const getAnchorPoints = (points, middlePoints) => {
        const anchors = [];

        for (let i = 0; i < points.length; i++) {
            // first line is p[i - 1] to p[i], second one is p[i] to p[i + 1]
            const l1 = length(points[wrapIndex(i - 1, points.length)], points[i]);
            const l2 = length(points[i], points[wrapIndex(i + 1, points.length)]);

            // ratio between the shorter and the longer line
            const factor = (l1 < l2 ? l1 / l2 : l2 / l1) / 2;

            const shorterMiddle = l1 < l2 ? (
                middlePoints[wrapIndex(i - 1, middlePoints.length)]
            ) : middlePoints[i];
            const longerMiddle = l1 > l2 ? (
                middlePoints[wrapIndex(i - 1, middlePoints.length)]
            ) : middlePoints[i];

            const vector = add(longerMiddle, scale(shorterMiddle, -1));

            anchors.push(add(scale(vector, factor), shorterMiddle));
        }

        return anchors;
    };

    const getControlPoints = (points, middlePoints, anchorPoints) => {
        const controls = [];

        for (let i = 0; i < points.length; i++) {
            const vector = add(points[i], scale(anchorPoints[i], -1));

            controls.push(add(middlePoints[wrapIndex(i - 1, middlePoints.length)], vector))
            controls.push(add(middlePoints[i], vector));
        }

        return controls;
    };

    const drawBlob = (element, points, attributes = {}) => {
        const midpoints = getMidpoints(points);
        const anchorPoints = getAnchorPoints(points, midpoints);
        const controlPoints = getControlPoints(points, midpoints, anchorPoints);
        
        let pathDescription = `M ${points[0][0]} ${points[0][1]} `;

        for (let i = 0; i < points.length; i++) {
            pathDescription += getBezierDescription(
                controlPoints[wrapIndex(i * 2 + 1, controlPoints.length)],
                controlPoints[wrapIndex(i * 2 + 2, controlPoints.length)],
                points[wrapIndex(i + 1, points.length)],
            );
        }

        const path = document.createElementNS(namespace, 'path');

        path.setAttribute('d', pathDescription);

        for (const attribute in attributes) {
            path.setAttribute(attribute, attributes[attribute]);
        }

        element.appendChild(path);
    };

    // 
    // --- visual help ---
    // 

    // draw markers at the given absolute points
    const drawMarkers = (element, points, attributes = {}) => {
        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            addSVGElement(element, 'circle', {
                cx: point[0],
                cy: point[1],
                r: 3,
                class: 'fill-transparent stroke-gray-800 dark:stroke-gray-200',
                ...attributes,
            });

            if (attributes.index !== false) {
                const text = document.createElementNS(namespace, 'text');

                text.setAttribute('x', point[0] + 9);
                text.setAttribute('y', point[1] - 4);
                text.setAttribute('class', 'dark:fill-gray-300 fill-gray-700 text-sm stroke-transparent');

                text.appendChild(document.createTextNode(i));

                for (const attribute in attributes) {
                    text.setAttribute(attribute, attributes[attribute]);
                }

                element.appendChild(text);
            }
        }
    };

    // draws a polygon through the given absolute points
    const drawPolygon = (element, points, attributes = {}) => {
        addSVGElement(element, 'polygon', {
            class: `${attributes.fill === false ? 'fill-transparent' : 'fill-gray-100 dark:fill-gray-700'}`
                + ` stroke-gray-500`,
            points: points.map((p) => `${p[0]},${p[1]}`).join(' '),
            ...attributes,
        });
    };

    class Lattice {
        static moveLeft(p) {
            return [ p[0] - 1, p[1] ];
        }

        static moveRight(p) {
            return [ p[0] + 1, p[1] ];
        }

        static moveTopLeft(p) {
            return [ p[0] - ((p[1] % 2) ? 0 : 1), p[1] - 1 ];
        }

        static moveTopRight(p) {
            return [ p[0] + ((p[1] % 2) ? 1 : 0), p[1] - 1 ];
        }

        static moveBotLeft(p) {
            return [ p[0] - ((p[1] % 2) ? 0 : 1), p[1] + 1 ];
        }

        static moveBotRight(p) {
            return [ p[0] + ((p[1] % 2) ? 1 : 0), p[1] + 1 ];
        }

        // manhattan distance
        static distance(p1, p2) {
            return Math.abs(p2[0] - p1[0]) + Math.abs(p2[1] - p1[1]);
        }

        constructor(element, horizontalGap) {
            this.element = element;

            const { height, width } = element.getBoundingClientRect();

            this.height = height;
            this.width = width;

            this.horizontalGap = horizontalGap;
            this.verticalGap = Math.cos(45 * Math.PI / 180) * horizontalGap;
        }

        get totalRows() {
            // minus one to make visualisation less cramped
            return Math.floor(this.height / this.verticalGap) - 1;
        }

        get totalCols() {
            return Math.floor(this.width / this.horizontalGap)
        }

        positionAt(x, y) {
            return [
                (
                    this.horizontalGap / 2 + x * this.horizontalGap +
                    (y % 2 ? this.horizontalGap / 2 : 0)
                ),
                this.verticalGap / 1.5 + y * this.verticalGap,
            ];
        }

        drawGrid() {
            // not sure if this would otherwise get computed for every iteration
            const totalRows = this.totalRows;
            const totalCols = this.totalCols;

            for (let i = 0; i < totalRows; i++) {
                for (let j = 0; j < totalCols; j++) {
                    const pos = this.positionAt(j, i);

                    addSVGElement(this.element, 'circle', {
                        cx: pos[0],
                        cy: pos[1],
                        r: 2,
                        class: 'dark:fill-gray-500 fill-gray-300 stroke-transparent'
                    });
                }
            }
        }

        markPoint(x, y, special = false) {
            const actual = this.positionAt(x, y);

            if (special) {
                addSVGElement(this.element, 'circle', {
                    cx: actual[0], cy: actual[1], r: 8,
                    class: 'fill-transparent stroke-indigo-500',
                });
            }

            addSVGElement(this.element, 'circle', {
                cx: actual[0], cy: actual[1], r: 4,
                class: 'fill-indigo-500 stroke-transparent',
            });            
        }

        drawLineAdjacent(p1, p2) {
            const p1Actual = this.positionAt(...p1);
            const p2Actual = this.positionAt(...p2);

            addSVGElement(this.element, 'line', {
                x1: p1Actual[0], y1: p1Actual[1], x2: p2Actual[0], y2: p2Actual[1],
                class: 'stroke-indigo-500',
            });
        }
        
        // this is terrible
        drawLine(p1, p2) {
            const equal = (p, q) => p[0] === q[0] && p[1] === q[1];

            const right = p1[0] < p2[0];
            const upwards = p1[1] > p2[1];

            const distance = Lattice.distance(p1, p2);

            let cur = p1;

            for (let i = 0; i < distance; i++) {
                if (cur[1] === p2[1]) {
                    // vertical lines are trivial, pretend points are adjacent
                    return this.drawLineAdjacent(cur, p2);
                }

                const next = upwards
                    ? (right ? Lattice.moveTopRight(cur) : Lattice.moveTopLeft(cur))
                    : (right ? Lattice.moveBotRight(cur) : Lattice.moveBotLeft(cur));

                this.drawLineAdjacent(cur, next);

                cur = next;

                if (equal(cur, p2)) {
                    return;
                }

                if (cur[1] === p2[1]) {
                    return this.drawLineAdjacent(cur, p2);
                }

                // at this point we have a line from p1 to cur

                let ccur = cur;

                // move diagonally
                for (let j = 0; j < distance; j++) {
                    ccur = upwards
                        ? (right ? Lattice.moveTopLeft(ccur) : Lattice.moveTopRight(ccur))
                        : (right ? Lattice.moveBotLeft(ccur) : Lattice.moveBotRight(ccur));

                    // when we hit something
                    if (equal(ccur, p2)) {
                        let cccur = ccur;
                        let prev;

                        // move back the same way but draw lines
                        for (let k = 0; k <= j; k++) {
                            prev = cccur;
                            cccur = upwards
                                ? (right ? Lattice.moveBotRight(cccur) : Lattice.moveBotLeft(cccur))
                                : (right ? Lattice.moveTopRight(cccur) : Lattice.moveTopLeft(cccur));
                            
                            this.drawLineAdjacent(prev, cccur);
                        }

                        return;
                    }
                }
            }
        }
    }

    //
    // --- presentation ---
    //

    {
        const element = document.getElementById('random-points');
        const center = getCenter(element);

        // generates random relative points, also illustrates radius, spread, etc.
        const generateAestheticPointsIllustrated = (total, { radius = 100, spread = 20 } = {}) => {
            const points = [];

            const initialRadians = Math.PI * 2.5;
            const maxRadians = Math.PI * 2; // 360 degrees
            const radianSteps = maxRadians / total;

            for (let i = 0; i < total; i++) {
                // -i to make it go clockwise, just for presentation
                const radians = initialRadians - (radianSteps * i);

                const initialPoint = relToAbs(center, [
                    Math.floor(Math.cos(radians) * radius),
                    Math.floor(Math.sin(radians) * radius)
                ]);

                // mark the spread around that point
                addSVGElement(element, 'circle', {
                    cx: initialPoint[0], cy: initialPoint[1],
                    r: Math.sqrt(2 * Math.pow(spread, 2)),
                    class: 'fill-gray-100 dark:fill-gray-700 stroke-gray-500',
                });

                // mark the initial point
                addSVGElement(element, 'circle', {
                    cx: initialPoint[0],
                    cy: initialPoint[1],
                    r: 3,
                    class: 'stroke-transparent fill-indigo-500',
                });

                const randomPoint = [
                    Math.floor((Math.cos(radians) * radius)) + randomInt(-spread, spread),
                    Math.floor((Math.sin(radians) * radius)) + randomInt(-spread, spread),
                ];

                const absRandomPoint = relToAbs(center, randomPoint);

                // mark the vector between initial and random point
                addSVGElement(element, 'line', {
                    x1: initialPoint[0],
                    y1: initialPoint[1],
                    x2: absRandomPoint[0],
                    y2: absRandomPoint[1],
                    class: 'stroke-indigo-500',
                });

                points.push(randomPoint);
            }

            return points;
        };

        const draw = () => {
            element.innerHTML = '';

            const radius = center[1] / 2;
            const spread = center[1] / 6;

            const points = generateAestheticPointsIllustrated(5, { radius, spread })
                .map((p) => relToAbs(center, p));

            drawPolygon(element, points, { fill: false });
            drawMarkers(element, points);

            addSVGElement(element, 'circle', {
                cx: center[0], cy: center[1], r: radius,
                class: 'fill-transparent stroke-indigo-500',
                'stroke-dasharray': '7 8'
            });
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('tsp');
        const center = getCenter(element);

        const draw = () => {
            element.innerHTML = '';

            const points = tsp(generateRandomPoints(7, center, 20))
                .map((p) => relToAbs(center, p));

            drawPolygon(element, points);
            drawMarkers(element, points);
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('triangles');
        const center = getCenter(element);

        const draw = () => {
            element.innerHTML = '';

            const triangle = generateRandomPoints(3, center, 100);
            const clockwise = triangleIsClockwise(triangle);

            const finalPolygon = [];

            for (let i = 0; i < 3; i++) {
                const first = triangle[i];
                const second = triangle[(i + 1) % 3];
                
                const third = rotatePoint(first, second, clockwise ? 270 : 90);
                const fourth = rotatePoint(second, first, clockwise ? 90 : 270);

                const randomPoint = add(first, (
                    add(
                        scale(add(second, scale(first, -1)), randomFloat(0, 1)),
                        scale(add(fourth, scale(first, -1)), randomFloat(0, 1))
                    )
                ));

                finalPolygon.push(first, randomPoint);

                drawPolygon(element, [ first, second, third, fourth ].map((p) => relToAbs(center, p)), {
                    fill: false,
                    class: 'fill-transparent stroke-gray-500',
                    'stroke-dasharray': '7 8'
                });
            }

            drawPolygon(element, finalPolygon.map((p) => relToAbs(center, p)), {
                class: 'stroke-indigo-500 fill-gray-100 dark:fill-gray-700'
            });

            drawPolygon(element, triangle.map((p) => relToAbs(center, p)), {
                fill: false,
            });
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('more-triangles');
        const center = getCenter(element);

        const draw = () => {
            element.innerHTML = '';

            const buildPolygon = (triangle, level = 0) => {
                if (level >= 3) {
                    return [];
                }

                const clockwise = triangleIsClockwise(triangle);

                const finalPolygon = [];

                for (let i = 0; level === 0 ? i < 3 : i < 2; i++) {
                    const first = triangle[i];
                    const second = triangle[(i + 1) % 3];
                    
                    const third = rotatePoint(first, second, clockwise ? 270 : 90);
                    const fourth = rotatePoint(second, first, clockwise ? 90 : 270);

                    const randomPoint = add(first, (
                        add(
                            scale(add(second, scale(first, -1)), randomFloat(0, 1)),
                            scale(add(fourth, scale(first, -1)), randomFloat(0, 1))
                        )
                    ));

                    drawPolygon(element, [ first, randomPoint, second ].map((p) => relToAbs(center, p)));

                    buildPolygon([ first, randomPoint, second ], level + 1);
                }

                return finalPolygon;
            };

            const initialTriangle = generateRandomPoints(3, center, 100);
            const polygon = buildPolygon(initialTriangle);

            drawPolygon(element, polygon.map((p) => relToAbs(center, p)), {
                class: 'stroke-indigo-500 fill-transparent'
            });
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('lattice-example');

        const draw = () => {
            element.innerHTML = '';

            const lattice = new Lattice(element, 30);

            lattice.drawGrid();

            const totalRows = lattice.totalRows;
            const totalCols = lattice.totalCols;

            let position = [
                // randomInt(0, totalCols - 1), randomInt(0, totalRows - 1)
                Math.floor(totalCols / 2), Math.floor(totalRows / 2)
            ];

            for (let i = 0; i < 16; i++) {
                if (i === 0) {
                    // mark starting position
                    lattice.markPoint(...position, true);
                }

                const direction = randomInt(0, 5);
                const previousPosition = position;

                switch (direction) {
                    case 0: position = Lattice.moveRight(position); break;
                    case 1: position = Lattice.moveLeft(position); break;
                    case 2: position = Lattice.moveTopRight(position); break;
                    case 3: position = Lattice.moveTopLeft(position); break;
                    case 4: position = Lattice.moveBotRight(position); break;
                    case 5: position = Lattice.moveBotLeft(position); break;
                }
                
                lattice.markPoint(...position, false);
                lattice.drawLineAdjacent(previousPosition, position);
            }
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('lattice-tsp');

        const draw = () => {
            element.innerHTML = '';

            const lattice = new Lattice(element, 30);

            lattice.drawGrid();

            const totalRows = lattice.totalRows;
            const totalCols = lattice.totalCols;

            let points = [];

            for (let i = 0; i < 7; i++) {
                points.push([
                    randomInt(0, totalCols - 1), randomInt(0, totalRows - 1)
                ]);

                lattice.markPoint(...points[i]);
            }

            points = tsp(points, Lattice.distance);

            for (let i = 0; i < 7 - 1; i++) {
                lattice.drawLine(points[i], points[i + 1]);
            }

            lattice.drawLine(points[0], points[points.length - 1]);
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    //
    // Art?
    //

    {
        const element = document.getElementById('failed-experiment-1');
        const center = getCenter(element);

        const draw = () => {
            element.innerHTML = '';

            const buildPolygon = (triangle, level = 0) => {
                if (level >= 3) {
                    return [];
                }

                const clockwise = triangleIsClockwise(triangle);

                const finalPolygon = [];

                for (let i = 0; level === 0 ? i < 3 : i < 2; i++) {
                    const first = triangle[i];
                    const second = triangle[(i + 1) % 3];
                    
                    const third = rotatePoint(first, second, clockwise ? 270 : 90);
                    const fourth = rotatePoint(second, first, clockwise ? 90 : 270);

                    const randomPoint = add(first, (
                        add(
                            scale(add(second, scale(first, -1)), randomFloat(0, 1)),
                            scale(add(fourth, scale(first, -1)), randomFloat(0, 1))
                        )
                    ));

                    //drawPolygon(element, [ first, randomPoint, second ].map((p) => relToAbs(center, p)), { fill: false });

                    finalPolygon.push(...buildPolygon([ first, randomPoint, second ], level + 1));

                    finalPolygon.push(first, randomPoint);
                }

                return finalPolygon;
            };

            const initialTriangle = generateRandomPoints(3, center, 100);
            const polygon = buildPolygon(initialTriangle);

            drawPolygon(element, polygon.map((p) => relToAbs(center, p)), {
                class: 'stroke-indigo-500 fill-indigo-100 dark:fill-indigo-800/50'
            });
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }
</script>

