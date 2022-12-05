<template>
  <section class="vmp-recommend">
    <overlay-scrollbars ref="scroll" :options="overlayScrollBarsOptions" style="height: 100%">
      <div class="vmp-recommend-wrapper">
        <div class="subscribe-wrap" v-if="isSubscribe">
          <div
            class="subscribe-wrap-item"
            v-for="item in advs"
            :key="item.adv_id"
            @click="goto(item.url)"
          >
            <div class="subscribe-wrap-item_cover">
              <img
                :src="item.img_url"
                v-parseImgOss="{ url: item.img_url, default: 3 }"
                class="ad_img"
                alt=""
              />
            </div>
            <div class="subscribe-wrap-item_info">
              <p>{{ item.subject }}</p>
              <span>{{ $t('menu.menu_1010') }}</span>
            </div>
          </div>
        </div>

        <ul class="a-wrap" v-else>
          <li v-for="item in advs" :key="item.adv_id" @click="goto(item.url)">
            <div class="recommend-item">
              <div class="banner">
                <img
                  :src="item.img_url"
                  v-parseImgOss="{ url: item.img_url, default: 3 }"
                  class="ad_img"
                />
              </div>
              <div class="info">
                <h4 class="title ellipsis">{{ item.subject }}</h4>
                <button class="check-btn">{{ $t('menu.menu_1010') }}</button>
              </div>
            </div>
          </li>
        </ul>
        <div class="vmp-recommend-tips">
          <span v-if="isEnd">{{ $t('nav.nav_1043') }}~</span>
          <span v-if="loading">{{ $t('common.common_1001') }}</span>
        </div>
      </div>
    </overlay-scrollbars>
  </section>
</template>
<script>
  import { useRoomBaseServer, useRecommendServer, useMenuServer } from 'middle-domain';
  export default {
    name: 'VmpRecommend',
    data() {
      return {
        isActive: false, // 广告是否展示
        loading: false,
        advs: [],
        pos: 0,
        limit: 10,
        total: 0,
        overlayScrollBarsOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          },
          callbacks: {
            onScrollStop: this.onScrollStop
          }
        }
      };
    },
    computed: {
      isEnd() {
        return this.pos + this.limit >= this.total;
      },
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      }
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
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.recommendServer = useRecommendServer();
      this.menuServer = useMenuServer();
    },
    mounted() {
      this.setDefaultAdvs();
      this.listenEvents();

      this.menuServer.$on('tab-switched', data => {
        this.isActive = this.cuid === data.cuid;
      });
    },
    beforeDestroy() {
      this.removeEvents();
    },
    methods: {
      listenEvents() {
        if (!this.isSubscribe) return;
        this.onScrollStopForSubscribePage = this.onScrollStopForSubscribePage.bind(this);
        window.addEventListener('scroll', this.onScrollStopForSubscribePage, true);
      },
      removeEvents() {
        window.removeEventListener('scroll', this.onScrollStopForSubscribePage);
      },
      /**
       * 初始化默认广告信息
       */
      setDefaultAdvs() {
        this.advs = [...this.roomBaseServer.state.advDefault.adv_list];
        this.total = this.roomBaseServer.state.advDefault.total;
        // this.handlerAdvsInfo(this.advs);
      },
      onScrollStop() {
        if (!this.$refs.scroll) return;
        const state = this.$refs.scroll.osInstance().getState();
        if (!state.hasOverflow.y) return; // 未触底
        if (this.total !== 0 && this.pos >= this.total) return;
        if (this.loading) return;

        this.getAdsInfo();
      },
      onScrollStopForSubscribePage() {
        if (!this.isActive) return;
        const currentY = document.body.clientHeight + window.scrollY;
        const fullY = document.body.scrollHeight;
        const hasOverflowY = currentY >= fullY;

        if (!hasOverflowY) return;
        if (this.total !== 0 && this.pos >= this.total) return;
        if (this.loading) return;

        this.getAdsInfo();
      },
      async getAdsInfo() {
        this.loading = true;

        try {
          const res = await this.recommendServer.queryAdsList({
            webinar_id: this.$route.params.id,
            pos: this.pos + this.limit,
            limit: 10
          });
          // this.handlerAdvsInfo(res.data.adv_list);
          const data = this.advs;
          this.advs = data.concat(res.data.adv_list);
          this.total = res.data.total;
          this.pos = res.data.pos;
        } finally {
          this.loading = false;
        }
      },
      goto(url) {
        window.open(url, '_blank');
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
      padding: 16px 8px 0;
    }
    .subscribe-wrap {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      overflow: hidden;
      &-item {
        width: 358px;
        height: 306px;
        margin: 0 0 16px 16px;
        flex-direction: column;
        padding: 0;
        border: none;
        box-sizing: border-box;
        transition: all 0.4s;
        &_cover {
          width: 358px;
          height: 202px;
          margin-right: 0;
          border-radius: 4px 4px 2px 2px;
          background: #1a1a1a;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          .ad_img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            transition: all 0.4s;
            &:hover {
              transform: scale(1.2);
            }
          }
        }
        &_info {
          height: 104px;
          width: 100%;
          background: #fff;
          box-sizing: border-box;
          padding: 14px 16px;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
          position: relative;
          cursor: pointer;
          &:hover {
            p {
              color: var(--theme-color);
            }
            span {
              background: var(--theme-color);
              color: #fff;
            }
          }
          p {
            width: 100%;
            color: var(--theme-subscribe-tab-content-recommend-buy-font);
            font-size: 16px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
            line-height: 20px;
          }
          span {
            display: inline-block;
            width: 64px;
            height: 26px;
            color: var(--theme-color);
            border: 1px solid var(--theme-color);
            text-align: center;
            line-height: 26px;
            position: absolute;
            left: 14px;
            bottom: 16px;
            border-radius: 15px;
            cursor: pointer;
            &:hover {
              background: var(--theme-color);
              color: #fff;
            }
          }
        }
      }
    }

    .a-wrap {
      display: block;
      width: 100%;
      touch-action: pan-y;
      .recommend-item {
        width: 100%;
        height: 113px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;
        border-bottom: 1px solid var(--theme-tab-content-recommend-border);
        padding: 16px 5px;
        background-color: transparent;
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

          .ad_img {
            height: 100%;
            width: 100%;
            object-fit: contain;
            object-position: center;
          }
        }
        .title {
          font-size: 14px;
          font-weight: bold;
          color: var(--theme-tab-content-recommend-title-font);
          line-height: 22px;
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
            border: 1px solid var(--theme-tab-content-recommend-buy-border);
            color: var(--theme-tab-content-recommend-buy-font);
            text-align: center;
            line-height: 26px;
          }
        }

        &:hover {
          background: var(--theme-tab-content-recommend-hover-bg);
          border-radius: 4px;
          cursor: pointer;
          border-bottom-color: transparent;

          .check-btn {
            background: var(--theme-color);
            border-color: var(--theme-color);
            color: var(--theme-tab-content-recommend-buy-font-hover);
          }
        }
      }
    }

    .vmp-recommend-tips {
      display: inline-block;
      width: 100%;
      text-align: center;
      padding: 10px 0px;
      color: var(--theme-tab-content-recommend-noData-font);
    }

    @media screen and (max-width: 1366px) {
      .subscribe-wrap-item {
        width: 249px;
        height: 244px;
        margin: 0px 0px 16px 16px;
        &_cover {
          width: 100%;
          height: 140px;
        }
        &_info {
          height: 100px;
        }
      }
    }

    @media screen and (min-width: 1367px) and (max-width: 1600px) {
      .subscribe-wrap-item {
        width: 305px;
        height: 273px;
        margin: 0px 0px 16px 16px;
        &_cover {
          width: 100%;
          height: 169px;
        }
        &_info {
          height: 104px;
        }
      }
    }
    @media screen and (min-width: 1601px) and (max-width: 1920px) {
      .subscribe-wrap-item {
        width: 358px;
        height: 306px;
        margin: 0px 0px 16px 16px;
        &_cover {
          width: 100%;
          height: 202px;
        }
        &_info {
          height: 104px;
        }
      }
    }
    @media screen and (min-width: 1921px) {
      .subscribe-wrap-item {
        width: 358px;
        height: 306px;
        margin: 0px 0px 16px 16px;
        &_cover {
          width: 100%;
          height: 202px;
        }
        &_info {
          height: 104px;
        }
      }
    }
  }
</style>
