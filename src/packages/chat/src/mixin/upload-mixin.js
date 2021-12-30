const uploadMixin = {
  data() {
    return {
      imgUrls: []
    };
  },
  computed: {
    uploadActive() {
      return this.imgUrls.length;
    }
  },
  methods: {
    onExceed(res) {
      if (this.inputStatus.disable) {
        this.$message.error('您已被禁言');
        return false;
      }
      if (this.uploadActive >= 4) {
        this.$message.error('一次最多上传4张图片');
        return false;
      }
      return true;
    },
    uploadSuccess(res) {
      console.log('======上传成功========', res);
      if (res.code != 200) return this.$message.warning(res.msg);
      this.imgUrls.push(res.data.domain_url);
    },
    uploadError(err) {
      console.error('======上传聊天图片失败======');
      console.log(err);
    },
    deleteImg(index) {
      this.imgUrls.splice(index, 1);
    }
  }
};
export default uploadMixin;
