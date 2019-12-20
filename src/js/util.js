/**
 * @fileoverview Utils for Datepicker component
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var forEachArray = require('tui-code-snippet/collection/forEachArray');
var isHTMLNode = require('tui-code-snippet/type/isHTMLNode');
var sendHostname = require('tui-code-snippet/request/sendHostname');

var currentId = 0;

var utils = {
  /**
   * Get a target element
   * @param {Event} ev Event object
   * @returns {HTMLElement} An event target element
   */
  getTarget: function(ev) {
    return ev.target || ev.srcElement;
  },

  /**
   * Return the same element with an element or a matched element searched by a selector.
   * @param {HTMLElement|string} param HTMLElement or selector
   * @returns {HTMLElement} A matched element
   */
  getElement: function(param) {
    return isHTMLNode(param) ? param : document.querySelector(param);
  },

  /**
   * Get a selector of the element.
   * @param {HTMLElement} elem An element
   * @returns {string}
   */
  getSelector: function(elem) {
    var selector = '';
    if (elem.id) {
      selector = '#' + elem.id;
    } else if (elem.className) {
      selector = '.' + elem.className.split(' ')[0];
    }

    return selector;
  },

  /**
   * Create an unique id.
   * @returns {number}
   */
  generateId: function() {
    currentId += 1;

    return currentId;
  },

  /**
   * Create a new array with all elements that pass the test implemented by the provided function.
   * @param {Array} arr - Array that will be traversed
   * @param {function} iteratee - iteratee callback function
   * @returns {Array}
   */
  filter: function(arr, iteratee) {
    var result = [];

    forEachArray(arr, function(item) {
      if (iteratee(item)) {
        result.push(item);
      }
    });

    return result;
  },

  /**
   * Send hostname for GA
   * @ignore
   */
  sendHostName: function() {
    sendHostname('date-picker', 'UA-129987462-1');
  }
};

module.exports = utils;
