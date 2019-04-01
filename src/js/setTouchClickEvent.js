/**
 * @fileoverview Set mouse-touch event
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var $ = require('jquery');

/**
 * Detect mobile browser
 * @private
 * @returns {boolean} Whether using Mobile browser
 */
function isMobile() {
    return /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

/**
 * For using one - Touch or Mouse Events
 * @param {jQuery|string|Element} target - Target element
 * @param {Function} handler - Handler
 * @param {object} [option] - Option
 * @param {string} option.selector - Selector
 * @param {string} option.namespace - Event namespace
 */
module.exports = function(target, handler, option) {
    var $target = $(target);
    var eventType = isMobile() ? 'touchend' : 'click';
    var selector, namespace;

    option = option || {};
    selector = option.selector || null;
    namespace = option.namespace || '';

    if (namespace) {
        eventType = eventType + '.' + namespace;
    }

    $target.on(eventType, selector, handler);
};
