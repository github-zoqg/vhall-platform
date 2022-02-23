<template>
  <div class="screen-post"
    @click="handleLink">
    <img :src="img"
      alt="">
    <div class="close-tip"
      :class="{'time': shutdown_type}"
      @click.stop="close"><span v-if="shutdown_type">{{time}}s</span>{{$t('webinar.webinar_1001')}}</div>
  </div>
</template>
<script>
export default {
  name: 'ScreenPost',
  props: {
    postInfo: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      img: '',
      link: '',
      shutdown_type: 0, // 0 手动关闭 1 自动关闭
      timer: null,
      time: 5
    };
  },
  watch: {
    postInfo: {
      handler(val) {
        this.shutdown_type = val.shutdown_type;
        this.img = val.img;
        this.link = val.url;
        if (this.shutdown_type) {
          this.handleAutoClose();
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleLink() {
      if (!this.link) return;
      window.open(this.link);
    },
    handleAutoClose() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.time--;
        if (this.time == 0) {
          clearInterval(this.timer);
          this.timer = null;
          this.close();
        }
      }, 1000);
    },
    close() {
      this.$emit('closeScreenPost');
    }
  }
};
</script>
<style lang="less" scoped>
.screen-post {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 49;
  background: #333;
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
  .close-tip {
    position: absolute;
    top: 20px;
    right: 20px;
    min-width: 64px;
    height: 38px;
    text-align: center;
    line-height: 38px;
    border-top-left-radius: 19px;
    border-bottom-left-radius: 19px;
    border-top-right-radius: 19px;
    border-bottom-right-radius: 19px;
    color: #fff;
    // padding: 16px 8px;
    // box-sizing: border-box;
    background: rgba(0, 0, 0, 0.65);
    font-size: 16px;
    span {
      margin-right: 4px;
    }
    &:hover {
      cursor: pointer;
    }
  }
  .time {
    width: 88px;
  }
}
</style>
