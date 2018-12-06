/**
 * @fileoverview Util for DatePicker component
 * @author NHN Ent. FE dev Lab. <dl_javascript@nhnent.com>
 * @dependency tui-code-snippet ^1.5.0
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
        snippet.sendHostname('date-picker', 'UA-129987462-1');
    }

    return {
        sendHostName: sendHostName
    };
})();

module.exports = util;
