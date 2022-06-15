<template>
  <div>
    <app-navigator v-if="navigatorVisibility" />
    <router-view
      :key="_reRenderRouterView"
      :class="classObject"
    />
    <app-footer v-if="footerVisibility" />

    <server-error-handler v-model="serverError" />
    <bad-request-error-handler v-model="badRequestError" />
    <unauthenticated-error-handler v-model="unAuthenticatedError" />
    <forbidden-error-handler v-model="forbiddenError" />
    <not-found-error-handler v-model="notFoundResource" />
  </div>
</template>

<script>
import {
    mapActions,
    mapGetters
} from "vuex"

export default {
    name: "App",
    data() {
        return {
            routeWithoutNavigationBar: [],
            routeWithoutFooter: [],
            forceReloadRoute: false,
            serverError: {
                show: false,
                message: ""
            },
            badRequestError: {
                show: false,
                message: ""
            },
            unAuthenticatedError: {
                show: false,
                _forbiddenPage: false
            },
            forbiddenError: {
                show: false,
                message: ""
            },
            notFoundResource: {
                show: false,
                resource: {}
            }
        }
    },
    computed: {
        ...mapGetters({
            accessToken: "session/accessToken",
            isLoggedIn: "session/isLoggedIn",
            isAdmin: "session/isAdmin",
            userIdentifier: "session/userIdentifier",
            username: "session/username"
        }),
        navigatorVisibility() {
            return !this.routeWithoutNavigationBar.includes(this.$route.name)
        },
        footerVisibility() {
            return !this.routeWithoutFooter.includes(this.$route.name)
        },
        _reRenderRouterView() {
            return this.forceReloadRoute
        },
        classObject() {
            return {
                "mt-6": this.navigatorVisibility,
                "mb-8": this.navigatorVisibility
            }
        }
    },
    watch: {
        accessToken(val) {
            console.debug("CHANGE ACCESS TOKEN ... ", this.$socket)
            this.$socket.updateAuthorization({
                key: val,
                userinfo: this.isLoggedIn
                    ? { _id: this.userIdentifier, userID: this.username, isAdmin: this.isAdmin }
                    : undefined
            })
        },
        username(val) {
            console.debug("CHANGE USER ID ... ", this.$socket)
            this.$socket.updateAuthorization({
                key: this.accessToken,
                userinfo: this.isLoggedIn ? { _id: this.userIdentifier, userID: val, isAdmin: this.isAdmin } : undefined
            })
        }
    },
    created() {
        console.debug("App created ")

        console.debug("Vue ", this)
        console.debug("Store ", this.$store)
        console.debug("Api ", this.$store.$api)
        console.debug("Socket ", this.$socket)
        console.debug("Bus ", this.$bus)
        console.debug("window ", window)

        let _routeWithout = [undefined, "login", "end-signup", "reset-password", "reset-password", "change-password", "chat"]
        this.routeWithoutNavigationBar = clone(_routeWithout)
        this.routeWithoutFooter = clone(_routeWithout)

        this.updateGUIListener()

        this.initialization()
            .then(() => console.debug("Initialization ok : Store State ", this.$store.state))
            .catch(err => {
                console.error("Something wrong during the initialization: ", err.message)
                console.error(err.response)
            })

        const isRedirectedToPersonalArea = route => {
            return this.isLoggedIn && (
                (this.isAdmin && route.name === "homepage") ||
                (route.name === "single-user" && route.params.id === this.userIdentifier)
            )
        }

        this.$router.beforeEach((to, from, next) => {
            if (isRedirectedToPersonalArea(to)) return next({ name: "p-user-account", params: { id: this.userIdentifier } } )
            return next()
        })
        if (isRedirectedToPersonalArea(this.$route)) this.$router.replace({ name: "p-user-account", params: { id: this.userIdentifier } })
    },
    beforeDestroy() {
        this.$socket.disconnect()
    },
    methods: {
        ...mapActions(["initialization"]),
        updateGUIListener() {
            this.$bus.$on("force:reload-route", force => this.forceReloadRoute = force)

            this.$bus.$on("hide:navigation-bar", () => this.routeWithoutNavigationBar.push(this.$route.name))
            this.$bus.$on("hide:footer", () => this.routeWithoutFooter.push(this.$route.name))
            this.$bus.$on("hide:errors", () => {
                this.badRequestError.show = false
                this.unAuthenticatedError.show = false
                this.forbiddenError.show = false
                this.serverError.show = false
                this.notFoundResource.show = false
            })
            this.$bus.$on("show:error:bad-request", err => {
                this.$bus.$emit("hide:errors")
                this.badRequestError = { show: true, ...err }
            })
            this.$bus.$on("show:error:unauthenticated", err => {
                this.$bus.$emit("hide:errors")
                this.unAuthenticatedError = { show: true, ...err }
            })
            this.$bus.$on("show:error:forbidden", err => {
                this.$bus.$emit("hide:errors")
                this.forbiddenError = { show: true, ...err }
            })
            this.$bus.$on("show:error:not-found", err => {
                this.$bus.$emit("hide:errors")
                this.notFoundResource = { show: true, ...err }
            })
            this.$bus.$on("show:error:server-internal", err => {
                this.$bus.$emit("hide:errors")
                this.serverError = { show: true, ...err }
            })

            this.$bus.$on("show:bv-toast", ({ message, options }) => this.$bvToast.toast(message, options))
            this.$bus.$on("hide:bv-toast", id => this.$bvToast.hide(id))
        }
    }
}
</script>

<style lang="scss">
body{
    background-color: $background-color !important;
}
</style>
