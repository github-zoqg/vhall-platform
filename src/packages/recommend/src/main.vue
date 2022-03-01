<template>
  <section class="vmp-recommend">
    <overlay-scrollbars :options="overlayScrollBarsOptions" style="height: 100%">
      <div class="vmp-recommend-wrapper">
        <ul class="a-wrap">
          <li
            class="recommend-item"
            v-for="item in advDefault.adv_list"
            :key="item.adv_id"
            @click="handleJump(item.url)"
          >
            <div class="recommend-item">
              <div class="banner">
                <img :src="item.img_url ? item.img_url : defaultBanner" />
              </div>
              <div class="info">
                <h4 class="title ellipsis">{{ item.subject }}</h4>
                <button class="check-btn">查看</button>
              </div>
            </div>
          </li>
        </ul>
        <div class="vh-loading" v-if="showLoading">加载中</div>
      </div>
    </overlay-scrollbars>
  </section>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import { useRoomBaseServer } from 'middle-domain';

  export default {
    name: 'VmpRecommend',
    data() {
      return {
        advs: [],
        total: 0,
        pos: 0,
        limit: 10,
        wrapWidth: 0,
        selectIndex: 0,
        showLoading: false,
        overlayScrollBarsOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        }
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
    created() {
      window.$middleEventSdk?.event?.send(
        boxEventOpitons(this.cuid, 'addTab', [
          3,
          {
            comp: 'comRecommend',
            key: 'recommend',
            text: '推荐'
          }
        ])
      );
    },
    methods: {
      handlerInitScroll() {
        this.$nextTick(() => {
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
    height: 100%;
    width: 100%;
    box-sizing: border-box;

    &-wrapper {
      padding: 0 14px 16px;
    }

    .a-wrap {
      display: block;
      width: 100%;
      touch-action: pan-y;
    }
    .recommend-item {
      width: 100%;
      height: 113px;
      display: flex;
      flex-direction: row;
      align-items: center;
      box-sizing: border-box;
      border-bottom: 1px solid #444;
      padding: 16px 5px;

      a {
        display: inline-block;
        margin-bottom: 30px;
      }
      .banner {
        width: 40%;
        height: 100%;
        text-align: center;
        background: #1a1a1a;
        border-radius: 8px;
        margin-right: 12px;
        flex: 0 0 auto;
        max-width: 180px;

        img {
          height: 100%;
          object-fit: scale-down;
        }
      }
      .title {
        font-size: 14px;
        font-weight: bold;
        color: @font-dark-normal;
        line-height: 30px;
        height: 34px;
      }

      .info {
        height: 100%;
        position: relative;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .check-btn {
          background: transparent;
          width: 64px;
          height: 26px;
          border-radius: 15px;
          border: 1px solid #ccc;
          color: #fff;
          text-align: center;
          line-height: 26px;
        }
      }

      &:hover {
        background: #3c3c3c;
        border-radius: 4px;
        cursor: pointer;
        border-bottom-color: transparent;

        .check-btn {
          background: #fb3a32;
          border-color: #fb3a32;
        }
      }
    }
  }
</style>
