const AutoHeight = {
    bind(el: HTMLElement, binding: any) {
        const event = new Event('build');
        window.addEventListener('build', () => {
            el.style.height = window.innerHeight - binding.value + "px"
        }, false);
        window.addEventListener("resize", () => {
            window.dispatchEvent(event)
        })
        window.dispatchEvent(event);
    },
    name: 'autoHeight'
}

export default AutoHeight
