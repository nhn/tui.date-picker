'use strict';

var dateUtil = require('../../js/dateUtil');

var templateUtils = {
  /**
   * weeks (templating) for date-calendar
   * @param {number} year - Year
   * @param {number} month - Month
   */
  weeks: function(year, month) {
    var weekNumber = 0;
    var weeksCount = 6; // Fix for no changing height
    var weekContexts = [];

    for (; weekNumber < weeksCount; weekNumber += 1) {
      weekContexts.push({
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
      });
    }

    return weekContexts;
  },

  /**
   * week (templating) for date-calendar
   * @param {number} currentYear 
   * @param {number} currentMonth 
   * @param {Array.<Date>} dates
   */
  week: function(currentYear, currentMonth, dates) {
    var firstDateOfCurrentMonth = new Date(currentYear, currentMonth - 1, 1);
    var lastDateOfCurrentMonth = new Date(currentYear, currentMonth, 0);
    var contexts = [];
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

      contexts.push({
        dayInMonth: date.getDate(),
        className: className,
        timestamp: date.getTime()
      });
    }

    return contexts;
  }
};

module.exports = templateUtils;
