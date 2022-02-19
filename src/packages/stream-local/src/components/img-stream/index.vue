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
  import { useCanvasStreamServer } from 'middle-domain';
  export default {
    data() {
      return {
        canvasImg: require('./../imgs/canvasDefault.png'),
        canvasData: {
          width: 1280,
          height: 720
        }
      };
    },

    async mounted() {
      const canvasStreamServer = useCanvasStreamServer();
      canvasStreamServer.init({
        canvasDom: this.$refs.capCanvas,
        canvasImgDom: this.$refs.capImage
      });
      try {
        await canvasStreamServer.checkImgStream();
      } catch (error) {
        this.$message.error('非默认图片推流设置失败');
      }
    },
    methods: {
      getCanvasStream() {
        return useCanvasStreamServer().getCanvasStream();
      }
    }
  };
</script>
<style lang="less">
  .vmp-img-stream {
    display: none;
  }
</style>
