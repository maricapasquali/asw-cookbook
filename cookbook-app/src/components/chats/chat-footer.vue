<template>
  <b-container class="py-4">
    <b-row v-if="isPresentAttachmentPreview" class="mb-2" align-h="center">
      <b-col cols="8" class="px-0">
        <attachment-preview v-model="attachmentPreview" @removeAttachment="removeAttachment" removable/>
      </b-col>
    </b-row>
    <b-row align-v="start">
      <b-col cols="2" class="text-center pr-0">

        <chat-attachments :items="attachmentsItems" :disabled="disabled" :searchField="attachmentSearchField" @attachment-click="onAttachmentClick">
          <template v-slot:item="{ item }">
            <slot name="attachment-item" v-bind:item="item"></slot>
          </template>
          <template #title>
            <slot name="attachment-title"></slot>
          </template>
        </chat-attachments>

      </b-col>
      <b-col class="px-0" cols="8">
              <b-form-group label-for="text-area-sender-mex" label="Mio Messaggio da inviare" label-sr-only class="m-0">
                <b-form-textarea id="text-area-sender-mex" placeholder="Inserisci testo"
                                 v-model="text" @input="typing"
                                 @keydown.13.prevent
                                 @keydown.enter="sendText"  :disabled="disabled"/>
              </b-form-group>
      </b-col>
      <b-col cols="2" class="text-center pl-0" >
        <b-button v-if="showSendBtn" @click="sendText" variant="primary" :disabled="disabled" :aria-label="ariaLabelSend" >
          <paper-plan-icon />
          <b-icon-paperclip v-if="includeAttachment" />
        </b-button>
      </b-col>
    </b-row>
  </b-container>

</template>

<script>
import PaperPlan from '@assets/icons/paper-plan.svg'
export default {
  name: "chat-footer",
  components: {
    'paper-plan-icon': PaperPlan
  },
  props: {
    encrypted: Boolean,
    disabled: Boolean,

    attachmentsItems: Array,
    attachment: String,
    attachmentSearchField: String,
    attachmentPreview: Object
  },
  data(){
    return {
      text: '',
      _attachment: ''
    }
  },
  watch: {
    attachment(val, old){
      this.$data._attachment = val
    },
    '$data._attachment'(val, old){
      if(val && !old && this.text.length === 0) this.text = val
      else if(val !== old) this.text = this.text.replace(old, val)
      console.debug('Old attachment = ' + old + ', New attachment = ' + val)
      console.debug('Text = ', this.text)
    },
    text(val, old){
      this.$emit('write', val)
    }
  },
  computed: {
    ariaLabelSend(){
      return 'invia messaggio' + (this.includeAttachment? ' con un allegato':'')
    },

    isPresentAttachmentPreview(){
      return this.attachmentPreview && Object.keys(this.attachmentPreview).length
    },


    showSendBtn(){
      return this.isValidText || this.disabled
    },
    isValidText(){
      return this.text.trim().length > 0
    },
    includeAttachment(){
      return this.attachment && this.text.search(this.attachment) !== -1
    },
  },
  methods: {
    sendText(e){
      //CTRL + ENTER = \n
      //ENTER = send message

      if (e.ctrlKey) {
        this.text += "\n"
        return
      }
      if(this.isValidText){
        //TODO: IF SET encrypted, You encrypt MESSAGE
        this.$emit('send-text', this.text, this.includeAttachment ? this.$data._attachment : undefined)
        this.text = ''
      }
    },
    typing() {
      this.$emit('typing', this.isValidText )
    },

    /* ATTACHMENTS */
    onAttachmentClick(item){
      this.$emit('attachment-click', item)
    },
    removeAttachment(){
      this.$data._attachment = ''
    }
  }
}
</script>

<style scoped>
#text-area-sender-mex{
  min-height: 62px;
}
</style>