var DatePicker = require('../src/datepicker');

describe('datepicker', function() {
    var calendar, $inputEl;
    beforeEach(function() {
        $inputEl = $('<div><input></div>').find('input');
        calendar = new tui.component.Calendar({
            element: $('<div>')
        });
    });

    it('should set blank-input if the initial date is not selectable', function() {
        var today = new Date();
        var startDateHash = {year: 2000, month: 1, date: 1};
        var todayDateHash = {year: today.getFullYear(), month: today.getMonth() - 1, date: today.getDate()};
        var picker = new DatePicker({
            element: $inputEl,
            date: {year: today.getFullYear() + 1, month: 1, date: 1},
            selectableRanges: [
                [startDateHash, todayDateHash]
            ]
        }, calendar);

        expect(picker._date).toBeNull();
    });

    it('should have selectable 2015(year) if the selectable-range is 2015/03 ~ 2015/04', function() {
        var picker = new DatePicker({
            element: $inputEl,
            dateForm: 'yyyy-mm',
            selectableRanges: [
                [{year: 2015, month: 3}, {year: 2015, month: 4}]
            ]
        }, calendar);

        expect(picker._isSelectable({year: 2015}, 'year')).toBe(true);
    });

    it('should be selectable 2015-04(month) if the selectable-range is 2015/03/12 ~ 2015/03/21', function() {
        var picker = new DatePicker({
            element: $inputEl,
            dateForm: 'yyyy-mm',
            selectableRanges: [
                [{year: 2015, month: 3, date: 12}, {year: 2015, month: 3, date:21}]
            ]
        }, calendar);

        expect(picker._isSelectable({year: 2015, month: 3}, 'month')).toBe(true);
    });
});
