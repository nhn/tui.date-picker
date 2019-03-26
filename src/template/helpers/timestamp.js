/**
 * @fileoverview Handlebars helper - timestamp
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

/**
 * Return timestamp
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {number}
 */
module.exports = function(year, month) {
    return new Date(year, month, 1).getTime();
};
