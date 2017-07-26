/**
 * @fileoverview Set mouse-touch event
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var $ = require('jquery');

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
    var eventList = ['touchend', 'click'];
    var selector, namespace, events;

    option = option || {};
    selector = option.selector || null;
    namespace = option.namespace || '';

    if (namespace) {
        eventList = snippet.map(eventList, function(eventName) {
            return eventName + '.' + namespace;
        });
    }

    events = eventList.join(' ');
    $target.on(events, selector, function onceHandler(ev) {
        var newEventName = ev.type + '.' + namespace;

        handler(ev);
        $target.off(events, selector, onceHandler)
            .on(newEventName, selector, handler);
    });
};
