<template>
  <div v-if="_thereAreAttachments">
    <b-button
      id="add-attachments"
      variant="secondary"
      aria-label="allegati"
      :disabled="disabled"
      @click="show = true"
    >
      <b-icon-paperclip />
    </b-button>
    <b-modal
      id="attachments"
      v-model="show"
      hide-footer
      centered
    >
      <template #modal-title>
        <slot name="title" />
      </template>
      <template #default>
        <b-container>
          <b-form-group
            label-for="search-attachments"
            label="Ricerca tra allegati"
            label-sr-only
          >
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text>
                  <b-icon-search />
                </b-input-group-text>
              </b-input-group-prepend>
              <b-form-input
                id="search-attachments"
                v-model="searchVal"
                type="search"
                placeholder="Ricerca ..."
              />
            </b-input-group>
          </b-form-group>
          <b-row
            cols="1"
            style="overflow: auto; height: 500px;"
          >
            <b-col
              v-for="(item, index) in _items"
              :key="index"
              @click="onClick(item)"
            >
              <slot
                name="item"
                :item="item"
              >
                <p> {{ item }} </p>
              </slot>
            </b-col>
            <b-col v-if="_items.length === 0">
              Nessun allegato trovato.
            </b-col>
          </b-row>
        </b-container>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
    name: "ChatAttachments",
    props: {
        items: {
            type: Array,
            default() {
                return []
            }
        },
        disabled: Boolean,
        searchField: {
            type: String,
            default: ""
        },
    },
    data() {
        return {
            show: false,

            searchVal: ""
        }
    },
    computed: {

        _thereAreAttachments() {
            return this.items && this.items.length > 0
        },

        _itemsContainSearchField() {
            return this.items.some(i => this._itemContainSearchField(i))
        },

        _items() {
            return this._itemsContainSearchField && this.searchVal.length ?
                this.items.filter(i => this._itemContainSearchField(i) && i[this.searchField].toLowerCase().startsWith(this.searchVal.toLowerCase())) :
                this.items
        }
    },
    methods: {
        _itemContainSearchField(item) {
            return isString(item[this.searchField])
        },

        onClick(item) {
            this.$emit("attachment-click", item)
            this.show = false
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
