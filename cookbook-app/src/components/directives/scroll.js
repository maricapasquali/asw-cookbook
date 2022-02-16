export default {
    bind: function(el, binding) {
        const onScrollCallback = binding.value;
        el.onScroll = function (event) {
            const _isTopPage = document.documentElement.scrollTop === 0
            const _isBottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
            onScrollCallback({ target: el, toBottom: _isBottomOfWindow, toTop: _isTopPage })
        }
        window.addEventListener('scroll', el.onScroll)
    },
    inserted: function (el){
        el.onScroll()
    },
    unbind: function(el) {
        window.removeEventListener('scroll', el.onScroll)
    },
}
