// min and max inclusive
export const randomInt = (min, max) => (
    Math.floor(Math.random() * (max - min + 1) + min)  
);

// min inclusive, max exclusive
export const randomFloat = (min, max) => (
    Math.random() * (max - min) + min
);

// get the center of a DOM element
export const getCenter = (element) => {
    const { height, width } = element.getBoundingClientRect();

    return [ Math.floor(width / 2), Math.floor(height / 2) ];
};
