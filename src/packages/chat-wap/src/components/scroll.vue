<template>
  <div class="vmp-chat-wap-scroll" ref="scroll">
    <div>
      <slot></slot>
    </div>
  </div>
</template>
<script>
  import BScroll from '@better-scroll/core';
  import PullDown from '@better-scroll/pull-down';
  import PullUp from '@better-scroll/pull-up';
  BScroll.use(PullDown);
  BScroll.use(PullUp);

  export default {
    props: {
      // 是否开启下拉加载更多
      pullDownRefresh: {
        default: true
      },
      pullingUpRefresh: {
        default: false
      }
    },
    async mounted() {
      await this.$nextTick();
      const options = {
        bounce: true,
        scrollY: true,
        scrollX: false,
        bindToWrapper: true,
        tap: 'tap',
        pullUpLoad: true,
        click: true,
        preventDefault: false
      };
      if (this.pullDownRefresh) {
        options.pullDownRefresh = {
          threshold: 40
        };
      }
      this.scroll = new BScroll(this.$refs.scroll, options);
      if (this.pullDownRefresh) {
        this.scroll.on('pullingDown', () => {
          this.$emit('pullingDown');
        });
      }
      if (this.pullingUpRefresh) {
        this.scroll.on('pullingUp', () => {
          this.$emit('pullingUp');
        });
      }
      this.scroll.on('scroll', pos => {});
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
      },
      finishPullDown() {
        this.scroll.finishPullDown();
      },
      scrollBottom() {
        this.scroll.scrollTo(0, this.scroll.maxScrollY, 200);
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-chat-wap-scroll {
    width: 100%;
    height: 100%;
  }
</style>
