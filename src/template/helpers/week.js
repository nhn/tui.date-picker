/**
 * @fileoverview Handlebars helper - week (templating) for date-calendar
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

module.exports = function(currentYear, currentMonth, dates, options) {
    var firstDateOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    var lastDateOfCurrentMonth = new Date(currentYear, currentMonth, 0);
    var out = '';
    var i = 0;
    var length = dates.length;
    var date, className;

    for (; i < length; i += 1) {
        className = 'tui-calendar-date';
        date = dates[i];

        if (date < firstDateOfCurrentMonth) {
            className += ' tui-calendar-prev-month';
        }

        if (date > lastDateOfCurrentMonth) {
            className += ' tui-calendar-next-month';
        }

        switch (date.getDay()) {
            case 0:
                className += ' tui-calendar-sun';
                break;
            case 6:
                className += ' tui-calendar-sat';
                break;
            default:
                break;
        }

        out += options.fn({
            dayInMonth: date.getDate(),
            className: className,
            timestamp: date.getTime()
        });
    }

    return out;
};
