let Utils = {
    _stampId: 0
};
Utils.trim = function(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
};

Utils.stamp = function(obj) {
    const key = '_p_id_';
    obj[key] = obj[key] || this._stampId++;
    return obj[key];
};

export default Utils;
