<template>
  <div v-if="preImgShow"
    :class="['vhall-chat-slide-wrapper',opacity ? '':'hide']">
    <div class="slide-group">
      <div class="slide"
        v-for="(img,index) in imgs"
        :key="index">
        <img :src="img"
          alt />
      </div>
    </div>
    <div v-show="preShow"
      class="slide-control slide-pre"
      @click.stop="goToPre">
      <i class="iconfont iconzuofanye"></i>
    </div>
    <div v-show="nextShow"
      class="slide-control slide-next"
      @click.stop="goToNext">
      <i class="iconfont iconyoufanye"></i>
    </div>
    <div class="slide-close"
      @click="hide">
      <i class="iconfont iconguanbi"></i>
    </div>
  </div>
</template>
<script>
import BScroll from '@better-scroll/core';
import Slide from '@better-scroll/slide';
BScroll.use(Slide);
export default {
  props: {
    imgs: {
      required: true,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      preImgShow: false,
      currentIndex: 0,
      opacity: 0
    };
  },
  computed: {
    preShow() {
      return this.imgs.length > 1 && this.currentIndex !== 0;
    },
    nextShow() {
      return this.imgs.length > 1 && this.imgs.length !== this.currentIndex + 1;
    }
  },
  mounted() { },
  methods: {
    init() {
      this.slideScroll = new BScroll('.vhall-chat-slide-wrapper', {
        scrollX: true,
        scrollY: false,
        click: true,
        slide: {
          loop: false,
          threshold: 100,
          listenFlick: false
        },
        momentum: false,
        bounce: true,
        stopPropagation: true
      });
    },
    show() {
      this.preImgShow = true;
      clearTimeout(this.showTimer);
      this.showTimer = setTimeout(() => {
        this.init();
      }, 200);
    },
    hide() {
      this.preImgShow = false;
      this.opacity = 0;
    },
    goToPre() {
      clearTimeout(this.preTimer);
      this.preTimer = setTimeout(() => {
        this.slideScroll.prev();
        this._getIndex();
        console.log('index', this.currentIndex);
      }, 200);
    },
    goToNext() {
      clearTimeout(this.nextTimer);
      this.nextTimer = setTimeout(() => {
        this.slideScroll.next();
        this._getIndex();
      }, 200);
    },
    goToPage() {
      this.slideScroll.refresh();
      console.log('arguments', arguments);
      this.slideScroll.goToPage.apply(this.slideScroll, arguments);
      this.opacity = 1;
      this._getIndex();
    },
    _getIndex() {
      this.currentIndex = this.slideScroll.getCurrentPage().pageX;
    }
  }
};
</script>
<style lang="less">
.vhall-chat-slide-wrapper {
  width: 840px;
  height: 500px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #666;
  z-index: 1000;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  &.hide {
    opacity: 0;
  }
  .slide-group {
    white-space: nowrap;
    .slide {
      height: 100%;
      box-sizing: border-box;
      width: 840px;
      height: 500px;
      padding: 30px;
      float: left;
      display: flex;
      align-items: center;
      & > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
  .slide-control {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 27px;
    height: 35px;
    cursor: pointer;
    background-color: #474747;
    & > i {
      line-height: 35px;
      font-size: 26px;
      color: #ffffff;
    }
    &.slide-pre {
      left: 30px;
    }
    &.slide-next {
      right: 30px;
    }
  }
  .slide-close {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    line-height: 28px;
    cursor: pointer;
    color: #ffffff;
    font-size: 28px;
  }
}
</style>
