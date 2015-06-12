/*!component-calendar v1.0.2 | NHN Entertainment*/
(function() {
/**
 * @fileoverview 캘린더 컴포넌트
 * (pug.Calendar 에서 분리)
 * @author NHN ENTERTAINMENT FE 개발팀(e0242@nhnent.com)
 * @author 이제인(jein.yi@nhnent.com)
 * @author FE개발팀 이민규 (minkyu.yi@nhnent.com) - 2015, 6, 3
 * @dependency jquery ~1.8.3, ne-code-snippet ~1.0.2
 */

'use strict';
var util = ne.util,
    _CALENDAR_HEADER = [
        '<div class="calendar-header">',
            '<a href="#" class="rollover calendar-btn-prev-year">이전해</a>',
            '<a href="#" class="rollover calendar-btn-prev-mon">이전달</a>',
            '<strong class="calendar-title"></strong>',
            '<a href="#" class="rollover calendar-btn-next-mon">다음달</a>',
            '<a href="#" class="rollover calendar-btn-next-year">다음해</a>',
        '</div>'].join(''),
    _CALENDAR_BODY = [
        '<div class="calendar-body">',
            '<table>',
                '<thead>',
                    '<tr>',
                        '<th class="calendar-sun">Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fa</th><th class="calendar-sat">Sa</th>',
                    '</tr>',
                '</thead>',
                '<tbody>',
                    '<tr class="calendar-week">',
                        '<td class="calendar-date"></td>',
                        '<td class="calendar-date"></td>',
                        '<td class="calendar-date"></td>',
                        '<td class="calendar-date"></td>',
                        '<td class="calendar-date"></td>',
                        '<td class="calendar-date"></td>',
                        '<td class="calendar-date"></td>',
                    '</tr>',
                '</tbody>',
            '</table>',
        '</div>'].join(''),
    _CALENDAR_FOOTER = [
        '<div class="calendar-footer">',
            '<p>오늘 <em class="calendar-today"></em></p>',
        '</div>'].join(''),
    _DEFAULT_CLASS_PREFIX_REGEXP = /calendar-/g;

util.defineNamespace('ne.component');
/**
 * 캘린더 컴포넌트 클래스
 * @constructor
 * @param {Object} [option] 초기화 옵션 설정을 위한 객체.
 *     @param {HTMLElement} option.el 캘린더 엘리먼트
 *     @param {string} [option.classPrefix="calendar-"] 초기 HTML/CSS구조에서 필요한 className 앞에 붙는 prefix를 정의
 *     @param {number} [option.year=현재년] 초기에 표시될 달력의 년도
 *     @param {number} [option.month=현재월] 초기에 표시될 달력의 달
 *     @param {string} [option.titleFormat="yyyy-mm"] className이 '[prefix]title' 인 엘리먼트를 찾아서 해당 형식대로 날짜를 출력한다. 다음의 형식을 사용할 수 있다.<table><tr><th>표시형식</th><th>설명</th><th>결과</th></tr><tr><td>yyyy</td><td>4자리 연도</td><td>2010</td></tr><tr><td>yy</td><td>2자리 연도</td><td>10</td></tr><tr><td>mm</td><td>2자리 월</td><td>09</td></tr><tr><td>m</td><td>1자리 월</td><td>9</td></tr><tr><td>M</td><td>monthTitles 옵션 값으로 표시</td><td>SEP</td></tr></table>
 *     @param {string} [option.todayFormat = "yyyy년 mm월 dd일 (D)"] className이 '[prefix]today' 인 엘리먼트를 찾아서 해당 형식대로 날짜를 출력한다.
 *     @param {string} [option.yearTitleFormat = "yyyy"] className이 '[prefix]year' 인 엘리먼트를 찾아서 해당 형식대로 연도를 출력한다. option의 titleFormat에서 사용할 수 있는 형식에서 연도 표시 형식을 사용할 수 있다.
 *     @param {string} [option.monthTitleFormat = "m"] className이 '[prefix]month' 인 엘리먼트를 찾아서 해당 형식대로 월을 출력한다. option의 titleFormat에서 사용할 수 있는 형식에서 월 표시 형식을 사용할 수 있다.
 *     @param {Array} [option.monthTitles = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]] 각 월의 이름을 설정할 수 있다. 1월부터 순서대로 배열로 정의한다. option의 titleFormat 표시형식에서 M을 사용하면 여기서 설정된 이름으로 표시할 수 있다.
 *     @param {Array} [option.dayTitles = ["일","월","화","수","목","금","토"]] <br>각 요일의 이름을 설정할 수 있다. 일요일부터 순서대로 배열로 정의한다. option의 todayFormat 표시형식에서 D을 사용하면 여기서 설정된 이름으로 표시할 수 있다.
 * @example
 * var calendar = new ne.component.Calendar({
 *                    el: document.getElementById('layer'),
 *                    classPrefix: "calendar-",
 *                    year: 1983,
 *                    month: 5,
 *                    titleFormat: "yyyy-mm", //설정될 title의 형식
 *                    todayFormat: "yyyy년 mm월 dd일 (D)" // 설정된 오늘의 날짜 형식
 *                    yearTitleFormat: "yyyy", //설정될 연 title의 형식
 *                    monthTitleFormat: "m", //설정될 월 title의 형식
 *                    monthTitles: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], //월의 이름을 설정 "title" 세팅시 적용
 *                    dayTitles: ['일', '월', '화', '수', '목', '금', '토'] // 요일들
 *             });
 **/
ne.component.Calendar = util.defineClass( /** @lends ne.component.Calendar.prototype */ {
    init: function(option) {
        /**
         * 옵션을 저장한다
         * option: {
         *     classPrefix: string,
         *     year: number
         *     month: number
         *     titleFormat: string,
         *     todayFormat: string,
         *     yearTitleFormat: string,
         *     monthTitleFormat: string,
         *     monthTitles: Array,
         *     dayTitles: Array,
         * }
         * @private
         */
        this._option = {};

        /**
         * 보여지고 있는 날짜
         * @type {{year: number, month: number}}
         */
        this._shownDate = {year: 0, month: 1, date: 1};

        /**======================================
         * jQuery - HTMLElement
         *======================================*/
        /**
         * =========Root Element=========
         *  옵션에 엘리먼트가 지정되어있지 않는 경우는,
         *  옵션 없이 엘리먼트 자체를 초기화 매개변수로 넘겼다고 판단한다.
         * @type {jQuery}
         * @private
         */
        this.$element = $(option.el || arguments[0]);

        /**
         * =========Header=========
         * @type {jQuery}
         */
        this.$header = null;

        /**
         * 이전해(년) 버튼
         * @type {jQuery}
         */
        this.$btnPrevYear = null;

        /**
         * 이전달 버튼
         * @type {jQuery}
         */
        this.$btnPrevMonth = null;

        /**
         * 다음해(년) 버튼
         * @type {jQuery}
         */
        this.$btnNextYear = null;

        /**
         * 다음달 버튼
         * @type {jQuery}
         */
        this.$btnNextMonth = null;

        /**
         * 타이틀
         * @type {jQuery}
         */
        this.$title = null;

        /**
         * 타이틀 - 년도
         * @type {jQuery}
         */
        this.$titleYear = null;

        /**
         * 타이틀 - 달
         * @type {jQuery}
         */
        this.$titleMonth = null;

        /**
         * =========Body=========
         * @type {jQuery}
         */
        this.$body = null;

        /**
         * 일주일을 나타낼 엘리먼트 템플릿
         * @type {jQuery}
         */
        this.$weekTemplate = null;

        /**
         * 템플릿이 붙을 부모 엘리먼트
         * @type {jQuery}
         */
        this.$weekAppendTarget = null;

        /**
         * 날짜(일)들을 나타내는 엘리먼트
         * @type {jQuery}
         * @private
         */
        this._$dateElement = null;

        /**
         * 날짜(일)들을 감싸는 있는 엘리먼트
         * @type {jQuery}
         * @private
         */
        this._$dateContainerElement = null;

        /**
         * =========Footer=========
         * @type {jQuery}
         */
        this.$footer = null;

        /**
         * 오늘날짜 엘리먼트
         * @type {jQuery}
         */
        this.$today = null;

        /**======================================
         * 기본값 셋팅, 초기화
         *======================================*/
        this._setDefault(option);
    },

    /**
     * 초기화를 진행한다.
     * @param {Object} [option] 옵션 값
     * @private
     */
    _setDefault: function(option) {
        this._setOption(option);
        this._assignHTMLElements();
        this._attachEvent();
        this.draw(this._option.year, this._option.month, false);
    },

    /**
     * 옵션값을 저장한다.
     * @param {Object} [option] 옵션 값
     * @private
     */
    _setOption: function(option) {
        var instanceOption = this._option,
            today = this.constructor.Util.getDateHashTable();

        // 기본값 세팅
        var defaultOption = {
            classPrefix: 'calendar-',
            year: today.year,
            month: today.month,
            titleFormat: 'yyyy-mm',
            todayFormat: 'yyyy년 mm월 dd일 (D)',
            yearTitleFormat: 'yyyy',
            monthTitleFormat: 'm',
            monthTitles: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
            dayTitles: ['일', '월', '화', '수', '목', '금', '토']
        };

        // 갱신
        util.extend(instanceOption, defaultOption, option);
    },

    /**
     * 엘리먼트를 필드에 할당한다.
     * @private
     */
    _assignHTMLElements: function() {
        var classPrefix = this._option.classPrefix,
            $element = this.$element,
            classSelector = '.' + classPrefix;

        this._assignHeader($element, classSelector, classPrefix);
        this._assignBody($element, classSelector, classPrefix);
        this._assignFooter($element, classSelector, classPrefix);
    },

    /**
     * 해더 엘리먼트들을 등록한다.
     * @param {jQuery} $element 루트 엘리먼트 jquery 객체
     * @param {string} classSelector 셀렉터
     * @param {string} classPrefix 클래스 prefix
     * @private
     */
    _assignHeader: function($element, classSelector, classPrefix) {
        var $header = $element.find(classSelector + 'header');

        if ($header.length === 0) {
            $header = $(_CALENDAR_HEADER.replace(_DEFAULT_CLASS_PREFIX_REGEXP, classPrefix));
            $element.append($header);
        }

        // button
        this.$btnPrevYear = $header.find(classSelector + 'btn-prev-year');
        this.$btnPrevMonth = $header.find(classSelector + 'btn-prev-mon');
        this.$btnNextMonth = $header.find(classSelector + 'btn-next-mon');
        this.$btnNextYear = $header.find(classSelector + 'btn-next-year');

        // title text
        this.$title = $header.find(classSelector + 'title');
        this.$titleYear = $header.find(classSelector + 'title-year');
        this.$titleMonth = $header.find(classSelector + 'title-month');

        this.$header = $header;
    },

    /**
     * 바디 엘리먼트들을 등록한다.
     * @param {jQuery} $element 루트 엘리먼트 jquery 객체
     * @param {string} classSelector 셀렉터
     * @param {string} classPrefix 클래스 prefix
     * @private
     */
    _assignBody: function($element, classSelector, classPrefix) {
        var $body = $element.find(classSelector + 'body'),
            $weekTemplate;

        if ($body.length === 0) {
            $body = $(_CALENDAR_BODY.replace(_DEFAULT_CLASS_PREFIX_REGEXP, classPrefix));
            $element.append($body);
        }

        $weekTemplate = $body.find(classSelector + 'week');
        this.$weekTemplate = $weekTemplate.clone(true);
        this.$weekAppendTarget = $weekTemplate.parent();

        this.$body = $body;
    },

    /**
     * 푸터 엘리먼트들을 등록한다.
     * @param {jQuery} $element 루트 엘리먼트 jquery 객체
     * @param {string} classSelector 셀렉터
     * @param {string} classPrefix 클래스 prefix
     * @private
     */
    _assignFooter: function($element, classSelector, classPrefix) {
        var $footer = $element.find(classSelector + 'footer');

        if ($footer.length === 0) {
            $footer = $(_CALENDAR_FOOTER.replace(_DEFAULT_CLASS_PREFIX_REGEXP, classPrefix));
            $element.append($footer);
        }
        this.$today = $footer.find(classSelector + 'today');

        this.$footer = $footer;
    },

    /**
     * 달력, 전년 전달 다음달 다음년도로 이동하는 이벤트를 건다.
     * @private
     */
    _attachEvent: function() {
        if (util.isNotEmpty(this.$btnPrevYear)) {
            this.$btnPrevYear.click($.proxy(this._onButtonHandle, this, -1, 0));
        }
        if (util.isNotEmpty(this.$btnNextYear)) {
            this.$btnNextYear.click($.proxy(this._onButtonHandle, this, 1, 0));
        }

        if (util.isNotEmpty(this.$btnPrevMonth)) {
            this.$btnPrevMonth.click($.proxy(this._onButtonHandle, this, 0, -1));
        }
        if (util.isNotEmpty(this.$btnNextMonth)) {
            this.$btnNextMonth.click($.proxy(this._onButtonHandle, this, 0, 1));
        }
    },

    /**
     * 달력 버튼을 누를때의 핸들러
     * @param {number} yearDist 연도 이동 값
     * @param {number} monthDist 월 이동 값
     * @param {Event} event 클릭 이벤트 객체
     * @private
     */
    _onButtonHandle: function(yearDist, monthDist, event) {
        event.preventDefault();
        this.draw(yearDist, monthDist, true);
    },

    /**
     * 캘린더를 그리기 위한 년/월 날짜 해시를 얻는다
     * @param {number} year 년
     * @param {number} month 월
     * @param {boolean} [isRelative] 상대 값 여부
     * @returns {{year: number, month: number}} 날짜 해시
     * @private
     */
    _getDateForDrawing: function(year, month, isRelative) {
        var nDate = this.getDate(),
            relativeDate;

        nDate.date = 1;
        if (!util.isNumber(year) && !util.isNumber(month)) {
            return nDate;
        }

        if (isRelative) {
            relativeDate = this.constructor.Util.getRelativeDate(year, month, 0, nDate);
            nDate.year = relativeDate.year;
            nDate.month = relativeDate.month;
        } else {
            nDate.year = year || nDate.year;
            nDate.month = month || nDate.month;
        }

        return nDate;
    },

    /**
     * 캘린더를 다시 그려야 하는지 판단.
     * @param {number} year 년도
     * @param {number} month 월
     * @returns {boolean} reflow 여부
     * @private
     */
    _isNecessaryForReDrawing: function(year, month) {
        var shownDate = this._shownDate;

        return (shownDate.year !== year || shownDate.month !== month);
    },

    /**
     * calendar text를 그려준다.
     * @param {{year: number, month: number}} dateForDrawing 화면에 나타낼 날짜 해시
     * @private
     */
    _setCalendarText: function(dateForDrawing) {
        var year = dateForDrawing.year,
            month = dateForDrawing.month;

        this._setCalendarToday();
        this._setCalendarTitle(year, month);
    },

    /**
     * 캘린더의 월을 기준으로 날짜들을 만든다.
     * @param {{year: number, month: number}} dateForDrawing 그릴 년-월
     * @param {string} classPrefix 클래스 prefix
     * @private
     */
    _drawDates: function(dateForDrawing, classPrefix) {
        var calUtil = this.constructor.Util,
            year = dateForDrawing.year,
            month = dateForDrawing.month,
            dayInWeek = 0,
            datePrevMonth = calUtil.getRelativeDate(0, -1, 0, dateForDrawing),
            dateNextMonth = calUtil.getRelativeDate(0, 1, 0, dateForDrawing),
            dates = [],
            firstDay = calUtil.getFirstDay(year, month),
            indexOfLastDate = this._fillDates(year, month, dates); // 데이터를 채우고 마지막날 데이터의 인덱스를 받아온다.

        // 채워진 데이터를 그린다
        util.forEach(dates, function(date, i) {
            var isPrevMonth = false,
                isNextMonth = false,
                $dateContainer = $(this._$dateContainerElement[i]),
                tempYear = year,
                tempMonth = month,
                eventData;

            if (i < firstDay) {
                isPrevMonth = true;
                $dateContainer.addClass(classPrefix + 'prev-mon');
                tempYear = datePrevMonth.year;
                tempMonth = datePrevMonth.month;
            } else if (i > indexOfLastDate) {
                isNextMonth = true;
                $dateContainer.addClass(classPrefix + 'next-mon');
                tempYear = dateNextMonth.year;
                tempMonth = dateNextMonth.month;
            }

            // 주말 표시
            this._setWeekend(dayInWeek, $dateContainer, classPrefix);

            // 오늘 날짜 표시
            if (this._isToday(tempYear, tempMonth, date)) {
                $dateContainer.addClass(classPrefix + 'today');
            }

            eventData = {
                $date: $(this._$dateElement.get(i)),
                $dateContainer: $dateContainer,
                year: tempYear,
                month: tempMonth,
                date: date,
                isPrevMonth: isPrevMonth,
                isNextMonth: isNextMonth,
                html: date
            };
            $(eventData.$date).html(eventData.html.toString());
            dayInWeek = (dayInWeek + 1) % 7;

            /**
             * 달력을 그리면서 일이 표시될 때마다 발생
             * @param {string} type 커스텀 이벤트명
             * @param {boolean} isPrevMonth 그려질 날이 이전달의 날인지 여부
             * @param {boolean} isNextMonth 그려질 날이 다음달의 날인지 여부
             * @param {jQuery} $date 날이 쓰여질 대상 엘리먼트
             * @param {jQuery} $dateContainer className이 [prefix]week로 설정된 엘리먼트의 자식 엘리먼트, elDate와 같을 수 있음
             * @param {number} date 그려질 날의 일
             * @param {number} month 그려질 날의 월
             * @param {number} year 그려질 날의 연
             * @param {string} html 대상 엘리먼트에 쓰여질 HTML
             * @example
             * // draw 커스텀 이벤트 핸들링
             * calendar.on('draw', function(drawEvent){ ... });
             **/
            this.fire('draw', eventData);
        }, this);
    },


    /**
     * 입력 날짜 해시가 오늘인지 판단한다.
     * @param {number} year 년도
     * @param {number} month 달
     * @param {number} date 일
     * @returns {boolean} 오늘 날짜 인지 비교 결과
     * @private
     */
    _isToday: function(year, month, date) {
        var today = this.constructor.Util.getDateHashTable();

        return (
            today.year === year &&
            today.month === month &&
            today.date === date
        );
    },

    /**
     * 한주 템플릿을 만든다.
     * @param {number} year 해당 연도
     * @param {number} month 해당 월
     * @private
     */
    _setWeeks: function(year, month) {
        var $elWeek,
            weeks = this.constructor.Util.getWeeks(year, month),
            i;
        for (i = 0; i < weeks; i += 1) {
            $elWeek = this.$weekTemplate.clone(true);
            $elWeek.appendTo(this.$weekAppendTarget);
            this._weekElements.push($elWeek);
        }
    },

    /**
     * 그려질 데이터들을 dates 배열에 저장
     * @param {string} year 그려질 연도
     * @param {string} month 그려질 달
     * @param {Array} dates 그려질 날짜 데이터
     * @return {number} index of last date
     * @private
     */
    _fillDates: function(year, month, dates) {
        var calUtil = this.constructor.Util,
            firstDay = calUtil.getFirstDay(year, month),
            lastDay = calUtil.getLastDay(year, month),
            lastDate = calUtil.getLastDate(year, month),
            datePrevMonth = calUtil.getRelativeDate(0, -1, 0, {year: year, month: month, date: 1}),
            prevMonthLastDate = calUtil.getLastDate(datePrevMonth.year, datePrevMonth.month),
            indexOfLastDate,
            i;

        if (firstDay > 0) {
            for (i = prevMonthLastDate - firstDay; i < prevMonthLastDate; i += 1) {
                dates.push(i + 1);
            }
        }
        for (i = 1; i < lastDate + 1; i += 1) {
            dates.push(i);
        }
        indexOfLastDate = dates.length - 1;
        for (i = 1; i < 7 - lastDay; i += 1) {
            dates.push(i);
        }

        return indexOfLastDate;
    },

    /**
     * 주말설정
     * @param {number} day 날짜
     * @param {jQuery} $dateContainer 날짜컨테이너 제이쿼리 엘리먼트 오브젝트
     * @param {string} classPrefix 클래스 프리픽스
     * @private
     */
    _setWeekend: function(day, $dateContainer, classPrefix) {
        if (day === 0) {
            $dateContainer.addClass(classPrefix + 'sun');
        } else if (day === 6) {
            $dateContainer.addClass(classPrefix + 'sat');
        }
    },

    /**
     * 달력을 지운다
     * @private
     */
    _clear: function() {
        this._weekElements = [];
        this.$weekAppendTarget.empty();
    },

    /**
     * 현재 달력의 타이틀 영역을 옵션의 타이틀 포멧에 맞게 그린다.
     * @param {number} year 연도 값 (ex. 2008)
     * @param {(number|string)} month 월 값 (1 ~ 12)
     * @private
     **/
    _setCalendarTitle: function(year, month) {
        var option = this._option,
            $title = this.$title,
            titleFormat = option.titleFormat,
            replaceMap,
            reg;

        if (month < 10) {
            month = '0' + Number(month);
        }

        replaceMap = this._getReplaceMap(year, month);
        if (util.isNotEmpty($title)) {
            reg = /yyyy|yy|mm|m|M/g;
            this._setDateTextInCalendar($title, titleFormat, replaceMap, reg);
        }

        $title = this.$titleYear;
        if (util.isNotEmpty($title)) {
            reg = /yyyy|yy/g;
            this._setDateTextInCalendar($title, option.yearTitleFormat, replaceMap, reg);
        }

        $title = this.$titleMonth;
        if (util.isNotEmpty($title)) {
            reg = /mm|m|M/g;
            this._setDateTextInCalendar($title, option.monthTitleFormat, replaceMap, reg);
        }
    },

    /**
     * 캘린더의 타이틀을 갱신한다.
     * @param {jQuery} $element 갱신될 엘리먼트
     * @param {string} form 변경될 날짜 형식
     * @param {Object} map 정규식에 맞춰서 매칭되는 값을 가진 객체
     * @param {RegExp} reg 변경할 폼을 치환할 정규식
     * @private
     */
    _setDateTextInCalendar: function($element, form, map, reg) {
        var title = this._getConvertedTitle(form, map, reg);
        $element.text(title);
    },

    /**
     * 폼 변환할 날짜의 맵을 구한다.
     * @param {string|number} year 연도
     * @param {string|number} month 월
     * @param {string|number} [date] 일
     * @returns {Object} ReplaceMap
     * @private
     */
    _getReplaceMap: function(year, month, date) {
        var option = this._option,
            yearSub = (year.toString()).substr(2, 2),
            monthLabel = option.monthTitles[month - 1],
            labelKey = new Date(year, month - 1, date || 1).getDay(),
            dayLabel = option.dayTitles[labelKey];

        return {
            yyyy: year,
            yy: yearSub,
            mm: month,
            m: Number(month),
            M: monthLabel,
            dd: date,
            d: Number(date),
            D: dayLabel
        };
    },

    /**
     * 텍스트를 변환하여 돌려준다.
     * @param {string} str 변환할 텍스트
     * @param {Object} map 변환키와 벨류 셋
     * @param {RegExp} reg 변환할 정규식
     * @returns {string} 변환된 문자열
     * @private
     */
    _getConvertedTitle: function(str, map, reg) {
        str = str.replace(reg, function(matchedString) {
            return map[matchedString] || '';
        });
        return str;
    },

    /**
     * 오늘날짜 앨리먼트 여부에 따라 오늘날짜를 그리는 데이터를 만들어 그린다.
     * @private
     */
    _setCalendarToday: function() {
        var $today = this.$today,
            todayFormat,
            today,
            year,
            month,
            date,
            replaceMap;

        if ($today.length < 1) {
            return;
        }

        today = this.constructor.Util.getDateHashTable();
        year = today.year;
        month = (today.month < 10) ? '0' + today.month : today.month;
        date = (today.date < 10) ? '0' + today.date : today.date;

        todayFormat = this._option.todayFormat;
        replaceMap = this._getReplaceMap(year, month, date);
        this._setDateTextInCalendar($today, todayFormat, replaceMap, /yyyy|yy|mm|m|M|dd|d|D/g);
    },

    /**
     * Calendar를 그린다.
     * @param {number} [year] 연도 값 (ex. 2008)
     * @param {number} [month] 월 값 (1 ~ 12)
     * @param {Boolean} [isRelative] 연도와 월 값이 상대 값인지 여부
     * @example
     * calendar.draw(); //현재 설정된 날짜의 달력을 그린다.
     * calendar.draw(2008, 12); //2008년 12월 달력을 그린다.
     * calendar.draw(null, 12); //현재 표시된 달력의 12월을 그린다.
     * calendar.draw(2010, null); //2010년 현재 표시된 달력의 월을 그린다.
     * calendar.draw(0, 1, true); //현재 표시된 달력의 다음 달을 그린다.
     * calendar.draw(-1, null, true); //현재 표시된 달력의 이전 연도를 그린다.
     **/
    draw: function(year, month, isRelative) {
        var dateForDrawing = this._getDateForDrawing(year, month, isRelative),
            isReadyForDrawing = this.invoke('beforeDraw', dateForDrawing),
            classPrefix;

        /**===============
         * beforeDraw
         =================*/
        if (!isReadyForDrawing) {
            return;
        }

        /**===============
         * draw
         =================*/
        year = dateForDrawing.year;
        month = dateForDrawing.month;

        classPrefix = this._option.classPrefix;
        this._clear();
        this._setCalendarText(dateForDrawing);

        // weeks
        this._setWeeks(year, month);
        this._$dateElement = $('.' + classPrefix + 'date', this.$weekAppendTarget);
        this._$dateContainerElement = $('.' + classPrefix + 'week > *', this.$weekAppendTarget);

        // dates
        this.setDate(year, month);
        this._drawDates(dateForDrawing, classPrefix);
        this.$element.show();

        /**===============
         * afterDraw
         * @param {string} sType 커스텀 이벤트명
         * @param {number} nYear 그려진 달력의 연도
         * @param {number} nMonth 그려진 달력의 월
         * @example
         * calendar.on('afterDraw', function(oCustomEvent){ ... });
         ================*/
        this.fire('afterDraw', dateForDrawing);
    },

    /**
     * 현재 달력의 년도와 월을 반환한다.
     * @returns {{year: number, month: number}} 날짜 해시
     */
    getDate: function() {
        return {
            year: this._shownDate.year,
            month: this._shownDate.month
        };
    },

    /**
     * 현재 달력의 년도와 월을 설정한다.
     * @param {number} [year] 연도 값 (ex. 2008)
     * @param {number} [month] 월 값 (1 ~ 12)
     **/
    setDate: function(year, month) {
        var date = this._shownDate;
        date.year = util.isNumber(year) ? year : date.year;
        date.month = util.isNumber(month) ? month : date.month;
    }
});

ne.util.CustomEvents.mixin(ne.component.Calendar);

/**
 * 캘린더 유틸성 함수들
 *
 * @author NHN ENTERTAINMENT FE 개발팀(e0242@nhnent.com)
 * @author FE개발팀 이제인
 * @author FE개발팀 이민규 (minkyu.yi@nhnent.com) - 2015, 6, 3
 * @dependency ne-code-snippet ~1.0.2
 */

'use strict';

ne.util.defineNamespace('ne.component.Calendar');

/**
 * Calendar Util 함수들을 모아둔 Object
 * @static
 * @module
 */
ne.component.Calendar.Util = {
    /**
     * 날짜 해시(년, 월, 일) 값을 만들어 리턴한다
     *      매개변수가 1개인 경우는 year 값을 넘긴것이 아니라
     *      Date 객체를 넘긴것으로 판단한다.
     * @function getDateHashTable
     * @param {Date|number} year 날짜 객체 또는 년도
     * @param {number} month 월
     * @param {number} date 일
     * @returns {{year: *, month: *, date: *}} 날짜 해시
     */
    getDateHashTable: function(year, month, date) {
        var nDate,
            resultDate = {};

        if (arguments.length === 3) {
            resultDate.year = year;
            resultDate.month = month;
            resultDate.date = date;
        } else {
            if (arguments.length === 1) {
                nDate = arguments[0];
            } else {
                nDate = new Date();
            }
            resultDate.year = nDate.getFullYear();
            resultDate.month = nDate.getMonth() + 1;
            resultDate.date = nDate.getDate();
        }

        return resultDate;
    },

    /**
     * 컨퍼넌트에 저장된 현재날짜를 돌려준다
     * 현재 날짜가 없을 시, 로컬시간 기준으로 새로 생성하여 돌려준다.
     * @function getToday
     * @returns {{year: *, month: *, date: *}} 날짜 해시
     */
    getToday: function() {
       return ne.component.Calendar.Util.getDateHashTable(new Date());
    },

    /**
     * 해당 연월의 주의 수를 구한다.
     * @function getWeeks
     * @param {number} year 년
     * @param {number} month 월
     * @return {number} 주 (4~6)
     **/
    getWeeks: function(year, month) {
        var firstDay = this.getFirstDay(year, month),
            lastDate = this.getLastDate(year, month);

        return Math.ceil((firstDay + lastDate) / 7);
    },

    /**
     * 연월일을 포함한 날짜 해시에서 유닉스타임을 구한다.
     * @function getTime
     * @param {Object} date 날짜 정보가 담긴 객체
     * @param {number} date.year 년
     * @param {number} date.month 월
     * @param {number} date.date 일
     * @return {number} 유닉스타임 정보
     * @example
     * ne.component.Calendar.Util.getTime({year:2010, month:5, date:12}); // 1273590000000
     **/
    getTime: function(date) {
        return this.getDateObject(date).getTime();
    },

    /**
     * 해당 연월의 첫번째 날짜의 요일을 구한다.
     * @function getFirstDay
     * @param {number} year 년
     * @param {number} month 월
     * @return {number} 요일 (0~6)
     **/
    getFirstDay: function(year, month) {
        return new Date(year, month - 1, 1).getDay();
    },

    /**
     * 해당 연월의 마지막 날짜의 요일을 구한다.
     * @function getLastDay
     * @param {number} year 년
     * @param {number} month 월
     * @return {number} 요일 (0~6)
     **/
    getLastDay: function(year, month) {
        return new Date(year, month, 0).getDay();
    },

    /**
     * 해당 연월의 마지막 날짜를 구한다.
     * @function
     * @param {number} year 년
     * @param {number} month 월
     * @return {number} 날짜 (1~31)
     **/
    getLastDate: function(year, month) {
        return new Date(year, month, 0).getDate();
    },

    /**
     * Date 객체를 구한다.
     * @function getDateObject
     * @param {Object} date 날짜 객체
     * @return {Date} Date 인스턴스
     * @example
     *  ne.component.Calendar.Util.getDateObject({year:2010, month:5, date:12});
     *  ne.component.Calendar.Util.getDateObject(2010, 5, 12); //연,월,일
     **/
    getDateObject: function(date) {
        if (arguments.length === 3) {
            return new Date(arguments[0], arguments[1] - 1, arguments[2]);
        }
        return new Date(date.year, date.month - 1, date.date);
    },

    /**
     * 연월일을 포함한 기준 날짜 해시에서 상대적인 날짜 해시를 구한다.
     * @function getRelativeDate
     * @param {number} year 상대적인 연도 (+/-로 정의)
     * @param {number} month 상대적인 월 (+/-로 정의)
     * @param {number} date 상대적인 일 (+/-로 정의)
     * @param {Object} dateObj 기준 날짜 해시
     * @return {Object} dateObj 결과 날짜 해시
     * @example
     *  ne.component.Calendar.Util.getRelativeDate(1, 0, 0, {year:2000, month:1, date:1}); // {year:2001, month:1, date:1}
     *  ne.component.Calendar.Util.getRelativeDate(0, 0, -1, {year:2010, month:1, date:1}); // {year:2009, month:12, date:31}
     **/
    getRelativeDate: function(year, month, date, dateObj) {
        var beforeDate = new Date(dateObj.year, dateObj.month, dateObj.date),
            beforeYear = beforeDate.getFullYear(),
            isLeapYear = !(beforeYear % 4) && !!(beforeYear % 100) || !(beforeYear % 400),
            endDays = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            isEndDate = (endDays[dateObj.month] === dateObj.date),
            newDate,
            hash;
        if (isEndDate) {
            dateObj.date = endDays[dateObj.month + month];
        }

        newDate = new Date(dateObj.year + year, dateObj.month + month - 1, dateObj.date + date);
        hash = ne.component.Calendar.Util.getDateHashTable(newDate);

        return hash;
    }
};
})();