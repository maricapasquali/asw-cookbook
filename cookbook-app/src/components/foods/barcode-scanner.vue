<template>
  <div>
    <b-modal v-model="$data._show" id="barcode-scanner" title="Barcode Scanner" hide-footer>
      <b-row>
        <b-col>
          <StreamBarcodeReader @loaded="onLoaded" @decode="onDecode" @error="onError" />
          <span v-if="!$data._loadedScanner"> Caricamento ... </span>
        </b-col>
      </b-row>
      <b-row align-h="between" align-v="center" class="mt-2" v-if="!noManual">
        <b-col>
          <b-form-group label-for="s-barcode" class="mb-0">
            <b-form-input type="search" id="s-barcode" placeholder="codice a barre" v-model="code" @keyup.enter="onDecode(code)"/>
          </b-form-group>
        </b-col>
      </b-row>
    </b-modal>

    <b-button variant="primary" title="Scansiona barcode" @click="$data._show = true" v-if="show">
      <font-awesome-icon :size="iconSize" :class="'icon ' + iconClass" icon="barcode" />
    </b-button>
  </div>
</template>

<script>
import {ImageBarcodeReader, StreamBarcodeReader} from "vue-barcode-reader";
export default {
  name: "barcode-scanner",
  props:{
    value: String,
    show: Boolean,
    noManual:{
      type: Boolean,
      default: false,
    },
    iconSize: {
      type: String,
      default: '1x'
    },
    iconClass: {
      type: String,
      default: ""
    }
  },
  components: {
    ImageBarcodeReader,
    StreamBarcodeReader
  },
  data(){
    return {
      code: '',
      _show: false,
      _loadedScanner: false
    }
  },
  watch: {
    '$data._show'(val){
      console.debug('show modal barcode ', val)
      if(!val) {
        this.$data._loadedScanner = false
        this.$emit('close')
      }
    }
  },
  methods: {
    resetFormBarcode(){
      this.$bvModal.hide('barcode-scanner')
    },
    onLoaded(){
      console.debug('Barcode-Scanner: On Loaded ')
      this.$data._loadedScanner = true
    },
    onDecode(barcodeNumber) {
      console.debug('Barcode-Scanner: On Decode = ', barcodeNumber)
      this.$emit('onFound', barcodeNumber)
      this.resetFormBarcode()
    },
    onError(e){
      console.debug('Barcode-Scanner: On Error = ', {barcode: 'not-found'})
      this.$emit('onError', {barcode: 'not-found'})
      this.resetFormBarcode();
    },
    onResetFormBarcode(){
      this.code = ''
      this.$emit('reset')
    }
  },
}
</script>

<style scoped>
</style>