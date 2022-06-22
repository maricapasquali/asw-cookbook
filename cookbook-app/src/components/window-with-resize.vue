<template>
  <div v-resize="onResize">
    <slot />
  </div>
</template>

<script>
export default {
    name: "WindowWithResize",
    props: {
        size: {
            type: String,
            required: true,
            enum: ["sm", "md", "lg", "xl"]
        }
    },
    data() {
        return {
            inBound: false
        }
    },
    watch: {
        size(val) {
            this._width(val)
        }
    },
    created() {
        this._width(this.size)
    },
    methods: {
        _width(val) {
            switch (val) {
                case "sm":
                    this._maxWidth = 576
                    break
                case "md":
                    this._maxWidth = 768
                    break
                case "lg":
                    this._maxWidth = 992
                    break
                case "xl":
                    this._maxWidth = 1200
                    break
                default:
                    this._maxWidth = 0
            }
        },

        onResize({ screenWidth, windowWidth }) {
            if (this._maxWidth > 0) {
                this.inBound = screenWidth < this._maxWidth || windowWidth < this._maxWidth
                this.$emit("in-bound", this.inBound)
            }
        },
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
