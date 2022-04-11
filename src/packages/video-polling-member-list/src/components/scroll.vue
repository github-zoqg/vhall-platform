<template>
  <div ref="scrollBox" class="test_02">
    <div ref="scrollArea" class="test_01">
      <slot></slot>
    </div>
  </div>
</template>
<script>
  import BScroll from '@better-scroll/core';
  import ScrollBar from '@better-scroll/scroll-bar';
  import MouseWheel from '@better-scroll/mouse-wheel';
  import ObserveDom from '@better-scroll/observe-dom';
  import Pullup from '@better-scroll/pull-up';
  BScroll.use(ScrollBar);
  BScroll.use(MouseWheel);
  BScroll.use(ObserveDom);
  BScroll.use(Pullup);

  export default {
    mounted() {
      this.$nextTick(() => {
        this.scroll = new BScroll(this.$refs.scrollBox, {
          click: true,
          bounce: false,
          scrollY: true,
          scrollX: false,
          mouseWheel: {
            speed: 20,
            invert: false,
            easeTime: 300
          },
          eventPassthrough: 'horizontal',
          preventDefaultException: {
            tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|AUDIO|DIV|SPAN|P)$/
          },
          pullUpLoad: true,
          scrollbar: true,
          observeDom: true
        });
        window.scroll = this;
        this.scroll.on('scrollEnd', e => {
          const scrollHeight = Math.abs(e.y);
          if (
            this.$refs.scrollArea.offsetHeight - this.$refs.scrollBox.offsetHeight <=
            scrollHeight
          ) {
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(() => {
              this.$emit('pullingUp');
            }, 300);
          }
        });
      });
      window.addEventListener('resize', () => {
        this.refresh();
      });
    },
    methods: {
      refresh() {
        this.scroll.refresh();
      },
      finishPullUp() {
        this.scroll.finishPullUp();
      }
    }
  };
</script>
<style lang="less"></style>
