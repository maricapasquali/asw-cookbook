export default {
    bind(el, binding) {
        const onScrollCallback = binding.value
        el.onScroll = function () {
            const _isTopPage = document.documentElement.scrollTop === 0
            const _isBottomOfWindow = Math.ceil(document.documentElement.scrollTop) + window.innerHeight >= document.documentElement.offsetHeight
            onScrollCallback({ target: el, toBottom: _isBottomOfWindow, toTop: _isTopPage })
        }
        window.addEventListener("scroll", el.onScroll)
    },
    inserted(el) {
        el.onScroll()
    },
    unbind(el) {
        window.removeEventListener("scroll", el.onScroll)
    },
}
