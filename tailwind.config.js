module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
    content: [
        // posts may contain inline html
        './posts/**/*.md',

        // modules supporting posts may define styles as well
        './public/**/*.{html,mjs}',

        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: 'JetBrains Mono',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
    variants: {},
};
