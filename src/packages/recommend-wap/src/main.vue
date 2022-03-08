<template>
  <div class="vmp-recommend" ref="recommendWrapper">
    <ul class="a-wrap">
      <li
        class="recommend-item"
        v-for="item in advs"
        :key="item.adv_id"
        @click="handleJump(item.url)"
      >
        <img class="banner" :src="item.img_url ? item.img_url : defaultBanner" />
        <h4 class="title ellipsis">{{ item.subject }}</h4>
      </li>
    </ul>
    <div class="vh-loading" v-if="loading">{{ $t('common.common_1001') }}</div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useMenuServer, useRecommendServer } from 'middle-domain';
  import BScroll from '@better-scroll/core';
  import Pullup from '@better-scroll/pull-up';

  BScroll.use(Pullup);

  export default {
    name: 'VmpRecommendWap',
    data() {
      return {
        advs: [],
        total: 0,
        pos: 0,
        limit: 10,
        wrapWidth: 0,
        selectIndex: 0,
        loading: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.menuServer = useMenuServer();
      this.recommendServer = useRecommendServer();
    },
    mounted() {
      this.setDefaultAdvs();
      this.initScroll();
      this.menuServer.$on('tab-switched', async data => {
        if (this.cuid === data.cuid) {
          await this.$nextTick();
          this.scroll && this.scroll.refresh();
        }
      });
    },
    beforeDestroy() {},
    methods: {
      /**
       * 初始化默认广告信息
       */
      setDefaultAdvs() {
        this.advs = [...this.roomBaseServer.state.advDefault.adv_list];
        this.total = this.roomBaseServer.state.advDefault.total;
      },
      /**
       * 初始化scroll
       */
      async initScroll() {
        const wrapper = this.$refs['recommendWrapper'];
        if (!wrapper) return;

        this.scroll = new BScroll(wrapper, {
          pullUpLoad: true,
          bindToWrapper: true,
          scrollX: false,
          scrollY: true,
          bounce: true,
          click: true,
          tap: 'tap'
        });

        if (!this.scroll) return;
        await this.$nextTick();
        this.bindScrollEvent();
        this.scroll.refresh();
      },
      /**
       * 绑定滚动事件
       */
      bindScrollEvent() {
        window.addEventListener('resize', () => {
          this.scroll.refresh();
        });

        this.scroll.on('pullingUp', async () => {
          console.log({
            pos: this.pos,
            limit: this.limit,
            total: this.total
          });
          if (this.pos > this.total) return;
          if (this.loading === true) return;
          this.loading = true;
          await this.queryAdsList();
          this.scroll.refresh();
        });
      },
      /**
       * 查询更多推荐项
       */
      async queryAdsList() {
        try {
          const res = await this.recommendServer.queryAdsList({
            webinar_id: this.$route.params.id,
            pos: this.pos + this.limit,
            limit: 10
          });

          const data = this.advs;
          this.advs = data.concat(res.data.adv_list);
          this.total = res.data.total;
          this.limit = 10;
          this.pos = res.data.pos;
          this.loading = false;
          this.scroll.finishPullUp();
        } catch (error) {
          console.log(error);
          this.loading = false;
          this.scroll.finishPullUp();
        }
      },
      /**
       * 跳转链接
       * @param {String} url
       */
      handleJump(url) {
        location.href = url;
      }
    }
  };
</script>
<style lang="less">
  .vmp-recommend {
    background: #fff;
    padding: 0px 15px;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    .a-wrap {
      display: block;
      width: 100%;
      overflow-y: scroll;
      touch-action: pan-y !important;
    }
    .recommend-item {
      width: 330px;
      height: 230px;
      margin: 15px;
      float: left;
      a {
        display: inline-block;
        width: 330px;
        height: 230px;
        margin-bottom: 30px;
      }
      .banner {
        width: 100%;
        height: 186px;
        border-radius: 8px;
        object-fit: scale-down;
        border: 1px solid #e6e6e6;
      }
      .title {
        margin-top: 15px;
        font-size: 28px;
        font-weight: bold;
        color: rgba(51, 51, 51, 1);
        line-height: 30px;
        height: 34px;
      }
    }
  }
</style>
