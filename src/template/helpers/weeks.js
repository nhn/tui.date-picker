/**
 * @fileoverview Handlebars helper - weeks (templating) for date-calendar
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dateUtil = require('../../js/dateUtil');

module.exports = function(year, month, options) {
    var weekNumber = 0;
    var weeksCount = 6; // Fix for no changing height
    var out = '';
    var weekContext;

    for (; weekNumber < weeksCount; weekNumber += 1) {
        weekContext = {
            year: year,
            month: month,
            dates: [
                dateUtil.getDateOfWeek(year, month, weekNumber, 0),
                dateUtil.getDateOfWeek(year, month, weekNumber, 1),
                dateUtil.getDateOfWeek(year, month, weekNumber, 2),
                dateUtil.getDateOfWeek(year, month, weekNumber, 3),
                dateUtil.getDateOfWeek(year, month, weekNumber, 4),
                dateUtil.getDateOfWeek(year, month, weekNumber, 5),
                dateUtil.getDateOfWeek(year, month, weekNumber, 6)
            ]
        };
        out += options.fn(weekContext);
    }

    return out;
};
