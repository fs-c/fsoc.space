
const commonHeader = (theme) => ({
    fontFamily: theme('fontFamily.serif'),
});

module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },

    content: [
        // posts may contain inline html
        './posts/**/*.md',

        './public/**/*.html',
        './src/**/*.js',
    ],

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
            colors: {
                transparent: 'transparent',
                current: 'currentColor',
            },
        },
    },
    variants: {},
};
