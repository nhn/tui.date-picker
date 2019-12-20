/**
 * @fileoverview Set mouse-touch event
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var on = require('tui-code-snippet/domEvent/on');
var off = require('tui-code-snippet/domEvent/off');

var mouseTouchEvent = {
  /**
   * Detect mobile browser
   * @type {boolean} Whether using Mobile browser
   * @private
   */
  _isMobile: (function() {
    return /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  })(),

  /**
   * Return a matched event type by a mouse event type
   * @param {string} type A mouse event type - mousedown, click
   * @returns {string}
   * @private
   */
  _getEventType: function(type) {
    if (this._isMobile) {
      if (type === 'mousedown') {
        type = 'touchstart';
      } else if (type === 'click') {
        type = 'touchend';
      }
    }

    return type;
  },

  /**
   * Bind touch or mouse events
   * @param {HTMLElement} element An element to bind
   * @param {string} type A mouse event type - mousedown, click
   * @param {Function} handler A handler function
   * @param {object} [context] A context for handler.
   */
  on: function(element, type, handler, context) {
    on(element, this._getEventType(type), handler, context);
  },

  /**
   * Unbind touch or mouse events
   * @param {HTMLElement} element - Target element
   * @param {string} type A mouse event type - mousedown, click
   * @param {Function} handler - Handler
   */
  off: function(element, type, handler) {
    off(element, this._getEventType(type), handler);
  }
};

module.exports = mouseTouchEvent;
