---
title: More Tinkering with Random Shapes
date: 2022-10-29
description: Thoughts and visualisations loosely related to randomly generating simple polygons.
tags: [art?]
---

In a [recent post](https://fsoc.space/words/drawing-squiggly-lines) I talked about generating random shapes. The goal was to generate aesthetically consistent but still random shapes with smooth curves. One of the primary challenges was generating polygons which would not self-intersect (for aesthetic reasons). To get an idea for what I'm talking about, the following is an interactive illustration of the algorithm I ended up designing and using, taken from the linked post.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="random-points"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

This is a sort of addendum to that one, talking about some other stuff related to generating simple polygons that wasn't included previously. So the first section talks about the travelling salesman problem and its relation to simple polygons. The following section briefly explores a trivial algorithm that uses triangles to build polygons. The final section explores _triangular lattices_, a really cool construct, in which we will build polygons. 

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

This is something I hadn't fully realized when I worked on the project that inspired the first post, and it narrows the solution space significantly. The options are either generating completely random points and using a TSP algorithm. Or generating points such that they will already be in an order that satisfies the TSP. An obvious way to do this is to start with some notion of circularity, as in the algorithm illustrated in the introduction for example. Another is to take a simple polygon that is trivial to randomly generate and build off of it in a way that doesn't violate the simpleness.

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

Again according to the linked Wikipedia article, lattices have many applications in pure mathematics, cryptography and physics. But we won't worry about any of that now, I'm talking about them here because I think they look cool.

So let's draw some shapes in a lattice. Of course, we can't just generate points and draw straight lines between them--we need to construct our lines by connecting adjacent lattice points. As far as we're concerned, nothing but these points exists, and we can't draw on nothing.

Let's build an algorithm that can connect two arbitrary lattice points (just called points, from now on), and later use it to write an algorithm for drawing arbitrary shapes. The algorithm we are looking for will return a polyline of minimal length such that it connects two given points without "leaving" the lattice. 

A [polyline](https://en.wikipedia.org/wiki/Polygonal_chain (or polygonal chain) is a sequence of straght lines. The maximum number of points that a polyline returned by our algorithm will contain is three--one for origin and destination respectively and optionally one to account for vertical movement that isn't diagonal to the origin.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="lattice-adjacent-line"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_A polyline of length four, between the center and a randomly selected point (marked with a colored outline) around it. Thicker gray circles mark all points that are four units removed from the center. Gray outlines mark points that were stepped through or considered. Note that diagonal movement requires steps and checks all the way, but horizontal movement is done in one step/check._

We first check if the two points (origin and destination) are in a horizontal line, this case is trivial. If they aren't, we will move a "cursor" in incremental steps from the origin in the direction of the destination, so right/left and upwards/downwards. After each step in this direction we check if the destination is in a horizontal line with the cursor. If it isn't we also check if it is in the diagonal opposite to our horizontal direction of movement. So if we are currently stepping to the top right, we would start stepping to the top left to see if we hit the destination.

The distance between the two points determines the amount of steps we need. So if we have a distance of seven and are on the third step in our primary direction, we only need to search for four steps in our off direction.

I have written a [separate post](/words/minimum-distance-triagonal-lattice) about finding the distance between two lattice points. The following is an implementation of a TSP algorithm operating with this custom distance function.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="lattice-tsp"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

What is particularly interesting about lattices is that in this space, solutions to the TSP are no longer unique because there may be more than one shortest path between two points. For the same reason we are also losing the property of simpleness. We have abandoned Euclid and must live with the consequences. But I like the look.

## Art?

__Recursive Triangles__ (a failed experiment)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="failed-experiment-1"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

__Rounded TSP__ (with opacity steps)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="rounded-tsp"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

__Rounded Lattice__ (racetrack, anyone?)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="rounded-lattice-tsp"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

__Random Lattice Marketing__

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="z-0 absolute top-0 left-0 w-full h-full dark:stroke-white"
        id="random-lattice-marketing"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <h1 class="text-indigo-600  z-10 text-5xl font-black font-sans text-center">
        Connecting the Dots
    </h1>
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

    const equal = (p1, p2) => p1[0] === p2[0] && p1[1] === p2[1];

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

        static distance(op1, op2) {
            const toLinear = (p) => {
                const offset = Math.floor(p[1] / 2);

                return [ p[0] - offset, p[1] ];
            };

            const p1 = toLinear(op1);
            const p2 = toLinear(op2);

            const p = [ ...p1, -p1[0] - p1[1] ];
            const q = [ ...p2, -p2[0] - p2[1] ];

            return Math.max(0, p[0] - q[0]) + Math.max(0, p[1] - q[1])
                + Math.max(0, p[2] - q[2]);
        }

        static manhattanDistance(p1, p2) {
            return Math.abs(p1[1] - p2[1]) + Math.abs(p1[0] - p2[0]);
        }

        static getStepper(right, vertical) {
            return (
                vertical === 'up' ? (
                    right ? Lattice.moveTopRight : Lattice.moveTopLeft
                ) : vertical === 'down' ? (
                    right ? Lattice.moveBotRight : Lattice.moveBotLeft
                ) : (
                    right ? Lattice.moveRight : Lattice.moveLeft
                )
            );
        }

        // get all points a given distance away from p
        static getAdjacentPoints(point, distance) {
            const points = [];

            // adjacent points will make up a hexagon, first get the edges of the
            // hexagon

            for (let direction = 0; direction < 6; direction++) {
                let p = point;
                
                for (let i = 0; i < distance; i++) {
                    switch (direction) {
                        case 0: p = Lattice.moveTopLeft(p); break;
                        case 1: p = Lattice.moveTopRight(p); break;
                        case 2: p = Lattice.moveRight(p); break;
                        case 3: p = Lattice.moveBotRight(p); break;
                        case 4: p = Lattice.moveBotLeft(p); break;
                        case 5: p = Lattice.moveLeft(p); break;
                    }
                }

                points.push(p);
            }

            const adjacent = [];

            // then fill in the other points

            for (let i = 0; i < points.length; i++) {
                const from = points[i];
                const to = (i + 1 === points.length) ? points[0] : points[i + 1];

                const right = from[0] === to[0]
                    ? from[1] % 1 : from[0] < to[0];
                const vertical = from[1] === to[1] ? 'none'
                    : from[1] > to[1] ? 'up' : 'down';

                const stepToNext = Lattice.getStepper(right, vertical);

                let cursor = from;

                for (let j = 0; j < distance; j++) {
                    adjacent.push(cursor);

                    cursor = stepToNext(cursor);
                }
            }

            return adjacent;
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

        markPoint(x, y, special = false, attributes = {}) {
            const actual = this.positionAt(x, y);

            if (special) {
                addSVGElement(this.element, 'circle', {
                    cx: actual[0], cy: actual[1], r: 8,
                    class: 'fill-transparent stroke-indigo-500',
                    ...attributes,
                });
            }

            addSVGElement(this.element, 'circle', {
                cx: actual[0], cy: actual[1], r: 4,
                class: 'fill-indigo-500 stroke-transparent',
                ...attributes,
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

        // returns the points of the polyline between from and to, might just 
        // return [from, to]. if `returnConsidered` is true, will return an object
        // { polyline: ..., considered: ... } where considered is an array of points
        // that the cursor was on
        getPolylineBetween(from, to, returnConsidered) {
            // if the points lie on a horizontal line already, we're done
            if (from[1] === to[1]) {
                const polyline = [ from, to ];

                return returnConsidered ? { polyline, considered: [] } : polyline;
            }

            // attempt to reach `to` through following the lattice
            // if we need to make a bend, we will return it

            // `to` is to the right of `from`
            const moveRight = from[0] === to[0]
                ? from[1] % 1 : from[0] < to[0];
            // `to` is above `from`
            const moveUpwards = from[1] > to[1];

            const getStepper = (right = moveRight, upwards = moveUpwards) => (
                upwards ? (
                    right ? Lattice.moveTopRight : Lattice.moveTopLeft
                ) : (
                    right ? Lattice.moveBotRight : Lattice.moveBotLeft
                )
            );

            const stepToNext = getStepper();

            // in total, we will need exactly this many steps
            const distance = Lattice.distance(from, to);

            let cursor = from;
            let innerCursor = from;

            // only relevant if `returnConsidered`
            const considered = [];

            // move diagonally in the target direction, innerCursor will be set
            // to null in an inner loop to indicate that we want to break out
            for (let j = 0; j < distance && innerCursor; j++) {
                cursor = stepToNext(cursor);

                // if we were able to hit `to` by moving diagonally, we're done
                if (equal(cursor, to)) {
                    const polyline = [ from, to ]

                    return returnConsidered ? { considered, polyline } : polyline;
                }

                considered.push(cursor);

                // cursor and to are in a horizontal line
                if (cursor[1] === to[1]) {
                    const polyline = [ from, cursor, to ];

                    return returnConsidered ? { considered, polyline } : polyline;
                }

                const innerStepToNext = getStepper(!moveRight);

                innerCursor = cursor;

                // if we can reach it diagonally we add an edge and are done
                for (let k = 0; k < distance - j - 1; k++) {
                    innerCursor = innerStepToNext(innerCursor);

                    considered.push(innerCursor);

                    // if we hit the point, return the 'pivot' edge
                    if (equal(innerCursor, to)) {
                        const polyline = [ from, cursor, to ];

                        return returnConsidered
                            ? { considered, polyline } : polyline;
                    }
                }
            }
    
            throw new Error('could not find polyline');
        }

        // get the points of a polygon that touches all of the given lattice points
        // and that, when drawn, lies the lattice
        getPolygon(points) {
            const polygon = [];

            for (let i = 0; i < points.length; i++) {
                const cur = points[i];
                const next = (i + 1) === points.length ? points[0] : points[i + 1];

                const polyline = this.getPolylineBetween(cur, next);

                polygon.push(polyline[0]);

                if (polyline.length === 3) {
                    polygon.push(polyline[1]);
                }
            }

            return polygon;
        }

        drawRoundedShape(points) {
            const polygon = this.getPolygon(points);

            // round the edges of the generated polygon (we first draw the curves
            // and keep track of the straight lines to add in later)

            const center = getCenter(this.element);

            const lines = [];

            for (let i = 0; i < polygon.length; i++) {
                const prev = absToRel(center, this.positionAt(...(
                    i === 0 ? polygon[polygon.length - 1] : polygon[i - 1])
                ));

                const cur = absToRel(center, this.positionAt(...polygon[i]));

                const next = absToRel(center, this.positionAt(
                    ...polygon[(i + 1) % polygon.length]
                ));

                const back = add(prev, scale(cur, -1));
                const front = add(next, scale(cur, -1));

                const subStep = this.horizontalGap / 2;

                const scaledBack = scale(back, subStep / length(cur, prev));
                const scaledFront = scale(front, subStep / length(cur, next));

                const start = relToAbs(center, add(cur, scaledBack));
                const middle = relToAbs(center, cur);
                const end = relToAbs(center, add(cur, scaledFront));

                lines.push(start, end);

                addSVGElement(this.element, 'path', {
                    d: `M ${start[0]} ${start[1]} Q ${middle[0]} ${middle[1]} ${end[0]} ${end[1]}`,
                    class: 'fill-transparent stroke-indigo-500 stroke-4',
                });
            }

            for (let i = 0; i < lines.length; i += 2) {
                const l1 = lines[(i + 1) % lines.length];
                const l2 = lines[(i + 2) % lines.length];

                addSVGElement(this.element, 'line', {
                    x1: l1[0], x2: l2[0], y1: l1[1], y2: l2[1],
                    class: 'stroke-gray-500 stroke-4',
                });
            };
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
        const element = document.getElementById('lattice-adjacent-line');

        let adjacentCache;

        const draw = () => {
            element.innerHTML = '';

            const lattice = new Lattice(element, 30);

            lattice.drawGrid();

            const center = [
                Math.floor(lattice.totalCols / 2), Math.floor(lattice.totalRows / 2)
            ];

            lattice.markPoint(...center);

            const adjacent = adjacentCache = adjacentCache ||
                Lattice.getAdjacentPoints(center, 4);
            const targetIndex = randomInt(0, adjacent.length - 1);

            for (let i = 0; i < adjacent.length; i++) {
                const p = adjacent[i];
                
                if (i === targetIndex) {
                    lattice.markPoint(...p, true);
                } else {
                    lattice.markPoint(...p, false, {
                        class: 'fill-gray-400 dark:fill-gray-500 stroke-transparent'
                    });
                }
            }

            const target = adjacent[targetIndex];
            const { polyline, considered } = lattice.getPolylineBetween(center,
                target, true);

            for (let i = 0; i < polyline.length - 1; i++) {
                const c = lattice.positionAt(...polyline[i]);
                const n = lattice.positionAt(...polyline[i + 1]);
    
                addSVGElement(element, 'line', {
                    x1: c[0], y1: c[1], x2: n[0], y2: n[1],
                    class: 'stroke-indigo-500',
                });
            }

            for (const consideredPoint of considered) {
                const p = lattice.positionAt(...consideredPoint);

                addSVGElement(element, 'circle', {
                    r: 8, cx: p[0], cy: p[1],
                    class: 'fill-transparent dark:stroke-gray-500 stroke-gray-400'
                });
            };
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

            points = lattice.getPolygon(tsp(points, Lattice.distance))
                .map((p) => lattice.positionAt(...p));

            drawPolygon(element, points, {
                fill: false, class: 'stroke-indigo-500 fill-transparent'
            });
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

    {
        const element = document.getElementById('rounded-tsp');
        const center = getCenter(element);

        const drawGradientTopography = (points) => {
            const radius = center[1] / 2.5;
            const spread = center[1] / 6;

            // each stage should be this much larger than the previous
            const stageProportion = 0.3;

            for (let i = 4; i >= 0; i--) {
                const factor = 1 + stageProportion * i;

                drawBlob(element, points.map((p) => scale(p, factor)).map((p) => relToAbs(center, p)), {
                    class: `stroke-transparent fill-indigo-500/30 dark:fill-indigo-600/30`,
                });
            }
        };

        const draw = () => {
            element.innerHTML = '';

            const points = tsp(generateRandomPoints(7, center, 20));

            drawGradientTopography(points);
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('rounded-lattice-tsp');
        const center = getCenter(element);

        const draw = () => {
            element.innerHTML = '';

            const lattice = new Lattice(element, 30);

            const totalRows = lattice.totalRows;
            const totalCols = lattice.totalCols;

            let points = [];

            for (let i = 0; i < 7; i++) {
                const random = [
                    randomInt(0, totalCols - 1), randomInt(0, totalRows - 1)
                ];

                if (!points.filter((p) => p[0] === random[0] && p[1] === random[1]).length) {
                    points.push(random);
                }
            }

            points = tsp(points, Lattice.distance);
            
            lattice.drawRoundedShape(points);
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('random-lattice-marketing');
        const center = getCenter(element);

        const draw = () => {
            element.innerHTML = '';

            const lattice = new Lattice(element, 30);

            const totalRows = lattice.totalRows;
            const totalCols = lattice.totalCols;

            lattice.drawGrid();

            for (let i = 0; i < 4; i++) {
                const p1 = [
                    randomInt(0, totalCols - 1), randomInt(0, totalRows - 1),
                ];

                const p2 = [
                    randomInt(0, totalCols - 1), randomInt(0, totalRows - 1),
                ];

                lattice.markPoint(...p1);
                lattice.markPoint(...p2);

                const polyline = lattice.getPolylineBetween(p1, p2)
                    .map((p) => lattice.positionAt(...p));

                for (let i = 0; i < polyline.length - 1; i++) {
                    const c = polyline[i];
                    const n = polyline[i + 1];
                    
                    addSVGElement(element, 'line', {
                        x1: c[0], y1: c[1], x2: n[0], y2: n[1],
                        class: 'stroke-indigo-500/25 stroke-2'
                    });
                }
            }
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }
</script>

