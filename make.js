var b = require('substance-bundler');

b.task('clean', function () {
    b.rm('./dist')
})

// b.task('static', function() {
//     b.copy('writer/packages/**/*.css', './dist/styles')
//     b.copy('node_modules/font-awesome', './dist/font-awesome')
//     b.copy('data', './dist/data')
// });

// this optional task makes it easier to work on Substance core
b.task('substance', function () {
    // b.make('substance', 'clean', 'browser')
    b.copy('node_modules/substance/dist', './dist/substance')
})
//
// b.task('build', ['clean', 'substance', 'static'], function () {
//     b.copy('writer/index.html', './dist/index.html')
//     b.copy('writer/styles/app.css', './dist/styles/')
//     b.js('writer/app.js', {
//         external: ['substance'],
//         commonjs: {include: ['node_modules/lodash/**']},
//         dest: './dist/app.js',
//         format: 'umd',
//         moduleName: 'app'
//     })
//
// })

b.task('default', ['substance'])
// build all
// b.task('default', ['build'])

// starts a server when CLI argument '-s' is set
// b.setServerPort(5555)
// b.serve({
//   static: true, route: '/', folder: 'dist'
// })
