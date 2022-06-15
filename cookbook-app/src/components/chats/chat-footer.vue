<template>
  <b-container class="py-4">
    <b-row
      v-if="isPresentAttachmentPreview"
      class="mb-2"
      align-h="center"
    >
      <b-col
        cols="8"
        class="px-0"
      >
        <attachment-preview
          :value="attachmentPreview"
          removable
          @removeAttachment="removeAttachment"
        />
        />
      </b-col>
    </b-row>
    <b-row align-v="start">
      <b-col
        cols="2"
        class="text-center pr-0"
      >
        <chat-attachments
          :items="attachmentsItems"
          :disabled="disabled"
          :search-field="attachmentSearchField"
          @attachment-click="onAttachmentClick"
        >
          <template #item="{ item }">
            <slot
              name="attachment-item"
              :item="item"
            />
          </template>
          <template #title>
            <slot name="attachment-title" />
          </template>
        </chat-attachments>
      </b-col>
      <b-col
        class="px-0"
        cols="8"
      >
        <b-form-group
          label-for="text-area-sender-mex"
          label="Mio Messaggio da inviare"
          label-sr-only
          class="m-0"
        >
          <b-form-textarea
            id="text-area-sender-mex"
            :value="text"
            placeholder="Inserisci testo"
            :disabled="disabled"
            @input="typing"
            @keydown.13.prevent
            @keydown.enter="sendText"
          />
        </b-form-group>
      </b-col>
      <b-col
        cols="2"
        class="text-center pl-0"
      >
        <b-button
          v-if="showSendBtn"
          variant="primary"
          :disabled="disabled"
          :aria-label="ariaLabelSend"
          @click="sendText"
        >
          <paper-plan-icon />
          <b-icon-paperclip v-if="includeAttachment" />
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PaperPlan from "@assets/icons/paper-plan.svg"

export default {
    name: "ChatFooter",
    components: {
        "paper-plan-icon": PaperPlan
    },
    props: {
        encrypted: Boolean, /* Note: message encryption is not implemented */

        disabled: Boolean,
        attachmentsItems: {
            type: Array,
            default() {
                return []
            }
        },
        attachment: {
            type: String,
            default: ""
        },
        attachmentSearchField: {
            type: String,
            default: ""
        },
        attachmentPreview: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            text: "",
            attachment_: ""
        }
    },
    computed: {
        ariaLabelSend() {
            return "invia messaggio" + (this.includeAttachment? " con un allegato":"")
        },

        isPresentAttachmentPreview() {
            return this.attachmentPreview && Object.keys(this.attachmentPreview).length > 0
        },


        showSendBtn() {
            return this.isValidText || this.disabled
        },
        isValidText() {
            return this.text.trim().length > 0
        },
        includeAttachment() {
            return this.attachment && this.text.indexOf(this.attachment) !== -1
        },
    },
    watch: {
        attachment(val) {
            this.attachment_ = val
        },
        attachment_(val, old) {
            if (val && !old) {
                if (this.text.length === 0) this.text = val
                else if (this.text.search(val) === -1) this.text += val
            } else if (val !== old) this.text = this.text.replace(old, val)

            console.debug("Old attachment = " + old + ", New attachment = " + val)
            console.debug("Text = ", this.text)
        },
        text(val) {
            console.debug("change text = ", this.text, ", attachment  = ", this.attachment_, ", text include attachment = ",  this.includeAttachment)
            this.$emit("write", val)
        }
    },
    methods: {
        sendText(e) {
            //CTRL + ENTER = \n
            //ENTER = send message

            if (e.ctrlKey) {
                this.text += "\n"
                return
            }
            if (this.isValidText) {
                if (this.encrypted) throw new Error("Message encryption is not implemented.")

                this.$emit("send-text", this.text, this.includeAttachment ? this.attachment_ : undefined)
                this.text = ""
            }
        },
        typing(val) {
            this.text = val

            this.$emit("typing", this.isValidText )
        },

        /* ATTACHMENTS */
        onAttachmentClick(item) {
            this.$emit("attachment-click", item)
        },
        removeAttachment() {
            this.attachment_ = ""
            console.debug("Remove attachment ...")
        }
    }
}
</script>

<style scoped>
#text-area-sender-mex{
  min-height: 62px;
}
</style>
