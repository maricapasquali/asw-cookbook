<template>
  <div class="select-with-image" v-click-outside="closeDropdown" >
    <div class="selected-input" >
       <img v-if="selected.value" width="20" height="20" v-on:error="errorIcon" :src="selected.src" :alt="selected.text"/>
       <b-form-input
           readonly
           :id="id"
           :type="type"
           :placeholder="placeholder"
           v-model="selected.text"
           v-on:click="toggleDropdown"
           :class="{'with-image': selected.value !== undefined && selected.text !== undefined}"
       ></b-form-input>
      <b-icon class="caret-up" font-scale="0.5" icon="caret-up-fill"></b-icon>
      <b-icon class="caret-down" font-scale="0.5" icon="caret-down-fill"></b-icon>
    </div>
    <div class="select-dropdown scroll rounded-bottom" v-if="showDropdown">
      <div class="disabled">
        <span class="options-text">{{placeholder}}</span>
      </div>
      <div v-for="opt in options" @click="select(opt)" :class="{'options-select': true, 'hover': opt.value === selected.value}" >
        <div class="options">
          <img width="20" height="20" :src="opt.src" :alt="opt.value" v-on:error="errorIcon"/>
          <span class="options-text">{{opt.text}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import click_outside from '@components/directives/click-outside' // CLICK FUORI
export default {
  name: "select-with-image",
  directives:{
    ClickOutside: click_outside
  },
  props:{
    id: String,
    options: Array,
    type: String,
    placeholder: String,
    value: String
  },
  data: function (){
    return {
      selected: {
        text: undefined,
        value: undefined
      },
      showDropdown: false
    }
  },
  created() {
    let i = this.options.findIndex(v => v.value === this.value)
    if(i!==-1) this.selected = this.options[i]
  },
  methods:{
    toggleDropdown: function (){
      this.showDropdown = !this.showDropdown
    },

    closeDropdown: function () {
      this.showDropdown = false
    },

    errorIcon: function (e){
      e.target.remove()
    },

    select: function (opt){
      this.selected = opt
      this.showDropdown = false
      this.$emit('select', this.selected)
    }
  }
}

</script>

<style lang="scss" scoped>

.caret-down{
  position: absolute;
  top: 18px;
  right: 13px;
}

.caret-up{
  position: absolute;
  top: 12px;
  right: 13px;
}

.select-with-image{
  position: relative;
}

.selected-input{
  position: relative;
  img{
    position: absolute;
    top: 10px;
    left: 10px;
  }
  input{
    cursor: default;
    background-color: white;
  }
  input:focus{
    box-shadow: none;
  }
}

.select-dropdown {
  position: absolute;
  width: 100%;
  z-index: 99
}

input:after {
  position: absolute;
  content: "";
  top: 14px;
  right: 10px;
  width: 0;
  height: 0;
}

.options-select{
  background-color: white;
  &:hover, &.hover{
    background-color: #398DFAED;
    cursor: default;
  }
}

.options{
  padding: 0.375rem 0.75rem
}

.options-text{
  padding: 0.375rem 0.75rem
}

.rounded-bottom{
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}

.scroll {
  height: 150px;
  overflow-y: auto;
}

.disabled{
  background-color: lightgray;
  span{
    color: gray;
  }
}

.with-image{
  padding-left: 36px;
}

</style>