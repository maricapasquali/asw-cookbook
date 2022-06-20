<template>
  <b-container class="col-12">
    <b-row>
      <b-col
        cols="12"
        :class="{'px-0': true, 'hidden': !useBasedSelect}"
      >
        <b-container>
          <b-row align-v="center">
            <b-input-group-prepend
              v-if="isPassedSlotPrependIcon"
              class="col-0"
            >
              <b-input-group-text class="py-2 rounded-left">
                <slot name="icon-prepend" />
              </b-input-group-text>
            </b-input-group-prepend>
            <b-form-select
              :id="id"
              :value="selected.value"
              :class="customSelectClasses"
              :disabled="disabled"
              @input="select($event)"
            >
              <b-form-select-option
                v-for="opt in options_"
                :key="opt.value"
                :value="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.text }}
              </b-form-select-option>
            </b-form-select>
          </b-row>
        </b-container>
      </b-col>
      <!-- CUSTOM SELECT -->
      <b-col
        v-if="!useBasedSelect"
        cols="12"
        class="px-0"
      >
        <b-container class="mx-0 col-12">
          <b-row align-v="center">
            <b-col
              v-if="isPassedSlotPrependIcon"
              cols="0"
            >
              <b-input-group-prepend>
                <b-input-group-text class="py-2 rounded-left">
                  <slot name="icon-prepend" />
                </b-input-group-text>
              </b-input-group-prepend>
            </b-col>

            <div
              :id="id"
              :ref="customSelectId"
              v-outside="closeDropdown"
              v-scroll="closeDropdown"
              :class="customSelectClasses"
              :tabindex="tabindex"
              @focusout="closeDropdown"
              @click="showDropdown = !disabled"
              @keyup.up.prevent="_prevOpt"
              @keyup.down.prevent="_nextOpt"
              @keyup.left.prevent="_prevOpt"
              @keyup.right.prevent="_nextOpt"
              @keyup.enter="closeDropdown"
            >
              <b-row class="selected-input">
                <b-col
                  v-if="selected.value && selected.src"
                  cols="1"
                >
                  <img
                    width="20"
                    height="20"
                    :src="selected.src"
                    :alt="selected.text"
                    @error="errorIcon"
                  >
                </b-col>
                <b-col class="text-selected ">
                  <span> {{ selected.text }} </span>
                </b-col>
              </b-row>
              <!-- SELECT DROPDOWN -->
              <b-container
                v-if="showDropdown"
                fluid
                class="select-dropdown"
                @mouseenter="_disableScrollWindow"
                @mouseleave="_enableScrollWindow"
              >
                <b-row
                  v-for="(opt, ind) in options_"
                  :key="opt.value"
                  :class="classObjOptions(opt)"
                  @click="select(opt)"
                  @mouseover="onHoverOption(ind)"
                >
                  <b-col
                    v-if="opt.src"
                    cols="1"
                  >
                    <img
                      width="20"
                      height="20"
                      :src="opt.src"
                      :alt="opt.value"
                      @error="errorIcon"
                    >
                  </b-col>
                  <b-col>
                    <span class="options-text">{{ opt.text }}</span>
                  </b-col>
                </b-row>
              </b-container>
            </div>
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
    name: "CustomSelect",
    props:{
        id: {
            type: String,
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        value: {
            type: String,
            default: ""
        },
        placeholder: {
            type: String,
            default: ""
        },
        tabindex: {
            type: Number,
            default: 0
        },
        state: {
            type: Boolean,
            required: false,
            default: undefined
        },
        disabled: Boolean,

        useBasedSelect: Boolean
    },
    data() {
        return {
            indexSelected: null,
            showDropdown: false,

            selected: null,
            options_: [],
            defaultValue: null
        }
    },
    computed: {
        isPassedSlotPrependIcon() {
            return !!this.$slots["icon-prepend"]
        },
        customSelectClasses() {
            return {
                "col": true,
                "custom-select": true,
                "is-valid": this.state === true,
                "is-invalid": this.state === false,
                "disabled": !this.useBasedSelect && this.disabled,
                "rounded-right" : this.isPassedSlotPrependIcon
            }
        },
        customSelectId() {
            return "custom-select-"+this.id
        },
        isActiveElement() {
            return document.activeElement === this.$refs[this.customSelectId]
        }
    },
    watch:{
        value(val) {
            this.setValueText(val)
        },
        showDropdown(val) {
            if (val) this.$nextTick(() => window.scrolling.addScrollingEnable(document.querySelector(".select-dropdown")))
            else window.scrolling.cleanScrollingEnables()
        },
        defaultValue(val) {
            this.indexSelected = this.placeholder && !val.value ? -1 : 0
        },
        options(vl) {
            this.setOptions(vl)
        }
    },
    created() {
        this.setOptions(this.options)
        this.setValueText(this.value)
    },
    methods:{
        setOptions(opts) {
            this.options_ = clone(opts)
            this.defaultValue = this.placeholder ? { text: this.placeholder, value: undefined, disabled: true } : this.options_[0]
            prependIfAbsent(this.options_, this.defaultValue)
        },

        classObjOptions(opt) {
            return {
                "options-select": true,
                "hover": !opt?.disabled && opt?.value === this.selected.value,
                "disabled": opt?.disabled
            }
        },

        _nextOpt() {
            if (this.isActiveElement) this._disableScrollWindow()

            if (this.indexSelected < this.options_.length - 1) {
                this.selected = this.options_[++this.indexSelected]
                this.onHoverOption(this.indexSelected)
                console.debug("Next: select ", this.indexSelected)
            }
        },
        _prevOpt() {
            if (this.isActiveElement) this._disableScrollWindow()

            if (this.indexSelected > 0) {
                this.selected = this.options_[--this.indexSelected]
                this.onHoverOption(this.indexSelected)
                console.debug("Previous: select ", this.indexSelected)
            }
        },

        _disableScrollWindow() {
            if (!this._disabledScrolling) {
                window.scrolling.disable()
                this._disabledScrolling = true
            }
        },
        _enableScrollWindow() {
            this.hoverOnHoveredLast()
            if (this._disabledScrolling) {
                window.scrolling.enable()
                this._disabledScrolling = false
            }
        },

        hoverOnHoveredLast() {
            let hoveredOption = Array.from(document.querySelectorAll("div.options-select:not(.disabled)"))
                .find((o,i) => (this.placeholder ? i + 1 : i ) === this.indexSelected)

            if (hoveredOption) hoveredOption.classList.add("hover")
        },

        onHoverOption(index) {
            this.indexSelected = index
            Array.from(document.querySelectorAll("div.options-select:not(.disabled)"))
                .forEach((option, i) => {
                    if ((this.placeholder ? i + 1 : i ) === this.indexSelected) option.classList.add("hover")
                    else option.classList.remove("hover")
                })
        },

        closeDropdown() {
            if (this.showDropdown) {
                this._enableScrollWindow()
                this.showDropdown = false
            }
        },

        errorIcon(e) {
            e.target.remove()
        },

        setValueText(val) {
            this.indexSelected = this.options_.findIndex(v => v.value === val)
            this.selected = this.indexSelected === -1 ? this.defaultValue : this.options_[this.indexSelected]
            console.debug("Selected = ", this.selected, ", Index selected = ", this.indexSelected)
        },

        select(opt) {
            if (!opt.disabled) {
                if (isString(opt)) opt = this.options_.find(o => o.value === opt)

                let _option = opt || this.defaultValue
                this.$emit("input", _option.value)
                if (isDefined(this.state)) this.$emit("change", _option.value)
                this.closeDropdown()
            }
        }
    }
}

</script>

<style lang="scss" scoped>
.custom-select {
  position: relative;

  &:focus-visible {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 25%);
  }

  > * {
    cursor: default;
  }

  .select-dropdown {
    max-height: 300px;
    overflow-y: auto;
    border-radius: 10px;
    border: 1px solid #a8a8a8;
    box-shadow: 0 4px 4px grey;
    position: absolute;
    top: 37px;
    right: 0;
    left: 0;
    z-index: 4;

    .options-select {
      padding: 0.25rem;
      background-color: white;

      &.hover {
        background-color: $component-color; /* desktop */
        color: white;
        cursor: default;
      }

      &.disabled.hover {
        background-color: lightgray;
        color: white;
      }

      &.disabled {
        color: #b9b9b9;
      }
    }
  }
}

.custom-select.disabled {
  color: #6c757d;
  background-color: #e9ecef;
  opacity: 0.65;

  &:focus {
    box-shadow: none;
    outline: none;
    border-color: lightgray;
  }
}

</style>
