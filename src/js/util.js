/**
 * @fileoverview Util for DatePicker component
 * @author NHN Ent. FE dev Lab. <dl_javascript@nhnent.com>
 * @dependency tui-code-snippet ^1.3.0
 */

'use strict';

var snippet = require('tui-code-snippet');

/**
 * utils
 * @namespace util
 * @ignore
 */
var util = (function() {
    /**
     * send host name
     * @ignore
     */
    function sendHostName() {
        var hostname = location.hostname;
        snippet.imagePing('https://www.google-analytics.com/collect', {
            v: 1,
            t: 'event',
            tid: 'UA-115377265-9',
            cid: hostname,
            dp: hostname,
            dh: 'date-picker'
        });
    }

    return {
        sendHostName: sendHostName
    };
})();

module.exports = util;
