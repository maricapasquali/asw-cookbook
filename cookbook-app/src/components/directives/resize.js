export default {
    bind: function(el, binding) {
        const onResizeCallback = binding.value;
        el.onResizeWindow = function (event) {
            onResizeCallback({screenWidth: screen.width, screenHeight:  screen.height})
        };
        window.addEventListener('resize', el.onResizeWindow)
    },
    inserted: function (el){
        el.onResizeWindow()
    },
    unbind: function(el) {
        window.removeEventListener('resize', el.onResizeWindow)
    },

}