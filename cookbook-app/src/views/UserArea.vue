<template>
  <router-view
    :key="forceUpdateRouteView"
    @force-update="_forceUpdateRouteView"
  />
</template>

<script>
export default {
    name: "UserArea",
    data() {
        return {
            forceUpdateRouteView: false
        }
    },
    methods: {
        _resetForceUpdateRouteView() {
            this.forceUpdateRouteView = false
        },
        _forceUpdateRouteView() {
            console.debug("REFRESH ROUTE ...")
            this.forceUpdateRouteView = true
            setTimeout(this._resetForceUpdateRouteView.bind(this), 1)
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
