<template>
  <div>
    <window-with-resize
      size="sm"
      @in-bound="stacked_=$event"
    >
      <b-table
        :id="id"
        class="text-center"
        :items="permissions"
        :fields="fields"
        striped
        :stacked="stacked_"
        :per-page="pagination.per"
        :current-page="pagination.current"
      >
        <template #cell(user)="row">
          <span v-if="userIdentifier === row.value._id"> io </span>
          <router-link
            v-else
            :to="route(row.value)"
          >
            {{ row.value.userID }}
          </router-link>
        </template>
        <template #cell(granted)="row">
          <span> {{ row.value | permission }} </span>
        </template>
      </b-table>
    </window-with-resize>
    <b-pagination
      v-if="showPagination"
      v-model="pagination.current"
      :aria-controls="id"
      :per-page="pagination.per"
      :total-rows="permissions.length"
      align="fill"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { UserMixin } from "@mixins"

export default {
    name: "PermissionList",
    filters: {
        permission(granted) {
            switch (granted) {
                case "read": return "Lettura"
                case "read-write": return "Lettura e Scrittura"
                case "root": return " Lettura, Scrittura e Cancellazione"
            }
        },
    },
    mixins: [UserMixin],
    props: {
        id: {
            type: String,
            required: true
        },
        value: { // [{ user: Object, granted: { type: String, enum: ["root", "read", "read-write"] } }]
            type: Array,
            required: true,
            validator(val) {
                return val.every(v => v.user && v.granted && ["root", "read", "read-write"].includes(v.granted))
            }
        }
    },
    data() {
        return {
            stacked_: false,
            fields: [
                {
                    key: "user",
                    label: "Utente",
                },
                {
                    key: "granted",
                    label: "Permessi",
                }
            ],
            pagination: {
                per: 5,
                current: 1
            }
        }
    },
    computed: {
        ...mapGetters({
            userIdentifier: "session/userIdentifier"
        }),
        permissions() {
            return this.value?.filter(permission => permission.user) || []
        },
        showPagination() {
            return this.permissions.length > this.pagination.per
        },
    },

    created() {
        this.$bus.$on("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$on("user:delete", this.onDeletedUserListeners.bind(this))
    },
    beforeDestroy() {
        this.$bus.$off("user:update:info", this.onUpdateInfos.bind(this))
        this.$bus.$off("user:delete", this.onDeletedUserListeners.bind(this))
    },
    methods:{
        route(user) {
            return { name: "single-user", params: { id: user?._id } }
        },
        /* Listeners update */
        onUpdateInfos(userInfo) {
            this.value.filter(permission => permission.user?._id === userInfo._id).forEach(permission => this._updateUserInformation(permission.user, userInfo))
        },
        onDeletedUserListeners(id) {
            removeIfPresent(this.value, permission => permission.user?._id === id)
        },
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
