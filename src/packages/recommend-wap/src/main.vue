<template>
  <div class="vmp-recommend" ref="recommendWrapper">
    <ul class="vmp-recommend-list">
      <li
        class="recommend-item"
        v-for="item in advs"
        :key="item.adv_id"
        @click="handleJump(item.url)"
      >
        <img class="banner" :src="item.img_url ? item.img_url : defaultBanner" />
        <h4 class="title ellipsis">{{ item.subject }}</h4>
      </li>
      <li class="vmp-recommend-loading" v-if="loading">{{ $t('common.common_1001') }}</li>
    </ul>
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
          pullUpLoad: true, // 下滑到底读取更多
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
          console.log('pullingUp', this.pos, this.total, this.loading);
          if (this.pos > this.total) return;
          if (this.loading === true) return;
          await this.queryAdsList();
        });
      },
      /**
       * 查询更多推荐项
       */
      async queryAdsList() {
        try {
          this.loading = true;
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
        } catch (error) {
          console.log(error);
        } finally {
          this.scroll && this.scroll.finishPullUp();
          this.scroll && this.scroll.refresh();
          this.loading = false;
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
    overflow: auto;
    .vmp-recommend-list {
      display: block;
      width: 100%;
      overflow-y: hidden;
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
    .vmp-recommend-loading {
      display: inline-block;
      width: 100%;
      text-align: center;
      padding: 30px 0px;
    }
  }
</style>
