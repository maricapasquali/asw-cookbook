<template>
  <div :class="{ 'input-group': showSwitch_ }">
    <b-form-input
      :id="id"
      :value="value"
      :placeholder="placeholder"
      :type="type"
      :required="required"
      :state="state"
      autocomplete="on"
      @input="changeValue"
    />
    <b-input-group-append v-if="showSwitch_">
      <b-button
        tabindex="-1"
        :title="title"
        :variant="variant"
        @click="switchVisibility"
      >
        <b-icon :icon="icon" />
      </b-button>
    </b-input-group-append>
  </div>
</template>

<script>
export default {
    name: "InputPasswordSwitchVisibility",
    props: {
        id: {
            type: String,
            required: true,
            default: "form-input"
        },
        value: {
            type: String,
            required: true
        },
        placeholder: {
            type: String,
            default: ""
        },
        required: Boolean,
        state: {
            type: Boolean,
            required: false,
            default: undefined
        }
    },
    data() {
        return {
            showPassword_: null,
            showSwitch_: false
        }
    },
    computed: {
        icon() {
            return this.showPassword_ ? "eye-slash-fill": "eye-fill"
        },
        title() {
            return `${this.showPassword_ ? "Nascondi": "Mostra"} password`
        },
        type() {
            return this.showPassword_ ? "text": "password"
        },
        variant() {
            return this.showPassword_ ? "secondary" : "primary"
        }
    },
    methods: {
        changeValue(val) {
            this.showSwitch_ = val?.length > 0
            this.$emit("input", val)
        },

        switchVisibility() {
            this.showPassword_ = !this.showPassword_
        }
    }
}
</script>

<style scoped>

</style>
