<template>
  <b-skeleton-wrapper :loading="loading">
    <template #loading>
      <b-card no-body>
        <b-tabs content-class="mt-1">
          <b-tab
            v-for="i in skeleton"
            :key="i"
          >
            <template #title>
              <div style="width: 100px;">
                <b-skeleton width="100%" />
              </div>
            </template>
            <b-container>
              <b-row
                cols="1"
                class="text-center py-5"
                style="height: 500px;"
              >
                <b-col
                  class="text-center"
                  align-self="center"
                >
                  <b-spinner variant="primary" />
                </b-col>
              </b-row>
            </b-container>
          </b-tab>
        </b-tabs>
      </b-card>
    </template>
    <b-card no-body>
      <b-tabs>
        <b-tab
          v-for="tab in tabs"
          :key="tab.id"
          :title="tab.title"
          :active="tab.selected"
          class="p-3"
          lazy
          @click="onClickTab(tab.route)"
        >
          <router-view />
        </b-tab>
      </b-tabs>
    </b-card>
  </b-skeleton-wrapper>
</template>

<script>

import { mapGetters } from "vuex"

export default {
    name: "PersonalArea",
    data() {
        return {
            loading: false,
            skeleton: 4,

            tabs: [],
            tabsSigned: ["account", "recipes", "foods", "friends", "chats", "notifications"],
            tabsAdmin: ["account", "foods",  "reports", "users","chats", "notifications" ]
        }
    },
    computed: {
        ...mapGetters({
            accessToken: "session/accessToken",
            userIdentifier: "session/userIdentifier",
            isSigned: "session/isSigned",
            isAdmin: "session/isAdmin"
        }),
        user() {
            return this.$route.params.id
        },
        active() {
            switch (this.$route.name) {
                case "p-user-account": return "account"
                case "p-user-recipes": return "recipes"
                case "p-user-foods": return "foods"
                case "p-user-friends": return "friends"
                case "p-user-chats": return "chats"
                case "p-user-notifications": return "notifications"
                case "p-user-reports": return "reports"
                case "p-user-users": return "users"
                default: throw new Error("Unavailable Route")
            }
        },
    },
    watch:{
        "$route"(val) {
            console.debug("change route ...", val)
            this._selectActive()
        }
    },
    created() {
        (this.isAdmin ? this.tabsAdmin : this.isSigned ? this.tabsSigned: [])
            .forEach(tab => this.tabs.push(this._mapping(tab)))

        if (!this.accessToken) return this.$router.replace({ name: "login" })
        if (this.user !== this.userIdentifier) {
            this.$store.$api.errorsHandler.session.wrongUserSession()
            this.loading = true
        }
    },
    methods: {
        _mapping(id) {
            return {
                id,
                ...this._infoTab(id),
                selected: id === this.active
            }
        },
        _infoTab(target) {
            switch (target) {
                case "account": return { title: "Account", route: "p-user-account" }
                case "recipes": return { title: "Ricette", route: "p-user-recipes" }
                case "foods": return { title: "Cibo", route: "p-user-foods" }
                case "friends": return { title: "Amici", route: "p-user-friends" }
                case "chats": return { title: "Chats", route: "p-user-chats" }
                case "notifications": return { title: "Notifiche", route: "p-user-notifications" }
                case "reports": return { title: "Segnalazioni", route: "p-user-reports" }
                case "users": return { title: "Utenti", route:  "p-user-users" }
            }
        },
        _selectActive() {
            let item = this.tabs.find(i => this.active === i.id)
            if (item) {
                item.selected = true
                this.tabs.filter(i => i.id !== this.active).forEach(i => i.selected = false)
            }
        },
        onClickTab(route) {
            this.$router.push({ name:  route })
        }
    },
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
