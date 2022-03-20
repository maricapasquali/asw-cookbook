<template>
  <div>
    <window-with-resize size="sm" @in-bound="$data._stacked=$event">
      <b-table
          :id="id" class="text-center"
          :items="permissions" :fields="fields"
          striped :stacked="$data._stacked"
          :per-page="pagination.per" :current-page="pagination.current">
        <template #cell(user)="row">
          <span v-if="userIdentifier === row.value._id" > io </span>
          <router-link v-else :to="route(row.value)"> {{row.value.userID}}</router-link>
        </template>
        <template #cell(granted)="row">
          <span> {{ row.value | permission }} </span>
        </template>
      </b-table>
    </window-with-resize>
    <b-pagination v-if="showPagination" :aria-controls="id" v-model="pagination.current" :per-page="pagination.per" :total-rows="permissions.length" align="fill"/>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import UserMixin from '@components/mixins/user.mixin'
export default {
  name: "permission-list",
  mixins: [UserMixin],
  props: {
    id: {
      type: String,
      required: true
    },
    value: {
      user: Object,
      required: true,
      granted: {
        type: String,
        enum: ['root', 'read', 'read-write']
      }
    }
  },
  data(){
    return {
      _stacked: false,
      fields: [
        {
          key: 'user',
          label: 'Utente',
        },
        {
          key: 'granted',
          label: 'Permessi',
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
    permissions(){
      return this.value?.filter(permission => permission.user) || []
    },
    showPagination(){
      return this.permissions.length > this.pagination.per
    },
  },
  filters: {
    permission(granted){
      switch (granted){
        case 'read': return 'Lettura'
        case 'read-write': return 'Lettura e Scrittura'
        case 'root': return ' Lettura, Scrittura e Cancellazione'
      }
    },
  },
  methods:{
    route(user){
      return { name: 'single-user', params: { id: user?._id } }
    },
    /* Listeners update */
    onUpdateInfos(userInfo) {
      this.value.filter(permission => permission.user?._id === userInfo._id).forEach(permission => this._updateUserInformation(permission.user, userInfo))
    },
    onDeletedUserListeners(id){
      removeIfPresent(this.value, permission => permission.user?._id === id)
    },
  },
  created() {
    this.$bus.$on('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$on('user:delete', this.onDeletedUserListeners.bind(this))
  },
  beforeDestroy() {
    this.$bus.$off('user:update:info', this.onUpdateInfos.bind(this))
    this.$bus.$off('user:delete', this.onDeletedUserListeners.bind(this))
  }
}
</script>

<style scoped>

</style>