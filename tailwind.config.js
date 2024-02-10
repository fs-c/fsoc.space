module.exports = {
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
    content: [
        // posts may contain inline html
        './posts/**/*.md',

        './public/**/*.html',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: 'JetBrains Mono',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
    variants: {},
};
