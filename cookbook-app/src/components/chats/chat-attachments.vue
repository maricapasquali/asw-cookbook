<template>
 <div v-if="items && items.length">
   <b-button variant="secondary" id="add-attachments" aria-label="allegati" :disabled="disabled" @click="show = true" >
     <b-icon-paperclip />
   </b-button>
   <div class="preview">

   </div>
   <b-modal id="attachments" v-model="show" hide-footer centered>
     <template #modal-title><slot name="title"></slot></template>
     <template #default>
       <b-container>
         <b-row cols="1">
           <b-col v-for="(item, index) in items" :key="index" @click="onClick(item)">
             <slot name="item" v-bind:item="item">
              <p> {{item}} </p>
             </slot>
           </b-col>
         </b-row>
       </b-container>
     </template>
   </b-modal>
 </div>
</template>

<script>
export default {
  name: "chat-attachments",
  props: {
    name: String,
    items: Array,
    disabled: Boolean
  },
  data(){
    return {
      show: false
    }
  },
  methods: {
    onClick(item){
      this.$emit('attachment-click', item)
      this.show = false
    }
  }
}
</script>

<style scoped>

</style>