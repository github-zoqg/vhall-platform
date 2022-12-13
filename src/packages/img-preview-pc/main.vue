<template>
  <div
    class="vmp-chat-preview-img"
    @click.self="closePreview"
    v-show="previewImgShow"
    :style="{
      zIndex: zIndex
    }"
  >
    <div class="preview-img__container">
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide v-for="(img, index) in images" :key="index">
          <div class="preview-img__box">
            <img :src="resizeImg(img, { type: 'm_lfit', width: 1600, height: 900 })" alt="" />
          </div>
        </swiper-slide>
        <div slot="pagination" class="preview-img__pagination"></div>
        <span
          v-if="images.length !== 1"
          slot="button-next"
          class="preview-img__button preview-img__button-next hide vh-iconfont vh-line-arrow-left"
        ></span>
        <span
          v-if="images.length !== 1"
          slot="button-prev"
          class="preview-img__button preview-img__button-prev hide vh-iconfont vh-line-arrow-right"
        ></span>
      </swiper>
      <span
        class="preview-img__close-icon icon vh-iconfont vh-line-close"
        @click="closePreview"
      ></span>
    </div>
  </div>
</template>
<script>
  import 'swiper/dist/css/swiper.css';
  import { swiper, swiperSlide } from 'vue-awesome-swiper';
  import { resizeImg } from '@/app-shared/utils/common.js';
  export default {
    name: 'VmpImgPreviewPc',
    components: {
      swiper,
      swiperSlide
    },
    props: {
      images: {
        required: true,
        type: Array,
        default: () => []
      },
      zIndex: {
        required: true,
        type: Number,
        default: () => 202
      }
    },
    data() {
      return {
        //swiper插件配置
        swiperOptions: {
          pagination: {
            el: '.preview-img__pagination',
            type: 'fraction'
          },
          navigation: {
            prevEl: '.preview-img__button-next',
            nextEl: '.preview-img__button-prev'
          },
          autoplay: {
            disableOnInteraction: false
          }
        },
        //预览图片显示
        previewImgShow: true
      };
    },
    mounted() {
      this.init();
    },
    methods: {
      resizeImg,
      init() {
        //保存当前的swiper实例引用
        this.swiper = this.$refs.mySwiper.swiper;
        // 鼠标移入显示前进后退按钮
        this.swiper.el.onmouseover = () => {
          this.swiper.navigation.$nextEl.removeClass('hide');
          this.swiper.navigation.$prevEl.removeClass('hide');
          this.swiper.autoplay.stop();
        };
        // 鼠标移入隐藏前进后退按钮
        this.swiper.el.onmouseout = () => {
          this.swiper.navigation.$nextEl.addClass('hide');
          this.swiper.navigation.$prevEl.addClass('hide');
          this.swiper.autoplay.start();
        };
      },
      //跳转到指定的图片
      jumpToTargetImg(index) {
        this.swiper.slideTo(index, 0);
      },
      closePreview() {
        this.$emit('closeImgPreview');
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-preview-img {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    // z-index: 200;
  }
  .preview-img__container {
    width: 800px;
    height: 450px;
    background-color: #fff;
    border-radius: 4px;
    position: relative;
  }
  .preview-img__box {
    width: 800px;
    height: 450px;
    img {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
      font-family: 'object-fit: scale-down;';
    }
  }
  .preview-img__close-icon {
    font-size: 12px;
    color: #fff;
    position: absolute;
    right: 0;
    top: -22px;
    cursor: pointer;
  }
  .preview-img__pagination {
    color: #fff;
    line-height: 40px;
    font-size: 14px;
    height: 40px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
    text-shadow: 2px 2px rgba(0, 0, 0, 0.2);
    position: absolute;
    bottom: 0;
    z-index: 1;
    border-radius: 0 0 4px 4px;
    text-align: center;
  }
  .preview-img__button {
    position: absolute;
    top: 50%;
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    margin-top: -16px;
    z-index: 2;
    color: #fff;
    cursor: pointer;
    border-radius: 16px;
    background-color: rgba(0, 0, 0, 0.6);
    transition: opacity 500ms;
    &-next {
      left: 16px;
    }
    &-prev {
      right: 16px;
    }
    &.hide {
      opacity: 0;
    }
  }
</style>
