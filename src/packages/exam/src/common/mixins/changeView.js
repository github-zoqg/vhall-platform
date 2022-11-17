export default {
  methods: {
    handleChangeView(view) {
      this.$emit('changeView', view);
    }
  }
}