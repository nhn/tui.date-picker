// Karma configuration
// Generated on Tue Apr 28 2015 17:35:38 GMT+0900 (KST)
module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'bower_components/jquery/jquery.min.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/tui-code-snippet/code-snippet.min.js',
            //'bower_components/tui-component-calendar/calendar.min.js',
            'samples/js/calendar.js',

            //'src/spinbox.js',
            //'src/timepicker.js',
            //'src/datepicker.js',
            'src/datepicker.js',

            'test/fixtures/**/*.html',
            'test/css/**/*.css',
            'test/**/*.test.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/**/*.test.js': ['browserify'],
            'src/**/*.js': ['browserify', 'coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'dots',
            'coverage',
            'junit'
        ],

        junitReporter: {
            outputDir: 'report',
            outputFile: 'report/junit-result.xml',
            suite: ''
        },

        coverageReporter: {
            dir: 'report/coverage/',
            reporters: [
                {
                    type: 'html',
                    subdir: function (browser) {
                        return 'report-html/' + browser;
                    }
                },
                {
                    type: 'cobertura',
                    subdir: function (browser) {
                        return 'report-cobertura/' + browser;
                    },
                    file: 'cobertura.txt'
                }
            ]
        },

        browserify: {
            debug: true
        },

        //junitReporter: {
        //    outputFile: 'report/junit-result.xml',
        //    suite: ''
        //},

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'Chrome'
        ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
