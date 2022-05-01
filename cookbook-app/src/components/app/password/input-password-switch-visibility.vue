<template>
  <div :class="{ 'input-group': $data._showSwitch }">
    <b-form-input
        :id="id"
        :value="value"
        :placeholder="placeholder"
        :type="type"
        :required="required"
        :state="state"
        @input="changeValue"
        ref="form-input"
        autocomplete="on"
    />
    <b-input-group-append v-if="$data._showSwitch" >
      <b-button tabindex="-1" :title="title" @click="switchVisibility" :variant="variant">
        <b-icon :icon="icon" />
      </b-button>
    </b-input-group-append>
  </div>
</template>

<script>
export default {
  name: "input-password-switch-visibility",
  props: {
    id: String,
    placeholder: String,
    required: Boolean,
    state: Boolean | undefined,

    value: String,
    referer: String
  },
  data(){
    return {
      _showPassword: null,
      _showSwitch: false
    }
  },
  computed: {
    icon(){
      return this.$data._showPassword ? 'eye-slash-fill': 'eye-fill'
    },
    title() {
      return `${this.$data._showPassword ? 'Nascondi': 'Mostra'} password`;
    },
    type(){
      return this.$data._showPassword ? 'text': 'password'
    },
    variant(){
      return this.$data._showPassword ? 'secondary' : 'primary'
    }
  },
  methods: {
    changeValue(val){
      this.$data._showSwitch = val?.length > 0
      this.$emit("input", val)
    },

    switchVisibility(){
      this.$data._showPassword = !this.$data._showPassword
    }
  }
}
</script>

<style scoped>

</style>