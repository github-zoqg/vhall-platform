<template>
  <div class="vmp-img-stream">
    <img
      ref="capImage"
      alt="图片源"
      crossorigin="anonymous"
      style="margin-right: 20px; vertical-align: top"
    />
    <canvas id="capCanvas" ref="capCanvas">
      Your browser does not support the HTML5 canvas tag.
    </canvas>
  </div>
</template>
<script>
  import { useCanvasStreamServer } from 'middle-domain';
  export default {
    data() {
      return {
        canvasData: {
          width: 1280,
          height: 720
        }
      };
    },

    async mounted() {
      // 初始化图片推流server
      const canvasStreamServer = useCanvasStreamServer();
      canvasStreamServer.init({
        canvasDom: this.$refs.capCanvas,
        canvasImgDom: this.$refs.capImage
      });
      // try {
      //   // 检测是否为图片推流，若为真，则进行绘制canvas的captureStream
      // } catch (error) {
      //   this.$message.error('非默认图片推流设置失败');
      // }
    },
    methods: {
      // 获取图片流
      getCanvasStream() {
        return useCanvasStreamServer().getCanvasStream();
      },
      // 更新canvas图片
      updateCanvasImg() {
        return useCanvasStreamServer().checkImgStream();
      }
    }
  };
</script>
<style lang="less">
  .vmp-img-stream {
    // display: none;
    position: fixed;
    top: 0;
    left: -99999px;
  }
</style>
