<template>
  <b-card
    v-if="show"
    class="mb-2"
    no-body
  >
    <b-container
      v-if="show"
      class="mb-2"
    >
      <b-row
        cols="1"
        cols-sm="1"
      >
        <b-col
          v-if="closable"
          class="text-right my-2"
        >
          <font-awesome-icon
            icon="times"
            class="icon mr-1"
            aria-label="Chiudi editor"
            @click="closeEditor"
          />
        </b-col>
        <b-col>
          <b-form-group label-for="mini-editor">
            <b-form-textarea
              id="mini-editor"
              v-model="content_"
              rows="6"
            />
          </b-form-group>
        </b-col>
        <b-col
          v-if="isContentNotEmpty"
          class="text-right"
        >
          <b-button
            variant="primary"
            @click="endEdit"
          >
            <slot name="edit">
              Edit
            </slot>
          </b-button>
        </b-col>
      </b-row>
    </b-container>
  </b-card>
</template>

<script>
export default {
    name: "MiniTextEditor",
    props: {
        value: {
            type: Boolean,
            default: true
        },
        noClosable: Boolean,
        resetContent: Boolean,
        content: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            show: true,
            content_: ""
        }
    },
    computed:{
        closable() {
            return !this.noClosable
        },
        isContentNotEmpty() {
            return this.content_.length > 0 && this.content_ !== this.content
        }
    },
    watch:{
        value(val) {
            this.show = val
        },
        resetContent(val) {
            if (val) {
                this.content_ = ""
                this.closeEditor()
            }
        }
    },
    mounted() {
        this.show = this.value
        this.content_ = this.content
    },
    methods: {
        closeEditor() {
            if (this.closable) {
                this.$emit("close")
                this.$emit("input", false)
            }
        },
        endEdit() {
            this.$emit("end-edit",this.content_)
        }
    }
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
