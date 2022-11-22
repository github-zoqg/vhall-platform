export default {
  methods: {
    handleChangeView(payload) {
      this.$emit('changeView', payload);
    }
  }
};
