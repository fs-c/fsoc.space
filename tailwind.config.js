const colors = require('tailwindcss/colors');

const commonHeader = (theme) => ({
    fontFamily: theme('fontFamily.serif'),
});

module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },

    mode: 'jit',

    purge: [
        './public/**/*.html',
        './src/**/*.js',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;'
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        maxWidth: 'auto',
                        h1: { ...commonHeader(theme) },
                        h2: { ...commonHeader(theme) },
                        h3: { ...commonHeader(theme) },
                        h4: { ...commonHeader(theme) },
                    },
                },
            }),
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',

            ...colors,
        },
    },
    variants: {},
};
