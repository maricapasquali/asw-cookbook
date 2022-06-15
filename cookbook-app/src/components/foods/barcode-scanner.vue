<template>
  <div>
    <b-modal
      id="barcode-scanner"
      v-model="show_"
      title="Barcode Scanner"
      hide-footer
    >
      <b-row>
        <b-col>
          <StreamBarcodeReader
            @loaded="onLoaded"
            @decode="onDecode"
            @error="onError"
          />
          <span v-if="!loadedScanner"> Caricamento ... </span>
        </b-col>
      </b-row>
      <b-row
        v-if="!noManual"
        align-h="between"
        align-v="center"
        class="mt-2"
      >
        <b-col>
          <b-form-group
            label-for="s-barcode"
            class="mb-0"
          >
            <b-form-input
              id="s-barcode"
              v-model="code"
              type="search"
              placeholder="codice a barre"
              @keyup.enter="onDecode(code)"
            />
          </b-form-group>
        </b-col>
      </b-row>
    </b-modal>

    <b-button
      v-if="show"
      variant="primary"
      title="Scansiona barcode"
      @click="show_ = true"
    >
      <font-awesome-icon
        :size="iconSize"
        :class="'icon ' + iconClass"
        icon="barcode"
      />
    </b-button>
  </div>
</template>

<script>
import { StreamBarcodeReader } from "vue-barcode-reader"

export default {
    name: "BarcodeScanner",
    components: {
        StreamBarcodeReader
    },
    props:{
        show: Boolean,
        noManual:{
            type: Boolean,
            default: false,
        },
        iconSize: {
            type: String,
            default: "1x"
        },
        iconClass: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            code: "",

            show_: false,
            loadedScanner: false
        }
    },
    watch: {
        show_(val) {
            console.debug("show modal barcode ", val)
            if (!val) {
                this.loadedScanner = false
                this.$emit("close")
            }
        }
    },
    methods: {
        resetFormBarcode() {
            this.$bvModal.hide("barcode-scanner")
        },
        onLoaded() {
            console.debug("Barcode-Scanner: On Loaded ")
            this.loadedScanner = true
        },
        onDecode(barcodeNumber) {
            console.debug("Barcode-Scanner: On Decode = ", barcodeNumber)
            this.$emit("onFound", barcodeNumber)
            this.resetFormBarcode()
        },
        onError() {
            console.debug("Barcode-Scanner: On Error = ", { barcode: "not-found" })
            this.$emit("onError", { barcode: "not-found" })
            this.resetFormBarcode()
        },
        onResetFormBarcode() {
            this.code = ""
            this.$emit("reset")
        }
    },
}
</script>

<style scoped>
/* stylelint-disable no-empty-source */
</style>
