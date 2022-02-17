<template>
  <div class="vmp-recommend recommendWrapper" refs="recommendWrapper">
    <ul class="a-wrap">
      <li
        class="recommend-item"
        v-for="item in advDefault.adv_list"
        :key="item.adv_id"
        @click="handleJump(item.url)"
      >
        <div class="recommend-item">
          <img class="banner" :src="item.img_url ? item.img_url : defaultBanner" />
          <h4 class="title ellipsis">{{ item.subject }}</h4>
        </div>
      </li>
    </ul>
    <div class="vh-loading" v-if="showLoading">加载中</div>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import { useRoomBaseServer } from 'middle-domain';

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
        showLoading: false
      };
    },
    computed: {
      advDefault() {
        return this.roomBaseServer.state.advDefault;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },

    watch: {
      advsInfo: {
        handler(val) {
          if (val && val.adv_list) {
            this.advs = val.adv_list;
            this.total = val.total;
            this.limit = 10;
            this.pos = val.pos;
          }
        },
        immediate: true,
        deep: true
      },
      'advs.length': {
        async handler() {
          await this.$nextTick();
          setTimeout(() => {
            this.scroll && this.scroll.refresh();
          }, 1000);
        },
        immediate: true
      }
    },
    methods: {
      handlerInitScroll() {
        this.$nextTick(() => {
          // const wrapper = document.querySelector('.recommendWrapper');
          // this.scroll = new BScroll(wrapper, {
          //   pullUpLoad: true,
          //   bindToWrapper: true,
          //   scrollX: false,
          //   scrollY: true,
          //   bounce: true,
          //   click: true,
          //   tap: 'tap'
          // });
          this.scroll && this.handleBindScrollEvent();
          this.scroll && this.scroll.refresh();
        });
      },
      handleBindScrollEvent() {
        window.addEventListener('resize', () => {
          this.scroll.refresh();
        });
        // this.scroll.on('touchEnd', pos => {});

        this.scroll.on('pullingUp', () => {
          if (this.pos + this.limit >= this.total) return;
          if (this.showLoading) return;
          this.showLoading = true;
          this.getAdsInfo();
        });
      },
      getAdsInfo() {
        return this.$axios('queryAdsInfo', {
          webinar_id: this.$route.params.id,
          pos: this.pos + this.limit,
          limit: 10
        })
          .then(res => {
            /**
             * 1.先创建tab内容 传给tab组件 alwayTabs
             * 2.给tab组件中tabs变量添加推荐tab
             * 3.tab组件负责显示tab，并派发点击监听至各个content中 具体操作
             */
            const data = this.advs;
            this.advs = data.concat(res.data.adv_list);
            this.total = res.data.total;
            this.limit = 10;
            this.pos = res.data.pos;
            this.showLoading = false;
            this.scroll.finishPullUp();
          })
          .catch(e => {
            console.log(e);
            this.showLoading = false;
            this.scroll.finishPullUp();
          });
      },
      handleJump(url) {
        location.href = url;
      },
      start(item, e) {
        this.startY = e.targetTouches[0].pageY;
      },

      move(item, e) {
        this.endY = Math.abs(e.targetTouches[0].pageY - this.startY);
      },

      end() {
        this.endY = 0;
      },

      toHref(item) {
        location.href = item;
      }
    }
  };
</script>
<style lang="less">
  .vmp-recommend {
    background: #fff;
    padding: 0px 30px;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    // overflow: hidden;
    overflow-y: scroll;
    .a-wrap {
      display: block;
      width: 100%;
      // height: 100%;
      // overflow-y: hidden !important;
      overflow-y: scroll;
      touch-action: pan-y !important;
      // overflow: hidden;
      // display: flex;
      // flex-wrap: wrap;
      // justify-content: space-between;
      // touch-action: pan-y;
    }
    .recommend-item {
      width: 330px;
      height: 230px;
      margin-bottom: 30px;
      margin-right: 8px;
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
