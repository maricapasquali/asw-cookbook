<template>
  <div tabindex="0"
       class="custom-select"
       v-outside="closeDropdown"
       @click="showDropdown = true"
       @keyup.up.prevent="prevOpt"
       @keyup.down.prevent="nextOpt"
       @keyup.left.passive="prevOpt"
       @keyup.right.prevent="nextOpt"
       @keyup.enter="closeDropdown"
  >
    <b-row class="selected-input">
      <b-col v-if="selected.value" cols="1">
        <img  width="20" height="20" v-on:error="errorIcon" :src="selected.src" :alt="selected.text"/>
      </b-col>
      <b-col class="text-selected "> <span> {{selected.text}} </span> </b-col>
    </b-row>
    <b-container v-if="showDropdown" class="select-dropdown" >
      <b-row v-if="placeholder" :class="classObjOptions()" class="options-select disabled">
        <b-col>{{placeholder}}</b-col>
      </b-row>
      <b-row v-for="opt in options" @click="select(opt)" :key="opt.value" :class="classObjOptions(opt)" >
        <b-col v-if="opt.src" cols="1">
          <img width="20" height="20" :src="opt.src" :alt="opt.value" v-on:error="errorIcon"/>
        </b-col>
        <b-col>
          <span class="options-text">{{opt.text}}</span>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import outside from '@components/directives/outside' // CLICK FUORI
export default {
  name: "select-with-image",
  directives:{ outside },
  props:{
    id: String,
    options: Array,
    type: String,
    placeholder: String,
    value: String,
    tabindex: String
  },
  data: function (){
    return {
      indexSelected: 0,
      showDropdown: false,
      selected: null
    }
  },
  watch:{
    value(val, old){
      this.setValueText(val)
    }
  },
  created() {
    this.setValueText()
    document.addEventListener('scroll', this.closeDropdown.bind(this))
  },
  beforeDestroy() {
    document.removeEventListener('scroll', this.closeDropdown.bind(this))
  },
  computed: {
    defaultValue() {
      if(this.placeholder){
        this.indexSelected = -1
        return { text: this.placeholder, value: '' }
      }else{
        this.indexSelected = 0
        return this.options[this.indexSelected]
      }
    }
  },
  methods:{
    classObjOptions: function (opt = this.defaultValue){
      return {
        'options-select': true,
        'hover': opt.value === this.selected.value
      }
    },

    nextOpt(){
      if(this.indexSelected < this.options.length - 1){
        this.selected = this.options[++this.indexSelected]
        console.debug('down key: select ', this.indexSelected)
      }
    },
    prevOpt(){
      if(this.indexSelected > 0){
        this.selected = this.options[--this.indexSelected]
        console.debug('up key: select ', this.indexSelected)
      }
    },


    closeDropdown: function () {
      this.showDropdown = false
    },

    errorIcon: function (e){
      e.target.remove()
    },

    setValueText(val = this.value){
      this.indexSelected = this.options.findIndex(v => v.value === val)
      if(this.indexSelected === -1) this.selected = this.defaultValue
      else this.selected = this.options[this.indexSelected]

      console.debug('Selected = ', this.selected, ', Index selected = ', this.indexSelected)
    },

    select: function (opt = this.defaultValue){
      console.debug('Select = ', opt)
      this.$emit('input', opt.value)
      this.closeDropdown();
    }
  }
}

</script>

<style lang="scss" scoped>

.custom-select:focus-visible{
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
}
.focus{
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
}
.custom-select {
  position: relative;
  > * {
    cursor: default;
  }

  .select-dropdown {
    max-height: 440px;
    overflow-y: auto;

    border-radius: 10px;

    border: 1px solid #a8a8a8;
    box-shadow: 0 4px 4px grey;
    position: absolute;
    width: 100%;
    top: 37px;
    right: 0;
    z-index: 1;

    .options-select{
      background-color: white;
      &:hover:not(.disabled), &.hover{
        //background-color: #98D2ECFF; /*mobile*/
        background-color: $component-color; /*desktop*/
        color: white;
        cursor: default;
      }
      &.disabled.hover{
        background-color: lightgray;
        color: white;
      }
      &.disabled{
        color: #b9b9b9;
      }
    }
  }
}

@media  (max-width: 768px){
  .options-select{
    padding: 0.35rem 0;
    &:hover:not(.disabled), &.hover {
      background-color: #98D2ECFF!important; /*mobile*/
    }
  }
}

</style>