export default {
    props: {
        value: {
            type: Object,
            required: true
        },
    },
    data() {
        return {
            show: false
        }
    },
    watch: {
        show(val) {
            this.$emit("input", Object.assign(this.value, { show: val }))
        },
        "value.show"(val) {
            this.show = val
        }
    },
    created() {
        this.show = this.value.show || false
    }
}
