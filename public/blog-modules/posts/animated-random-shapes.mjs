import * as visualization from '/blog-modules/shapes/visualization.mjs';
import * as shapes from '/blog-modules/shapes/shapes.mjs';
import * as utils from '/blog-modules/shapes/utils.mjs';

{
    // const draw

    const numberOfShapes = 10;

    const svgElement = document.getElementById('random-points');
    const center = utils.getCenter(svgElement);

    const pathsAndPoints = [];

    for (let i = 0; i < numberOfShapes; i++) {
        // no offset to avoid segments where the animation folds into itself
        const points = shapes
            .generatePointsAroundCircle(7, { offset: 0 })
            .map((point) => shapes.relToAbs(center, point));

        pathsAndPoints.push({
            path: visualization.getSmoothPath(points),
            points,
        });
    }

    // add the first path to the end to make the animation loop cleanly, not great because it will
    // look like the shape is not moving for the last animation time slice
    pathsAndPoints.push(pathsAndPoints[0]);

    const animatedElement = document.getElementById('random-points-animate');
    animatedElement.setAttribute(
        'values',
        pathsAndPoints.map((it) => it.path).join(';')
    );

    console.log(pathsAndPoints);

    const durationMs =
        parseInt(
            document
                .getElementById('random-points-animate')
                .getAttribute('dur')
                .slice(0, -1), // slice off the 's' at the end
            10
        ) * 1000;
    const durationPerShapeMs = durationMs / numberOfShapes;

    const drawVisualizations = (curIndex, nextIndex) => {
        const points = pathsAndPoints[curIndex].points;
        const nextPoints = pathsAndPoints[nextIndex].points;

        const cleanupFns = [
            visualization.drawMarkers(svgElement, points),
            visualization.drawMarkers(svgElement, nextPoints, { index: false }),
        ];

        for (let i = 0; i < points.length; i++) {
            const line = visualization.drawLine(
                svgElement,
                points[i],
                nextPoints[i]
            );

            cleanupFns.push(line);
        }

        return () => cleanupFns.forEach((fn) => fn());
    };

    let curIndex = 0;
    let cleanup = drawVisualizations(curIndex, curIndex + 1);
    setInterval(() => {
        cleanup();
        curIndex = (curIndex + 1) % numberOfShapes;

        const nextIndex = (curIndex + 1) % numberOfShapes;
        cleanup = drawVisualizations(curIndex, nextIndex);
    }, durationPerShapeMs);
}
