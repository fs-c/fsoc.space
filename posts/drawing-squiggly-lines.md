---
title: Drawing Squiggly Lines
date: 2022-09-20
description: Dynamically generating polygons and smoothing out their edges.
tags: [art?]
---

According to the [online cambridge dictionary](https://dictionary.cambridge.org/dictionary/english/squiggly), squiggly lines "curve and twist in a way that is not regular".

I recently came accross a [background generation](https://coolbackgrounds.io/) website that offeres a "gradient topography" variant, essentially mimicking a topograhic map, but with smoother curves and a more interesting color scheme. (For other examples of stuff in this style, see [the default backgrounds](https://512pixels.net/projects/default-mac-wallpapers-in-5k/) that come with macOS Big Sur and Monterey, for example.)

I like this style, and I wanted to create something similar, but dynamically. That is, I wanted to be able to create dynamic shapes with (seemingly) irregular but smooth curves. 

You can find my experimentation on this topic in [v0/squiggly-stuff](https://github.com/fs-c/v0/tree/master/squiggly-stuff). Initially, I was using the [canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), and most of the algorithm development was with that API. Later I switched to SVG, mostly to try out something else, but also because the canvas API is kind of cumbersome.

What follows is a presentation of a method for randomly generating polygons that is easy to parameterize and has some other useful properties. Then I'll showcase an algorithm I found on the web that smoothes out the edges of a polygon, creating the shapes we are looking for.

## Generating a Polygon

Let's start with polygons for now and worry about getting rid of the sharp edges later. We need the polygon generation to be random because it is our primary source of irregularity--the smoothing algorithm doesn't contain any randomness.

Okay, we want to randomly generate a polygon. The naiive way to go about this is to just generate some random points in a given area:

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="random-points-naiive"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

This is, as it turns out, a suboptimal solution. The generated polygons are often self intersecting, we don't want that for aesthetic reasons. Also, this way of generating points is hard to parameterize (aside from the obvious randomness). For example, assuming an ordered set of points, we might want two points that are adjacent in the set to also be close to each other in the coordinate space.

An improvement one could make is to divide the area into slices of a circle, and to generate one point per slice--while choosing the slices in clockwise or counter-clockwise order (as in, not randomly).

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="random-points-circle"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

The improved version solves the problem of generating self-interesecting polygons, but the polygons still don't look consistently good: Some more parameterization is necessary.

This concept of using a circle to ensure that the polygon not self-intersecting motivates a somewhat more complex approach: Distribute a given number of points randomly but evenly along a circle with radius `r`, then choose points some random distance (bounded by `spread`) and direction around them.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="random-points"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_Arguments to the algorithm are radius and spread. Dashed circle represents radius, solid circles represent spread. Colored dots are initial points, outlined points are the final output. Note that the initial points are spread evenly but not randomly, this was omitted for simplicity._

Now we have an algorithm that gives us random polygons that will never self-intersect, and we also have a measure of control over how the generated polygons will look like.

<div class="not-prose rounded-md grid grid-cols-3 gap-4 relative font-mono w-full h-[400px] pb-8" id="polygon-showcase-container">
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <svg  class="w-full h-full" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
</div>

_Demonstration of polygon generation, with every polygon the number of edges increase by one._

This is the algorithm that will be used for generating the shapes in the rest of this post.

## Smoothing it out

The algorithm I will be presenting here is based on a post ([archive](http://www.elvenprogrammer.org/projects/bezier/reference/)) by the late Maxim Shemanarev, known for [Anti-Grain Geometry](https://en.wikipedia.org/wiki/Anti-Grain_Geometry). It takes a polygon as input and generates [Bézier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) that smoothly interpolate it. As far as I am aware he is the inventor, I'm just presenting the idea in a different context.

We start out by getting the midpoints of the edges of our starting polygon, and connecting the midpoints of edges that share a vertex (corner). We then divide each such connecting line into two parts of the same proportionality as the edges whose midpoints it connects. We call the point between these proportional parts the anchors.

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="polygon-midpoints"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

_Points with a colored outline are midpoints, filled points divide the connecting lines between midpoints into parts proportional to the edges._

Finally, we move the connecting lines such that their anchors are at the same position as the respective vertex. The ends of these lines, the previous midpoints, now serve as control points for cubic Bezier curves. (I synchronized the previous and following illustrations, hopefully it helps to better understand the transformation.)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="polygon-smooth"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

Note that a given vertex has two control points associated with it, one for the "inbound" curve, and one for the "outbound" curve. Because these points lie on a straight line, the slope of the inbound curve is equal to that of the outbound curve at the point of contact. This also means that a pair of control points can be scaled along thir respective line to control the sharpness of the curve.

If an edge is relatively short, respectively the inbound and outbound control point of its two verteces will be "weak", that is close to the respective vertex. So a short edge will not have overblown control points that lead to curls or similar. In that same scenario, an adjacent and relatively large edge will have a relatively stronger outbound control point to make sure the curve isn't too flat at any point.

I think it's fascinating how elegantly this simple algorithm can solve such a nontrivial and abstract problem.

## The Fun Stuff

Now that we're able to generate an aesthetically fitting polygon and smooth out its curves, I'll show off some examples.

__Gradient Topograhy__ (the original goal)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="gradient-topography"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

__Outline Topography__ (a variation of the above)

<div class="not-prose relative font-mono w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded-md">
    <p class="text-sm absolute bottom-0 right-0 px-3 py-2 text-gray-500">click to regenerate</p>
    <svg class="w-full h-full dark:stroke-white"
        id="outline-topography"
        version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
</div>

That's it, for now.

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

    // 
    // --- main api ---
    //

    // generate aesthetic random points (distribute a number of points evenly along
    // a circle, for each choose a random point some distance away from it)
    // points are relative to some center
    const generateRandomPoints = (total, { radius = 100, spread = 20 } = {}) => {
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

    //
    // --- presentation ---
    //

    {
        const element = document.getElementById('random-points-naiive');
        const boundingBox = element.getBoundingClientRect();

        const generateRandomPointsNaiive = (total, area) => {
            const points = [];
            // add a safe zone around the edges to make sure markers will still
            // fit later
            const padding = 20;

            for (let i = 0; i < total; i++) {
                points.push([
                    randomInt(padding, area[0] - padding),
                    // add some extra padding at the bottom for the hint text
                    randomInt(padding, area[1] - (2 * padding))
                ]);
            }

            return points;
        };

        const draw = () => {
            const points = generateRandomPointsNaiive(5, [
                boundingBox.width, boundingBox.height
            ]);

            drawPolygon(element, points);
            drawMarkers(element, points);
        };

        draw();

        element.addEventListener('click', () => {
            element.innerHTML = '';
            draw();
        });
    }

    {
        const element = document.getElementById('random-points-circle');
        const center = getCenter(element);

        const draw = () => {
            const total = 5;
            const initialRadians = Math.PI * 1.5;
            const maxRadians = 2 * Math.PI;

            const radianSteps = maxRadians / total;

            const radius = center[1];
            const points = [];

            for (let i = 0; i < total; i++) {
                const radians = initialRadians + (i * radianSteps);

                const randomRadians = randomFloat(radians, radians - radianSteps);
                const randomMagnitude = randomFloat(0, radius);

                points.push([
                    center[0] + Math.floor(Math.cos(randomRadians) * randomMagnitude),
                    center[1] + Math.floor(Math.sin(randomRadians) * randomMagnitude),
                ]);
            }

            drawPolygon(element, points);
            drawMarkers(element, points);

            for (let i = 0; i < total; i++) {
                const radians = initialRadians - (i * radianSteps);

                addSVGElement(element, 'line', {
                    x1: center[0], y1: center[1],
                    x2: center[0] + Math.cos(radians) * center[0] * 2,
                    y2: center[1] + Math.sin(radians) * center[0] * 2,
                    class: 'stroke-indigo-500'
                });
            }
        };

        draw();

        element.addEventListener('click', () => {
            element.innerHTML = '';
            draw();
        });
    }

    {
        const element = document.getElementById('random-points');
        const center = getCenter(element);

        // generates random relative points, also illustrates radius, spread, etc.
        const generateRandomPointsWithMarkers = (total, { radius = 100, spread = 20 } = {}) => {
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

            const points = generateRandomPointsWithMarkers(5, { radius, spread })
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
        const container = document.getElementById('polygon-showcase-container');
        const elements = container.children;

        const draw = () => {
            let i = 3;

            for (const element of elements) {
                if (element.tagName !== 'svg') {
                    continue;
                }

                element.innerHTML = '';

                const center = getCenter(element);

                const radius = center[1] / 1.5;
                const spread = center[1] / 6;

                const points = generateRandomPoints(i, { radius, spread })
                    .map((p) => relToAbs(center, p));

                drawPolygon(element, points);

                i++;
            }
        };

        draw();

        container.addEventListener('click', () => {
            draw();
        });
    }

    {
        const drawFunctions = [];

        const synchronize = (element) => {
            const center = getCenter(element);

            const radius = center[1] / 2;
            const spread = center[1] / 6;

            const points = generateRandomPoints(5, { radius, spread })
                .map((p) => relToAbs(center, p));

            drawFunctions.forEach((f) => f(points))
        };

        {
            const element = document.getElementById('polygon-midpoints');
            const center = getCenter(element);

            drawFunctions.push((points) => {
                element.innerHTML = '';

                drawPolygon(element, points);
                drawMarkers(element, points, { index: false });

                const midpoints = getMidpoints(points);
                const anchorPoints = getAnchorPoints(points, midpoints);

                for (let i = 0; i < midpoints.length; i++) {
                    // draw midpoints and anchor points

                    addSVGElement(element, 'circle', {
                        cx: midpoints[i][0], cy: midpoints[i][1], r: 3,
                        class: 'fill-transparent stroke-indigo-500',
                    });

                    addSVGElement(element, 'circle', {
                        cx: anchorPoints[i][0], cy: anchorPoints[i][1], r: 3,
                        class: 'fill-indigo-500 stroke-transparent',
                    });

                    // draw lines between midpoints

                    if (i < midpoints.length - 1) {
                        addSVGElement(element, 'line', {
                            x1: midpoints[i][0], y1: midpoints[i][1],
                            x2: midpoints[i + 1][0], y2: midpoints[i + 1][1],
                            class: 'stroke-indigo-600',
                        });
                    } else {
                        addSVGElement(element, 'line', {
                            x1: midpoints[i][0], y1: midpoints[i][1],
                            x2: midpoints[0][0], y2: midpoints[0][1],
                            class: 'stroke-indigo-600',
                        });
                    }
                }
            });

            element.addEventListener('click', () => {
                synchronize(element);
            });
        }

        {
            const element = document.getElementById('polygon-smooth');

            drawFunctions.push((points) => {
                element.innerHTML = '';

                const midpoints = getMidpoints(points);
                const anchorPoints = getAnchorPoints(points, midpoints);
                const controlPoints = getControlPoints(points, midpoints, 
                    anchorPoints);
                
                let pathDescription = `M ${points[0][0]} ${points[0][1]} `;

                for (let i = 0; i < points.length; i++) {
                    pathDescription += getBezierDescription(
                        controlPoints[wrapIndex(i * 2 + 1, controlPoints.length)],
                        controlPoints[wrapIndex(i * 2 + 2, controlPoints.length)],
                        points[wrapIndex(i + 1, points.length)],
                    );
                }

                drawPolygon(element, points);
                drawMarkers(element, points, { index: false });

                // mark control points
                for (let i = 0; i < controlPoints.length; i += 2) {
                    addSVGElement(element, 'circle', {
                        cx: controlPoints[i][0], cy: controlPoints[i][1],
                        r: 3, class: 'fill-indigo-500 stroke-transparent'
                    });

                    addSVGElement(element, 'circle', {
                        cx: controlPoints[i + 1][0], cy: controlPoints[i + 1][1],
                        r: 3, class: 'fill-indigo-500 stroke-transparent'
                    });

                    addSVGElement(element, 'line', {
                        x1: controlPoints[i][0], y1: controlPoints[i][1],
                        x2: controlPoints[i + 1][0], y2: controlPoints[i + 1][1],
                        class: 'stroke-indigo-500',
                        'stroke-dasharray': '4'
                    });
                }

                addSVGElement(element, 'path', {
                    d: pathDescription,
                    class: 'stroke-indigo-500 fill-indigo-500/20',
                });
            });

            element.addEventListener('click', () => {
                synchronize(element);
            });
        }

        // suboptimal solution
        synchronize(document.getElementById('polygon-midpoints'));
    }

    {
        const colors = {
            indigo: [
                '#eef2ff',
                '#e0e7ff',
                '#c7d2fe',
                '#a5b4fc',
                '#818cf8',
                '#6366f1',
                '#4f46e5',
                '#4338ca',
                '#3730a3',
                '#312e81',
            ],
        };

        const element = document.getElementById('gradient-topography');
        const center = getCenter(element);

        const drawGradientTopography = (position) => {
            const radius = center[1] / 2.5;
            const spread = center[1] / 6;

            const points = generateRandomPoints(6, { radius, spread });

            const dark = window.matchMedia
                && window.matchMedia('(prefers-color-scheme: dark)').matches;

            // each stage should be this much larger than the previous
            const stageProportion = 0.3;

            for (let i = 4; i >= 0; i--) {
                const factor = 1 + stageProportion * i;

                drawBlob(element, points.map((p) => scale(p, factor)).map((p) => relToAbs(position, p)), {
                    class: 'stroke-transparent',
                    fill: colors.indigo[colors.indigo.length - 1 - i - (!dark && 4)],
                });
            }
        };

        const draw = () => {
            element.innerHTML = '';

            drawGradientTopography([ center[0] * 2, 0 ]);
            drawGradientTopography([ 0, center[1] * 2 ]);
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }

    {
        const element = document.getElementById('outline-topography');
        const center = getCenter(element);

        const draw = () => {
            element.innerHTML = '';

            const radius = center[1] / 3;
            const spread = center[1] / 6;

            const points = generateRandomPoints(6, { radius, spread });

            for (let i = 0; i < 8; i++) {
                const scaled = points.map((p) => scale(p, Math.pow(1.3, i)))
                    .map((p) => relToAbs(center, p));

                drawBlob(element, scaled, {
                    class: 'stroke-indigo-500 fill-transparent',

                });
            }
        };

        draw();

        element.addEventListener('click', () => {
            draw();
        });
    }
</script>
