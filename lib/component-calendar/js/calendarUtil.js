/**
 * 캘린더 유틸성 함수들
 *
 * @module ne.component.Calendar.Util
 * @author FE개발팀 이제인
 */
ne.component.Calendar.Util = {/** @lends ne.component.Calendar.Util */
    /**
     * 날짜 해시(년, 월, 일) 값을 만들어 리턴한다
     *
     * @method getDateHashTable
     * @param {Date} date 날짜해시를 뽑아날 날짜 데이터 *
     * @returns {{year: *, month: *, date: *}}
     */
    getDateHashTable : function(date) {
        if (arguments.length == 3) {
            return {
                year: arguments[0],
                month: arguments[1],
                date: arguments[2]
            };
        }
        if (arguments.length <= 1) {
            date = date || new Date();
        }
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate()
        };
    },
    /**
     * 컨퍼넌트에 저장된 현재날짜를 돌려준다
     * 현재 날짜가 없을 시, 로컬시간 기준으로 새로 생성하여 돌려준다.
     *
     * @method getToday
     * @static
     * @returns {{year: *, month: *, date: *}}
     */
    getToday: function() {
        var today = this._today || ne.component.Calendar.Util.getDateHashTable(new Date());
        return {
            year: today.year,
            month: today.month,
            date: today.date
        };
    },
    /**
     * today값을 설정한다.
     *
     * @method setToday
     * @static
     * @param {String} year
     * @param {String} month
     * @param {String} date
     * @returns {ne.component}
     */
    setToday: function(year, month, date) {
        if (!this._today) {
            this._today = {};
        }
        this._today.year = year;
        this._today.month = month;
        this._today.date = date;
        return this;
    },
    /**
     * 해당 연월의 주의 수를 구한다.
     *
     * @method getWeeks
     * @static
     * @param {Number} year 년
     * @param {Number} month 월
     * @return {Number} 주 (4~6)
     **/
    getWeeks: function(year, month) {
        var firstDay = this.getFirstDay(year, month),
            lastDate = this.getLastDate(year, month);

        return Math.ceil((firstDay + lastDate) / 7);
    },
    /**
     * 연월일을 포함한 HashTable로부터 유닉스타임을 구한다.
     *
     * @method getTime
     * @static
     * @param {Object} date 날짜 정보가 담긴 객체
     * @param {Number} date.year 년
     * @param {Number} date.month 월
     * @param {Number} date.date 일
     * @return {Number} 유닉스타임 정보
     * @example
     * ne.component.Calendar.Util.getTime({year:2010, month:5, date:12}); // 1273590000000
     **/
    getTime: function(date) {
        return this.getDateObject(date).getTime();
    },
    /**
     * 해당 연월의 첫번째 날짜의 요일을 구한다.
     *
     * @method getFirstDay
     * @static
     * @param {Number} year 년
     * @param {Number} month 월
     * @return {Number} 요일 (0~6)
     **/
    getFirstDay: function(year, month) {
        return new Date(year, month - 1, 1).getDay();
    },
    /**
     * 해당 연월의 마지막 날짜의 요일을 구한다.
     *
     * @method getLastDay
     * @static
     * @param {Number} year 년
     * @param {Number} month 월
     * @return {Number} 요일 (0~6)
     **/
    getLastDay: function(year, month) {
        return new Date(year, month, 0).getDay();
    },
    /**
     * 해당 연월의 마지막 날짜를 구한다.
     *
     * @method getLastDate
     * @static
     * @param {Number} year 년
     * @param {Number} month 월
     * @return {Number} 날짜 (1~31)
     **/
    getLastDate: function(year, month) {
        return new Date(year, month, 0).getDate();
    },
    /**
     * Date 객체를 구한다.
     *
     * @method getDateObject
     * @static
     * @param {Object} htDate 날짜 객체
     * @return {Date} Date 객체 인스턴스 자신
     * @example
     * ne.component.Calendar.Util.getDateObject({year:2010, month:5, date:12});
     * ne.component.Calendar.Util.getDateObject(2010, 5, 12); //연,월,일
     **/
    getDateObject: function(date) {
        if (arguments.length == 3) {
            return new Date(arguments[0], arguments[1] - 1, arguments[2]);
        }
        return new Date(date.year, date.month - 1, date.date);
    },
    /**
     * 연월일을 포함한 HashTable로부터 상대적인 날짜의 HashTable을 구한다.
     *
     * @method getRelativeDate
     * @static
     * @param {Number} year 상대적인 연도 (+/-로 정의)
     * @param {Number} month 상대적인 월 (+/-로 정의)
     * @param {Number} date 상대적인 일 (+/-로 정의)
     * @param {Object} date 연월일 HashTable
     * @return {Object} dateObj연월일을 담은 객체
     * @return {Number} dateObj.year 년도
     * @return {Number} dateObj.month 월
     * @return {Number} dateObj.date 일
     * @example
     * ne.component.Calendar.Util.getRelativeDate(1, 0, 0, {year:2000, month:1, date:1}); // {year:2001, month:1, date:1}
     * ne.component.Calendar.Util.getRelativeDate(0, 0, -1, {year:2010, month:1, date:1}); // {year:2009, month:12, date:31}
     **/
    getRelativeDate: function(year, month, date, dateObj) {
        var beforeDate = new Date(dateObj.year, dateObj.month, dateObj.date),
            beforeYear = beforeDate.getFullYear(),
            isLeapYear = !(beforeYear % 4) && !!(beforeYear % 100) || !(beforeYear % 400),
            endDays = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            isEndDate = (endDays[dateObj.month] === dateObj.date);
        if (isEndDate) {
            dateObj.date = endDays[dateObj.month + month];
        }
        var newDate = new Date(dateObj.year + year, dateObj.month + month - 1, dateObj.date + date),
            hash = this.getDateHashTable(newDate);

        return hash;
    }
};