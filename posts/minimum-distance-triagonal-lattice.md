---
title: Minimum Distance Between Two Points in a Nonlinear Triagonal Lattice
date: 2022-10-28
description:
---

This is a short post, somewhat related to [this one](/words/minimum-distance-triagonal-lattice). I had a hard time figuring this out, particularly because there weren't any good search results for the obvious terms. Hopefully the post improves searchability.

Consider a nonlinear [lattice](https://en.wikipedia.org/wiki/Lattice) like the following. (I am calling it nonlinear because the coordinates are not linear, for example we would expect `(1, 2)` to be `(0, 2)` because it is twice the point `(0, 1)`, etc.)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="lattice-illustration"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_In a linear system all points along the marked lines, and those along all lines parallel to them, must be multiples of each other._

We want to find a formula for calculating the distance between two arbitrary points, naturally without leaving the lattice. [This answer](https://math.stackexchange.com/a/4187505/1112879) on the math stackexchange goes in the right direction, it gives us a formula for calculating the distance between two points in a linear lattice. It's well written and I don't want to pointlessly repeat it. The gist is that we represent an n-dimensional grid as a subset `L` of `Z^(n + 1)`. For a two-dimensional grid we can map a linear point `(x, y)` to `(x, y, -x-y) in L`. The distance formula is then

```
d(p, q) = max(0, p.x - q.x) + max(0, p.y - q.y) + max(0, p.z - q.z)
```

The important point that it doesn't make is the often trivial conversion from nonlinear to linear coordinates. For example, to convert nonlinear coordinates of the above lattice into linear ones:

```
(x, y) --> (x - floor(y / 2), y)
```

This allows us to use the above distance calculations with nonlinear coordinates by simply converting them temporarily.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="distance-illustration"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_Distance between randomly generated points. The value in braces is the [Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)._

As always, to take a look at the code behind the illustrations on this post either follow the "Edit on github" link at the top or open your devtools, its plain vanilla non-minified JavaScript.

<script type="text/javascript">
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

    const equal = (p1, p2) => p1[0] === p2[0] && p1[1] === p2[1];

    // create a new svg element of the given type with the given attributes
    // and add it to the new parent
    const addSVGElement = (parent, type, { children = [], ...attributes }) => {
        const element = document.createElementNS(namespace, type);

        for (const attribute in attributes) {
            element.setAttribute(attribute, attributes[attribute]);
        }

        for (const child of children) {
            element.appendChild(child);
        }

        parent.appendChild(element);
    };

     // length of the line between two points (magnitude of vector between them)
    const length = (p1, p2) => Math.sqrt(
        Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
    );

    // get the center of a DOM element
    const getCenter = (element) => {
        const { height, width } = element.getBoundingClientRect();

        return [ Math.floor(width / 2), Math.floor(height / 2) ];
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

        drawGrid({ positions = false } = {}) {
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

                    if (positions) {
                        addSVGElement(this.element, 'text', {
                            x: pos[0] - 20, y: pos[1] + 18,
                            class: 'text-xs fill-gray-400 stroke-transparent',
                            children: [
                                document.createTextNode(`(${j}, ${i})`)
                            ]
                        })
                    }
                }
            }
        }

        markPoint(x, y, {
            highlight = false, position = false
        } = {}, attributes = {}) {
            const actual = this.positionAt(x, y);

            if (highlight) {
                addSVGElement(this.element, 'circle', {
                    cx: actual[0], cy: actual[1], r: 8,
                    class: 'fill-transparent stroke-indigo-500',
                    ...attributes,
                });
            }

            if (position) {
                addSVGElement(this.element, 'text', {
                    x: actual[0] - 20, y: actual[1] + 18,
                    class: 'text-xs fill-gray-400 stroke-transparent',
                    children: [
                        document.createTextNode(`(${x}, ${y})`)
                    ]
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
                    class: 'fill-transparent stroke-indigo-500',
                });
            }

            for (let i = 0; i < lines.length; i += 2) {
                const l1 = lines[(i + 1) % lines.length];
                const l2 = lines[(i + 2) % lines.length];

                addSVGElement(this.element, 'line', {
                    x1: l1[0], x2: l2[0], y1: l1[1], y2: l2[1],
                    class: 'stroke-gray-500',
                });
            };
        }
    }

    {
        const element = document.getElementById('lattice-illustration');

        const draw = () => {
            element.innerHTML = '';

            const lattice = new Lattice(element, 60);

            const totalCols = lattice.totalCols;
            const totalRows = lattice.totalRows;

            for (let i = 0; i < totalCols; i++) {
                const originPos = lattice.positionAt(i, 0);
                const destPos = lattice.positionAt(
                    Math.floor(i + (totalRows) / 2),
                    totalRows
                );

                addSVGElement(element, 'line', {
                    x1: originPos[0], y1: originPos[1],
                    x2: destPos[0], y2: destPos[1],
                    class: 'stroke-gray-300/75 dark:stroke-gray-500/50'
                });
            }

            lattice.drawGrid({ positions: true });
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('distance-illustration');

        const getDistance = (op1, op2) => {
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
        };

        const draw = () => {
            element.innerHTML = '';

            const lattice = new Lattice(element, 40);

            const getRandomPoint = () => [
                randomInt(0, lattice.totalCols - 1),
                randomInt(0, lattice.totalRows - 1)
            ];
        
            lattice.drawGrid();

            const p1 = getRandomPoint();
            const p2 = getRandomPoint();

            lattice.markPoint(...p1, { position: true });
            lattice.markPoint(...p2, { position: true });

            const polyline = lattice.getPolylineBetween(p1, p2)
                .map((p) => lattice.positionAt(...p));

            for (let i = 0; i < polyline.length - 1; i++) {
                const c = polyline[i];
                const n = polyline[i + 1];
                
                addSVGElement(element, 'line', {
                    x1: c[0], y1: c[1], x2: n[0], y2: n[1],
                    class: 'stroke-indigo-500'
                });
            }

            const manhattanDistance = Lattice.manhattanDistance(p1, p2);
            const distance = getDistance(p1, p2);

            const textPosition = polyline[2] ? (
                [ polyline[1][0] + 10, polyline[1][1] - 10 ]
            ) : [
                Math.round((polyline[0][0] + polyline[1][0]) / 2),
                Math.round((polyline[0][1] + polyline[1][1]) / 2)
            ];

            addSVGElement(element, 'text', {
                x: textPosition[0], y: textPosition[1],
                class: 'text-xs stroke-transparent dark:fill-gray-200 fill-gray-800',
                children: [
                    document.createTextNode(`${distance} (${manhattanDistance})`)
                ]
            });
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }
</script>
