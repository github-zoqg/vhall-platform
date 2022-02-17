<template>
  <div class="vmp-img-stream">
    <img
      ref="capImage"
      :src="canvasImg"
      alt="图片源"
      crossorigin="anonymous"
      style="margin-right: 20px; vertical-align: top"
    />
    <canvas id="capCanvas" ref="capCanvas" :width="canvasData.width" :height="canvasData.height">
      Your browser does not support the HTML5 canvas tag.
    </canvas>
  </div>
</template>
<script>
  export default {
    name: 'VmpImgStream',
    data() {
      return {
        canvasImg: require('./../imgs/canvasDefault.png'),
        canvasData: {
          width: 1280,
          height: 720
        },
        canvasStreamInterval: null
      };
    },
    mounted() {
      this.canvasImgDom = this.$refs.capImage;
      this.canvasDom = this.$refs.capCanvas;
      this.checkImgStream();
      this.watchInitData = this.$domainStore.state.roomBaseServer.watchInitData;
      this.interactiveServer = this.$domainStore.state;
    },
    methods: {
      // 检测当前是否推流及推流的图片
      async checkImgStream() {
        let isPushType = this.$domainStore.state.mediaSetting.videoType === 'pictrue';
        if (isPushType) {
          if (this.$domainStore.state.mediaSetting.canvasImgUrl) {
            // 非默认图片
            await this.getRealImg();
          }
          this.setCanvasStream();
        }
      },

      // 获取真实的图片宽高
      getRealImg() {
        return new Promise((resolve, reject) => {
          try {
            let _img = new Image();
            _img.src = this.$domainStore.state.mediaSetting.canvasImgUrl;
            _img.onload = () => {
              this.canvasData.width = this.$refs.canvasDom.width = _img.width;
              this.canvasData.height = this.$refs.canvasDom.height = _img.height;
              resolve();
            };
          } catch (error) {
            reject(error);
          }
        });
      },

      // 设置canvas流
      setCanvasStream() {
        const c2d = this.$refs.capCanvas.getContext('2d');
        if (this.canvasStreamInterval) {
          clearInterval(this.canvasStreamInterval);
        }
        this.canvasStreamInterval = setInterval(() => {
          c2d.drawImage(this.canvasImgDom, 0, 0, this.canvasData.width, this.canvasData.height);
        }, 1000);
      },

      getCanvasStream() {
        return this.canvasDom.captureStream().getVideoTracks()[0] || null;
      }
    }
  };
</script>
<style lang="less"></style>
