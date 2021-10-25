<template>
  <p>{{elapsedTimeStamp}}</p>
</template>

<script>

export default {
  name: "elapsed-time",
  props:{
    value: Number,
    timeout: {
      type: Number,
      default: 60000 /* 1 minute */
    },
    language: {
      type: String,
      default: 'it'
    }
  },
  data(){
    return {
      polling: null,
      elapsedTimeStamp: null
    }
  },
  methods:{
    elapsed(){
      // this.elapsedTimeStamp = Utils.toElapsedTimeFromNow(this.value, this.language)
      let SEPARATOR = ' ', NOW, HOURS, MIN, DAYS
      switch (this.language){
        case 'it':
          NOW = 'ora'
          HOURS = 'h fa'
          MIN = 'min fa'
          DAYS = 'g fa'
          break
        default:
          NOW = 'now'
          HOURS = 'h ago'
          MIN = 'm ago'
          DAYS = 'd ago'
      }
      let timestampNow = Date.now()

      let millisec = (timestampNow - this.value)
      let sec = Math.floor(millisec/1000)
      if(sec >= 0 && sec < 60) return this.elapsedTimeStamp = NOW

      let min = Math.floor(sec / 60)
      if(min >= 1 && min < 60) return this.elapsedTimeStamp = min + SEPARATOR + MIN

      let hour = Math.floor(min / 60)
      if(hour >= 1 && hour < 24) return this.elapsedTimeStamp = hour + SEPARATOR + HOURS

      let day = Math.floor(hour / 24)
      if (day >= 1 && day < 7) return this.elapsedTimeStamp = day + SEPARATOR + DAYS

      this.elapsedTimeStamp = new Date(this.value).toLocaleDateString()
    }
  },
  mounted() {
    this.elapsed()
    this.polling = setInterval(this.elapsed.bind(this), this.timeout)
  },
  beforeDestroy() {
    clearInterval(this.polling)
  }
}
</script>

<style scoped></style>