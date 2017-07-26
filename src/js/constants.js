/**
 * @fileoverview Constants of date-picker
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

module.exports = {
    TYPE_DATE: 'date',
    TYPE_MONTH: 'month',
    TYPE_YEAR: 'year',
    TYPE_HOUR: 'hour',
    TYPE_MINUTE: 'minute',
    TYPE_MERIDIEM: 'meridiem',
    MIN_DATE: new Date(1900, 0, 1),
    MAX_DATE: new Date(2999, 11, 31),

    DEFAULT_LANGUAGE_TYPE: 'en',

    CLASS_NAME_SELECTED: 'tui-is-selected',

    CLASS_NAME_PREV_MONTH_BTN: 'tui-calendar-btn-prev-month',
    CLASS_NAME_PREV_YEAR_BTN: 'tui-calendar-btn-prev-year',
    CLASS_NAME_NEXT_YEAR_BTN: 'tui-calendar-btn-next-year',
    CLASS_NAME_NEXT_MONTH_BTN: 'tui-calendar-btn-next-month'
};
