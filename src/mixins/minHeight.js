const mixin = {
  data() {
    return {
      isMounted: false,
      elementHeight: 0
    }
  },
  computed: {
    minHeight() {
      if (!this.isMounted) return;
      if (this.formShow !== undefined) {
        if (this.$refs.formPublic) {
          this.elementHeight = this.$refs.formPublic.offsetHeight
        }
        const topHeight = this.isMonitor ? 146 : 134;
        return window.innerHeight - (Number(this.formShow) * (this.elementHeight + 10)) - topHeight + 'px'
      } else {
        return window.innerHeight - 134 + 'px'
      }
    }
  },
  mounted() {
    this.isMounted = true;
  },
  methods: {
    resize() {
      this.elementHeight = undefined;
    }
  }
}

export default mixin