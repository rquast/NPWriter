import sass from 'rollup-plugin-sass';
import resolve from 'rollup-plugin-node-resolve';
import eslint from 'rollup-plugin-eslint';
import commonjs from 'rollup-plugin-commonjs';

export default {
    // tell rollup our main entry point
    entry: 'app.js',
    dest: 'writer/rollup-bundle.js',
    format: 'iife',
    sourceMap: 'inline',
    plugins: [
        // resolve({
        //     jsnext: true,
        //     main: true,
        //     browser: true,
        // }),
        commonjs(),
        sass({
            extensions: [ '.scss' ],
            output: 'style.css'
        }),
        eslint({
            exclude: [
                'src/styles/**',
            ]
        }),
    ]
}