export default {
    bind(el, binding) {
        const onResizeCallback = binding.value
        el.onResizeWindow = function () {
            onResizeCallback({ screenWidth: screen.width, screenHeight:  screen.height, windowWidth: window.innerWidth, windowHeight: window.innerHeight })
        }
        window.addEventListener("resize", el.onResizeWindow)
    },
    inserted(el) {
        el.onResizeWindow()
    },
    unbind(el) {
        window.removeEventListener("resize", el.onResizeWindow)
    },

}
