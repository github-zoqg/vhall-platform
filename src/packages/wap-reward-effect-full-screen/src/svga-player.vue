<template>
  <div id="svga-player"></div>
</template>
<script>
  import SVGA from 'svgaplayerweb';
  import SVGAs from './source/svgas.js';
  const sourceMap = new Map();
  let parser, player;
  export default {
    name: 'SvgaPlayerWeb',
    data() {
      return {};
    },
    mounted() {
      this.initSvgaPlugin();
    },
    methods: {
      initSvgaPlugin() {
        this.initPlayer();
        this.initParser();
      },
      initPlayer() {
        if (player) return;
        player = new SVGA.Player('#svga-player');
        player.loops = 1; // 循环次数
        player.clearsAfterStop = true; // 停止播放后清空
        player.onFinished(() => {
          this.$emit('finish');
        });
      },
      initParser() {
        if (parser) return;
        parser = new SVGA.Parser('#svga-player');
      },
      startPlay(reload) {
        // const path = `${this.$imgHost}/${reload.full_screen_image_url}`;
        // const path = `https://static.vhallyun.com/mp-prod/af/4e/af4edf96a16a48d1229ea5c00d9d47d8.svga`;
        const path = SVGAs[reload.data.gift_name];
        console.time(`get:${path}`);
        let videoItem = sourceMap.get(path);
        console.timeEnd(`get:${path}`);
        if (videoItem) {
          this.startAnimation(videoItem);
        } else {
          console.time(`load:${reload.data.gift_name}`);
          parser.load(path, videoItem => {
            console.timeEnd(`load:${reload.data.gift_namename}`);
            sourceMap.set(path, videoItem);
            this.startAnimation(videoItem);
          });
        }
      },
      startAnimation(videoItem) {
        player.setVideoItem(videoItem);
        player.startAnimation(videoItem);
      }
    }
  };
</script>
<style lang="less" scoped></style>
