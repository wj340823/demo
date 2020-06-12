function drag(el: HTMLElement, e: any) {
    const disX = e.pageX - el.offsetLeft;
    const disY = e.pageY - el.offsetTop;
    document.onmousemove = (e) => {
        el.style.left = e.pageX - disX + 'px';
        el.style.top = e.pageY - disY + 'px';
    }
    document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null;
    }
}

const Drag = {
    bind(el: HTMLElement) {
        el.onmousedown = (e) => drag(el, e)
    },
    update(el: HTMLElement) {
        el.onmousedown = (e) => drag(el, e)
    },
    name: 'drag'
}

export default Drag
