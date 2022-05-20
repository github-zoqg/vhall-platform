<template>
  <div
    class="img-player img-container cover-img"
    :style="{ 'background-image': `url('${image_url}')` }"
    v-if="image_url"
  />
</template>
<script>
  export default {
    name: 'ImgPlayer',
    data() {
      return {
        image_url: ''
      };
    },
    mounted() {},
    methods: {
      startPlay(reload) {
        this.image_url = '';
        const p = [this.loadImg(reload.data.gift_image_url)];
        Promise.all(p)
          .then(([image_url]) => {
            this.image_url = image_url;
            this.startAnimation();
          })
          .catch(e => {
            console.error(e);
            this.$emit('finish');
          });
      },
      startAnimation() {
        this.$emit('loaded');
        new Promise((resolve, reject) => {
          let timer = setTimeout(() => {
            clearTimeout(timer);
            resolve();
          }, 4000);
        }).then(() => {
          this.$emit('finish');
        });
      },
      loadImg(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            resolve(src);
          };
          img.onerror = e => {
            reject(e);
          };
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .img-player {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 321px !important;
    height: 321px !important;
    display: inline-block;
    margin: 50% 50%;
    transform: translate(-50%, -50%);
  }
</style>
