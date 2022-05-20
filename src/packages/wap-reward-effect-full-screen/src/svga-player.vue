<template>
  <div id="svga-player"></div>
</template>
<script>
  import SVGA from 'svgaplayerweb';
  import Sources from './source/index.js';
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
        let source = '';
        if (reload.data.type == 'reward_pay_ok') {
          source = '打赏';
        } else {
          source = reload.data.gift_name;
        }
        const path = Sources[source];
        console.time(`get:${path}`);
        let videoItem = sourceMap.get(path);
        console.timeEnd(`get:${path}`);
        if (videoItem) {
          this.startAnimation(videoItem);
        } else {
          console.time(`load:${source}`);
          parser.load(path, videoItem => {
            console.timeEnd(`load:${source}`);
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
