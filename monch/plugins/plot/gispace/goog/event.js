
export default class GoogEvent {
    constructor(type, opt_target){
        this.type = type;
        this.target = opt_target;
        this.currentTarget = this.target;
        this.propagationStopped_ = false;
        this.defaultPrevented = false;
        this.returnValue_ = true;
    }

    stopPropagation() {
        this.propagationStopped_ = true;
    }
    preventDefault() {
        this.defaultPrevented = true;
        this.returnValue_ = false;
    }
    stopPropagation(e) {
        e.stopPropagation();
    }
    preventDefault(e) {
        e.preventDefault();
    }
}


