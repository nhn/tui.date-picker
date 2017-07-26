/**
 * @fileoverview Handlebars helper - unique id
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var uniqueId = 0;

/**
 * Returns unique id
 * @returns {number}
 */
module.exports = function() {
    uniqueId += 1;

    return uniqueId;
};
