import * as visualization from '/blog-modules/shapes/visualization.mjs';
import * as shapes from '/blog-modules/shapes/shapes.mjs';
import * as utils from '/blog-modules/shapes/utils.mjs';

const generatePathsAroundCircle = (
    numberOfShapes,
    center,
    { randomizeCenter = 0, randomizeRadius = [100, 100] } = {}
) => {
    const paths = [];

    for (let i = 0; i < numberOfShapes; i++) {
        const randomizedCenter = utils.randomizePoint(center, randomizeCenter);

        const points = shapes
            .generatePointsAroundCircle(5, {
                // no offset to avoid segments where the animation folds into itself
                offset: 0,
                radius: utils.randomInt(...randomizeRadius),
            })
            .map((point) => shapes.relToAbs(randomizedCenter, point));

        paths.push(visualization.getSmoothPath(points));
    }

    // add the first path to the end to make the animation loop cleanly, not great because it will
    // look like the shape is not moving for the last animation time slice
    paths.push(paths[0]);

    return paths;
};

{
    const parentSvgElement = document.getElementById('simple-single-animation');
    const center = utils.getCenter(parentSvgElement);

    const paths = generatePathsAroundCircle(20, center, {
        randomizeRadius: [50, 100],
    });

    const animatedElement = document.getElementById(
        'simple-single-animation-animate'
    );
    animatedElement.setAttribute('values', paths.join(';'));
}

{
    const parentSvgElement = document.getElementById('multiple-animation');
    const center = utils.getCenter(parentSvgElement);

    const fillColors = [
        'fill-green-500 dark:fill-purple-900 stroke-transparent opacity-70 blur-2xl',
        'fill-blue-500 dark:fill-blue-500 stroke-transparent opacity-70 blur-2xl',
        'fill-purple-500 dark:fill-green-300 stroke-transparent opacity-70 blur-2xl',
    ];

    const numberOfBlobs = 3;
    for (let i = 0; i < numberOfBlobs; i++) {
        const parentPath = visualization.addSVGElement(
            parentSvgElement,
            'path',
            {
                class: fillColors[i],
            }
        );
        const animatedElement = visualization.addSVGElement(
            parentPath,
            'animate',
            {
                attributeName: 'd',
                dur: '50s',
                repeatCount: 'indefinite',
                values: '',
            }
        );

        const randomizedCenter =
            i === 0 ? center : utils.randomizePoint(center, 50);

        const paths = generatePathsAroundCircle(20, randomizedCenter, {
            randomizeRadius: [
                50 + (numberOfBlobs - i) * 10,
                100 + (numberOfBlobs - i) * 30,
            ],
        });

        animatedElement.setAttribute('values', paths.join(';'));
    }
}
