<template>
  <b-img
    v-if="logo_"
    :style="cssStyle"
    class="logo"
    fluid
    :src="logo_"
    :alt="$appName"
    @error="imgNotFound"
  />
  <h2
    v-else
    :class="dark ?'text-light': 'text-primary'"
  >
    <em>{{ $appName }}</em>
  </h2>
</template>

<script>
export default {
    name: "Logo",
    props: {
        dark: Boolean,
        height: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            logo_: ""
        }
    },
    computed: {
        cssStyle() {
            let _css = {}
            if (this.height) _css.height = this.height + "px!important"
            return _css
        }
    },
    watch: {
        dark(val) {
            this.setLogo(val)
        }
    },
    created() {
        this.setLogo(this.dark)
    },
    methods: {
        setLogo(_dark) {
            this.logo_ = `/images/logo/${_dark ? "dark": "light"}-logo.png`
        },
        imgNotFound(e) {
            console.error(e)
            this.logo_ = ""
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
