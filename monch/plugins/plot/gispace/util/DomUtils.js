import Utils from "./Utils";

let DomUtils = {};

DomUtils.create = function(tagName, className, parent, id) {
    let element = document.createElement(tagName);
    element.className = className || '';
    if(id){
        element.id = id;
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
};

DomUtils.createHidden = function(tagName, parent, id) {
    let element = document.createElement(tagName);
    element.style.display = 'none';
    if(id){
        element.id = id;
    }
    if(parent){
        parent.appendChild(element);
    }
    return element;
};

DomUtils.remove = function(element, parent) {
    if (parent && element) {
        parent.removeChild(element);
    }
};

DomUtils.get = function(id) {
    return document.getElementById(id);
};

DomUtils.getStyle = function(element, name) {
    let value = element.style[name];
    return value === 'auto' ? null : value;
};

DomUtils.hasClass = function(element, name) {
    return (element.className.length > 0) &&
        new RegExp('(^|\\s)' + name + '(\\s|$)').test(element.className);
};

DomUtils.addClass = function(element, name) {
    if (this.hasClass(element, name)) {
        return;
    }
    if (element.className) {
        element.className += ' ';
    }
    element.className += name;
};

DomUtils.removeClass = function(element, name) {
    element.className = Utils.trim((' ' + element.className + ' ').replace(' ' + name + ' ', ' '));
};

DomUtils.getDomEventKey = function(type, fn, context) {
    return '_p_dom_event_' + type + '_' + Utils.stamp(fn) + (context ? '_' + Utils.stamp(context) : '');
};

DomUtils.addListener = function(element, type, fn, context) {
    let self = this,
        eventKey = DomUtils.getDomEventKey(type, fn, context),
        handler = element[eventKey];

    if (handler) {
        return self;
    }

    handler = function(e) {
        return fn.call(context || element, e);
    };

    if ('addEventListener' in element) {
        element.addEventListener(type, handler, false);
    } else if ('attachEvent' in element) {
        element.attachEvent('on' + type, handler);
    }

    element[eventKey] = handler;
    return self;
};

DomUtils.removeListener = function(element, type, fn, context) {
    let self = this,
        eventKey = DomUtils.getDomEventKey(type, fn, context),
        handler = element[eventKey];

    if (!handler) {
        return self;
    }

    if ('removeEventListener' in element) {
        element.removeEventListener(type, handler, false);
    } else if ('detachEvent' in element) {
        element.detachEvent('on' + type, handler);
    }

    element[eventKey] = null;

    return self;
};

export default DomUtils;