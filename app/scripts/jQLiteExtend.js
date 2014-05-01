/*
 @chalk overview
 @name angular.element

 @description
 Angular comes with jqLite, a tiny, API-compatible subset of jQuery. However, its
 functionality is very limited and MacGyver extends jqLite to make sure MacGyver
 components work properly.

 Real jQuery will continue to take precedence over jqLite and all functions MacGyver extends.

 MacGyver adds the following methods:
 - [height()](http://api.jquery.com/height/) - Does not support set
 - [width()](http://api.jquery.com/width/) - Does not support set
 - [outerHeight()](http://api.jquery.com/outerHeight/) - Does not support set
 - [outerWidth()](http://api.jquery.com/outerWidth/) - Does not support set
 - [offset()](http://api.jquery.com/offset/)
 - [scrollTop()](http://api.jquery.com/scrollTop/)
 */

'use strict';
var cssExpand, corePNum, rnumnonpx, getStyles, isWindow, getWindow, augmentWidthOrHeight, getWidthOrHeight, jqLiteExtend, extendjQuery;

cssExpand = ['Top', 'Right', 'Bottom', 'Left'];

corePNum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;

rnumnonpx = new RegExp('^(' + corePNum + ')(?!px)[a-z%]+$', 'i');

getStyles = function(element) {
    return window.getComputedStyle(element, null);
};

isWindow = function(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
};

getWindow = function(element) {
    if (isWindow(element)) {
        return element;
    } else {
        return element.nodeType === 9 && element.defaultView;
    }
};

augmentWidthOrHeight = function(element, name, extra, isBorderBox, styles) {
    var i, start, _i, val;
    if (extra === (isBorderBox ? 'border' : 'content')) {
        return 0;
    }
    start = name === 'Width' ? 1 : 0;
    for (i = _i = start; _i <= 3; i = _i += 2) {
        if (extra === 'margin') {
            val += parseFloat(styles['' + extra + cssExpand[i]]);
        }
        if (isBorderBox) {
            if (extra === 'content') {
                val -= parseFloat(styles['padding' + cssExpand[i]]);
            }
            if (extra !== 'margin') {
                val -= parseFloat(styles['border' + cssExpand[i]]);
            }
        } else {
            val += parseFloat(styles['padding' + cssExpand[i]]);
            if (extra !== 'padding') {
                val += parseFloat(styles['border' + cssExpand + 'Width']);
            }
        }
    }
    return val;
};

getWidthOrHeight = function(type, prefix, element) {
    return function(margin) {
        var defaultExtra, doc, extra, isBorderBox, name, styles, value, valueIsBorderBox;
        defaultExtra = (function() {
            switch (prefix) {
                case 'inner':
                    return 'padding';
                case 'outer':
                    return '';
                default:
                    return 'content';
            }
        })();
        extra = defaultExtra || (margin === true ? 'margin' : 'border');
        if (isWindow(element)) {
            return element.document.documentElement['client' + type];
        }
        if (element.nodeType === 9) {
            doc = element.documentElement;
            return Math.max(element.body['scroll' + type], doc['scroll' + type], element.body['offset' + type], doc['offset' + type], doc['client' + type]);
        }
        valueIsBorderBox = true;
        styles = getStyles(element);
        name = type.toLowerCase();
        value = type === 'Height' ? element.offsetHeight : element.offsetWidth;
        isBorderBox = element.style.boxSizing === 'border-box';
        if (value <= 0 || value === null) {
            value = styles[name];
            if (value < 0 || value === null) {
                value = element.style[name];
            }
            if (rnumnonpx.test(value)) {
                return value;
            }
            valueIsBorderBox = isBorderBox;
            value = parseFloat(value) || 0;
        }
        return value + augmentWidthOrHeight(element, type, extra || (isBorderBox ? 'border' : 'content'), valueIsBorderBox, styles);
    };
};

jqLiteExtend = {
    height: function(element) {
        return getWidthOrHeight('Height', '', element)();
    },
    width: function(element) {
        return getWidthOrHeight('Width', '', element)();
    },
    outerHeight: function(element, margin) {
        return getWidthOrHeight('Height', 'outer', element)(margin);
    },
    outerWidth: function(element, margin) {
        return getWidthOrHeight('Width', 'outer', element)(margin);
    },
    offset: function(element) {
        var box, doc, docElem, win;
        box = {
            top: 0,
            left: 0
        };
        doc = element && element.ownerDocument;
        if (!doc) {
            return;
        }
        docElem = doc.documentElement;
        if (element.getBoundingClientRect !== null) {
            box = element.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    },
    scrollTop: function(element, value) {
        var win;
        win = getWindow(element);
        if (value === null) {
            if (win) {
                return win.pageYOffset;
            } else {
                return element.scrollTop;
            }
        }
        if (win) {
            return win.scrollTo(window.pageXOffset, value);
        } else {
            return element.scrollTop = value;
        }
    }
};

extendjQuery = function() {
    var jqLite;
    if (typeof window.jQuery !== 'undefined') {
        return;
    }
    jqLite = angular.element;
    return angular.forEach(jqLiteExtend, function(fn, name) {
        return jqLite.prototype[name] = function(arg1, arg2) {
            if (this.length) {
                return fn(this[0], arg1, arg2);
            }
        };
    });
};

extendjQuery();