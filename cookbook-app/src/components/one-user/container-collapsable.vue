<template>
  <b-container
    class="collapsable-container"
    fluid
  >
    <b-row
      v-b-toggle="identifier"
      align-h="between"
    >
      <b-col
        v-if="title"
      >
        {{ title }}
      </b-col>
      <b-col class="text-right">
        <b-icon-chevron-up v-if="showSectionCollapse" />
        <b-icon-chevron-down v-else />
      </b-col>
    </b-row>
    <b-collapse
      :id="identifier"
      class="element-collapse"
    >
      <b-row
        cols="1"
        class="mx-3"
      >
        <slot name="collapse-content" />
      </b-row>
      <b-row>
        <load-others
          :in-processing="othersInProgress"
          :are-others="withLoadingOthers"
          link-variant="light"
          spinner-variant="light"
          @load="loadingOthers"
        >
          <template #btn-content>
            <slot name="load-others" />
          </template>
        </load-others>
      </b-row>
    </b-collapse>
  </b-container>
</template>

<script>
export default {
    name: "ContainerCollapsable",
    props: {
        id: {
            type: String,
            require: true,
            default: "default"
        },
        title: {
            type: String,
            default: ""
        },
        withLoadingOthers: {
            type: Boolean,
            default: false
        },
        othersInProgress: Boolean
    },
    data() {
        return {
            showSectionCollapse: false
        }
    },
    computed: {
        identifier() {
            return "element-collapse-"+ this.id
        }
    },
    mounted() {
        this.$root.$on("bv::collapse::state", this.collapseListener.bind(this))
    },
    methods: {
        collapseListener(id, isJustShown) {
            if (id === this.identifier) {
                // this.$emit('collapsed', {elementId: id, show: isJustShown})
                this.showSectionCollapse = isJustShown
                this.$emit("collapsed", { show: isJustShown })
            }
        },
        loadingOthers() {
            if (!this.withLoadingOthers) throw new Error("Loading Others: Funzionalità non attivata.")
            this.$emit("load-others")
        }
    }
}
</script>

<style lang="scss" scoped>
.collapsable-container {
  background-color: $component-color;
  border-radius: 10px;
  margin: 5% auto;
  border: 1px dashed black;
  color: white;

  & > div {
    margin: 10px 0;

    & > div {
      padding: 1%;
    }
  }

  & > div.element-collapse {
    color: black;
  }
}
</style>
