<template>
  <section class="vmp-recommend">
    <overlay-scrollbars :options="overlayScrollBarsOptions" style="height: 100%">
      <div class="vmp-recommend-wrapper">
        <div class="subscribe-wrap" v-if="isSubscribe">
          <div
            class="subscribe-wrap-item"
            v-for="item in advDefault.adv_list"
            :key="item.adv_id"
            @click="handleJump(item.url)"
          >
            <div class="subscribe-wrap-item_cover">
              <img :src="item.img_url ? item.img_url : defaultBanner" alt="" />
            </div>
            <div class="subscribe-wrap-item_info">
              <p>{{ item.subject }}</p>
              <span>{{ $t('menu.menu_1010') }}</span>
            </div>
          </div>
        </div>
        <ul class="a-wrap" v-else>
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
                <button class="check-btn">{{ $t('menu.menu_1010') }}</button>
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
      },
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
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
        // location.href = url;
        window.open(url, '_blank');
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
        window.open(item, '_blank');
        // location.href = item;
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
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
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
              color: #fb3a32;
            }
            span {
              background: #fb3a32;
              color: #fff;
            }
          }
          p {
            width: 100%;
            color: #1a1a1a;
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
            color: #fb3a32;
            border: 1px solid #fb3a32;
            text-align: center;
            line-height: 26px;
            position: absolute;
            left: 14px;
            bottom: 16px;
            border-radius: 15px;
            cursor: pointer;
            &:hover {
              background: #fb3a32;
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
            width: 100%;
            object-fit: scale-down;
          }
        }
        .title {
          font-size: 14px;
          font-weight: bold;
          color: @font-dark-normal;
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
        width: 300px;
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
