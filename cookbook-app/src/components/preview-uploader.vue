<template>
  <b-container
    class="file-uploader text-center"
    fluid
  >
    <b-modal
      v-if="imageType"
      v-model="zoom"
      centered
      hide-footer
      @hidden="closeZoomImage"
    >
      <b-img
        fluid
        center
        :src="load_file_preview"
      />
    </b-modal>
    <b-row>
      <b-col>
        <b-alert
          :show="error_.show"
          variant="danger"
          dismissible
        >
          {{ error_.text }}
        </b-alert>
      </b-col>
    </b-row>
    <b-row>
      <b-form-file
        v-show="false"
        :id="id"
        ref="uploader"
        :accept="accept"
        @change="loadFile"
      />
      <b-col v-if="videoType && load_file_preview">
        <video
          class="video-preview"
          :src="load_file_preview"
          controls
          @error="notFound"
        />
      </b-col>
      <b-avatar
        v-else
        :title="title"
        :icon="icon"
        :square="!avatar"
        variant="dark"
        :src="load_file_preview"
        :size="load_file_preview? 200: 100"
        class="mx-auto"
        @click.native="openZoomImage"
        @img-error="notFound"
      />
    </b-row>
    <b-row class="mt-1">
      <b-button-group class="mx-auto">
        <b-button
          v-if="isCancellable"
          title="Annulla modifiche"
          variant="secondary"
          :disabled="loading"
          @click="cancelChanges"
        >
          <font-awesome-icon icon="undo" />
        </b-button>
        <b-button
          :title="loading ? 'Caricamento preview ...' : 'Carica'"
          variant="primary"
          :disabled="loading"
          @click="clickLoad"
        >
          <b-icon-upload />
          <b-spinner
            v-if="loading"
            class="ml-2"
            label="Caricamento preview ..."
            small
          />
        </b-button>
        <b-button
          v-if="isRemovable"
          title="Cancella"
          variant="danger"
          :disabled="loading"
          @click="removeImage"
        >
          <b-icon-trash-fill />
        </b-button>
      </b-button-group>
    </b-row>
  </b-container>
</template>

<script>

export default {
    name: "PreviewUploader",
    props: {
        id: {
            type: String,
            required: true
        },
        avatar: Boolean,
        fileType: {
            type: String,
            enum: ["image", "video"],
            default() {
                return this.avatar ? "image" : ""
            }
        },
        default: {
            type: String,
            default: ""
        },
        zoomable: {
            type: Boolean,
            default: false
        },
        removable: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            file: new File([], ""),
            load_file_preview: "",
            zoom: false,
            remove: false,
            loading: false,
            error_: {
                show: false,
                text: ""
            }
        }
    },
    computed: {

        imageType() {
            return this.avatar || this.fileType === "image"
        },
        videoType() {
            return this.fileType === "video"
        },

        isCancellable() {
            return this.load_file_preview !== this.default || this.remove
        },
        isRemovable() {
            return this.removable && this.default
        },
        title() {
            return this.default && this.load_file_preview == null ? this.default + " NOT FOUND." : ""
        },
        icon() {
            if (this.avatar) return ""
            if (this.default && this.load_file_preview == null) return "file-earmark-x-fill"
            if (this.imageType) return "file-image"
            if (this.videoType) return "file-earmark-play"
            return "file"
        },
        accept() {
            if (this.imageType) return "image/*"
            if (this.videoType) return "video/*"
            throw new Error("No valid type")
        }
    },
    created() {
        this.load_file_preview = this.default
    },
    methods:{
        openZoomImage() {
            if (!this.zoomable || !this.load_file_preview) return
            console.debug("Open Zoom ...")
            this.zoom = true
        },
        closeZoomImage() {
            if (!this.zoomable || !this.load_file_preview) return
            console.debug("Close Zoom ...")
            this.zoom = false
        },
        clickLoad() {
            this.$refs.uploader.$el.firstChild.click()
        },
        notFound(event) {
            console.error(this.fileType + " (" + event?.target?.src + ") not found.. ")
            this.loading = false
            let error = event.target.error
            switch (error.code) {
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED: {
                    let ext = lastOf(this.file?.name?.split(".")) || ""
                    this.error_.text = "Formato del file (" + ext + ") non è supportato dal browser."
                }
                    break
                default:
                    this.error_.text = "Si è verificato un errore sconosciuto."
            }
            this.error_.show = true
            this.cancelChanges()
        },

        // CANCEL
        cancelChanges() {
            this.$refs.uploader.reset()
            this.load_file_preview = this.default
            this.remove = false
            this.$emit("cancelSelectFile")
        },
        // UPLOAD
        loadFile(e) {
            this.file = e.target.files[0]
            const KILOBYTE = 1024 // bytes
            const MEGABYTE = KILOBYTE * KILOBYTE
            if (this.file.size > 512 * MEGABYTE) {
                this.error_.show = true
                this.error_.text = "Il file troppo grande. Deve essere < 512 MB."
            } else {
                console.debug("File = " , this.file)
                this.loading = true
                if (this.imageType) return ReaderStreamImage.read(this.file, this.setFile.bind(this), this.errorHandler.bind(this))
                if (this.videoType) return ReaderStreamVideo.read(this.file, this.setFile.bind(this), this.errorHandler.bind(this))
            }
            this.loading = false
        },
        setFile(result) {
            this.loading = false
            if (result) {
                console.debug(`Load file ${this.file.type} preview...`)
                this.load_file_preview = result
                this.$emit("selectFile", this.file)
                // console.debug("Preview data = ", result)
                this.remove = false
                this.error_.show = false
            } else {
                console.error(`Fail load file ${this.file.type}.`)
                this.error_.show = true
                this.error_.text = "Caricamento fallito."
            }
        },
        errorHandler(error) {
            console.error(error)
            this.loading = false
            this.error_.show = true
            this.error_.text = `Il file non è un '${this.fileType}'.`
            console.error(this.error_.text)
        },

        // REMOVE
        removeImage() {
            if (this.isRemovable) {
                this.remove = true
                this.load_file_preview = ""
                this.file = new File([], "")
                this.$emit("selectFile", this.file)
            }
        },
    }
}
</script>

<style scoped>
.video-preview {
  object-fit: cover;
  height: auto;
  width: 100%;
}
</style>
