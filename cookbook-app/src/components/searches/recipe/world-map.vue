<template>
  <b-container
    v-show="visibility"
    class="word-map px-0"
    fluid
  >
    <b-row
      class="map-container mx-1 p-0"
      cols="1"
    >
      <b-col class="map-container-header">
        <b-button-group>
          <b-button
            title="Reset zoom"
            @click="resetZoom"
          >
            <font-awesome-icon icon="undo" />
          </b-button>
          <b-button
            title="Zoom +"
            :disabled="noZoomIn"
            @click="zoomIn"
          >
            <b-icon-zoom-in />
          </b-button>
          <b-button
            title="Zoom -"
            :disabled="noZoomOut"
            @click="zoomOut"
          >
            <b-icon-zoom-out />
          </b-button>
        </b-button-group>
        <b-row
          v-if="hoverCountry"
          class="country-label-hover px-0 "
          cols="1"
          align-h="center"
          align-v="center"
        >
          <b-col
            v-if="hoverCountry.value && hoverCountry.text"
            class="text-center px-0"
          >
            <country-image v-model="hoverCountry.value" /> <span>{{ hoverCountry.text }}</span>
          </b-col>
          <b-col
            v-if="hoverCountry.recipes"
            class="text-center px-0"
          >
            <span># Ricette {{ hoverCountry.recipes }} </span>
          </b-col>
        </b-row>
      </b-col>


      <b-col class="map-container-body">
        <v-zoomer
          ref="zoom"
          class="zoom-map-container"

          zoomed.sync="out"
          :zooming-elastic="false"
          :limit-translation="false"
          :double-click-to-zoom="true"
          :min-scale="scale.min"
          :max-scale="scale.max"
        >
          <WorldSvg
            ref="world-map"
            class="world-map-svg"
            @mouseover.native="onMapHover"
            @click.native="onMapClick"
            @wheel.native="checkScale"
            @dblclick.native="checkScale"
            @mousedown.native="drag"
            @mouseup.native="drop"
          />
        </v-zoomer>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

import WorldSvg from "@assets/images/world.svg"

export default {
    name: "WorldMap",
    components: {
        WorldSvg,
    },
    props: {
        value: {
            type: Array,
            default: () => []
        },
        countries: {
            type: Array,
            default: () => []
        },
        visibility: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            selectableCountries: {},
            hoverCountry: "",

            noZoomIn: false,
            noZoomOut: true,
            scale: {
                max: 3,
                min: 0.5
            }
        }
    },
    watch: {
        countries(val) {
            val.map(country => ( { target: this.$refs["world-map"].$el.getElementsByClassName(country.refMap.class), country: country } ))
                .forEach(({ target, country }) => this.selectable(target, country.value, country))

            console.debug("Selectable countries: ", this.selectableCountries)

            this.value.forEach(cVal => {
                let found = this.selectableCountries[cVal]
                if (found && found.targets) found.targets.forEach(t => this.toggleSelect(t, cVal))
            })
            this._oldValue = clone(this.value)
        },
        value(val) {
            // console.debug('New value = ', JSON.stringify(val, null, 1))
            // console.debug('Old value = ', JSON.stringify(this._oldValue, null, 1))
            if (val) {
                if (val.length === 0) {
                    // on reset
                    Array.from(this.$refs["world-map"].$el.getElementsByClassName("selected"))
                        .forEach(target => target.classList.remove("selected"))
                } else if (this._oldValue.length > val.length) {
                    // on remove
                    diff(this._oldValue, val).forEach(c => {
                        let found = this.selectableCountries[c]
                        if (found  && found.targets) found.targets.forEach(t => t.classList.remove("selected"))
                    })
                } else if (this._oldValue.length < val.length) {
                    // on add
                    diff(val, this._oldValue).forEach(c => {
                        let found = this.selectableCountries[c]
                        if (found && found.targets) found.targets.forEach(t => t.classList.add("selected"))
                    })
                }
                this._oldValue = clone(val)
            }
        }
    },
    updated() {
        console.debug("map world components = ", this.$refs["world-map"])
    },
    methods: {

        selectable(target, countryVal, details = {}) {
            this.selectableCountries[countryVal] = {
                targets: [],
                details: details
            }
            Array.from(target).forEach(pathCountry => {
                pathCountry.classList.add("selectable")
                pathCountry.dataset.country = countryVal
                this.selectableCountries[countryVal].targets.push(pathCountry)
            })
            // console.debug('Make Selectable country : ', country.value)
            // console.debug(this.selectableCountries[country.value] )
        },

        isSelected(target) {
            return target.classList.contains("selected")
        },

        toggleSelect(target, countryVal) {
            target.classList.toggle("selected")

            if (this.isSelected(target)) {
                // console.debug('Select target ', countryVal)
                pushIfAbsent(this.value, countryVal)
            } else {
                // console.debug('DESelect target ', countryVal)
                removeIfPresent(this.value, countryVal)
            }
        },

        found(target) {
            return Object.entries(this.selectableCountries)
                .filter(([, v]) => v.targets.includes(target))
                .reduce((prev, current) => ( { _id: current[0], ...current[1] }) , undefined)
        },

        onMapClick(e) {
            let ct = this.found(e.target)
            if (ct && ct.targets) ct.targets.forEach(target => this.toggleSelect(target, ct._id))
        },

        onMapHover(e) {
            Array.from(document.getElementsByClassName("hover"))
                .forEach(h => h.classList.remove("hover"))

            let found = this.found(e.target)
            if (found && found.targets && found.details) {
                // console.debug(found)
                found.targets.forEach(target =>  target.classList.toggle("hover"))
                this.hoverCountry = found.details
            } else this.hoverCountry = ""

        },

        drag() {
            this.$refs["world-map"].$el.style.cursor = "grabbing"
        },
        drop() {
            this.$refs["world-map"].$el.style.cursor = "grab"
        },
        resetZoom() {
            this.$refs.zoom.reset()
            // console.debug('Reset zoom ')
            this.checkScale()
        },
        checkScale() {
            this.noZoomIn = this.$refs.zoom.scale === this.scale.max
            this.noZoomOut = this.$refs.zoom.scale === this.scale.min

            // console.debug('Check Scale: ' + this.$refs.zoom.scale)
        },
        zoomIn() {
            this.$refs.zoom.zoomIn()
            this.checkScale()
        },
        zoomOut() {
            this.$refs.zoom.zoomOut()
            this.checkScale()
        },
    }
}
</script>

<style lang="scss">
$map-hover: #9b9b9b4c;
$map-select: #3a8ff3;

.map-container {
  background-color: $background-color;
  position: relative;
  border: 2px solid lightgray;
  border-radius: 10px;
  padding: 1%;

  & .map-container-header {
    position: absolute;
    top: 17px;
    z-index: 10;

    & .country-label-hover {
      background-color: white;
      padding: 10px;
      box-shadow: 4px 3px 15px;
      border-radius: 10px;
      float: right;
      margin-right: 0;
      margin-top: 5px;
    }
  }

  & .map-container-body {
    padding: 0;

    & .zoom-map-container {
      width: 100%;
      height: 857px;

      & svg.world-map-svg {
        object-fit: contain;
        transform: scale(0.85);
        height: 100%;
        position: absolute;
        left: -131px;
        top: 0;

        & .selectable {
          fill: white;
          cursor: pointer;
        }

        & .hover {
          fill: $map-hover;
          filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 40%));
        }

        & .selected,
        & .hover.selected {
          fill: $map-select;
          filter: none;
        }
      }
    }
  }
}

</style>
