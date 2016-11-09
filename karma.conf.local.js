module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['browserify', 'jasmine'],

        files: [
            'bower_components/jquery/jquery.min.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/tui-code-snippet/code-snippet.js',
            'bower_components/tui-component-calendar/dist/calendar.min.js',
            'src/*.js',
            'test/*.spec.js',
            {
                pattern: 'test/fixtures/*.html',
                included: false
            },
            {
                pattern: 'test/css/*.css',
                included: false
            }
        ],

        exclude: [
        ],

        preprocessors: {
            'test/*.js': ['browserify'],
            'src/*.js': ['browserify', 'coverage']
        },

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

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: [
            'Chrome',
            'PhantomJS'
        ],

        singleRun: false
    });
};
