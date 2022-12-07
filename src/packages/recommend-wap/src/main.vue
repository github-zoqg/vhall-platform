<template>
  <div class="vmp-recommend" ref="recommendWrapper">
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('nav.nav_1043')"
      @load="onLoad"
      class="vmp-recommend-list"
    >
      <van-cell
        v-for="item in advs"
        :key="item.adv_id"
        class="recommend-item"
        @click="handleJump(item.url)"
      >
        <div class="recommend-item__content">
          <div class="recommend-item__content__cover">
            <img
              :src="item.img_url"
              v-parseImgOss="{ url: item.img_url, default: 2 }"
              class="ad_img"
              alt=""
            />
          </div>
          <div class="recommend-item__content__info">
            <span class="recommend-item__content__info-title">{{ item.subject }}</span>
            <span class="recommend-item__content__info-link">{{ $t('menu.menu_1010') }}</span>
          </div>
        </div>
      </van-cell>
    </van-list>
    <!-- <ul class="vmp-recommend-list">
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
    </ul> -->
  </div>
</template>
<script>
  import { useRoomBaseServer, useMenuServer, useRecommendServer } from 'middle-domain';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  export default {
    name: 'VmpRecommendWap',
    data() {
      return {
        advs: [],
        total: 0,
        pos: 0,
        limit: 10,
        num: 1,
        totalPages: 0,
        wrapWidth: 0,
        selectIndex: 0,
        finished: false,
        loading: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.menuServer = useMenuServer();
      this.recommendServer = useRecommendServer();
    },
    computed: {
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      }
    },
    mounted() {
      this.setDefaultAdvs();
    },
    methods: {
      /**
       * 初始化默认广告信息
       */
      setDefaultAdvs() {
        this.advs = [...this.roomBaseServer.state.advDefault.adv_list];
        this.total = this.roomBaseServer.state.advDefault.total;
        this.totalPages = Math.ceil(this.total / this.limit);
      },
      onLoad() {
        if (this.num >= this.totalPages) {
          this.finished = true;
          return false;
        }
        this.num++;
        this.pos = parseInt((this.num - 1) * this.limit);
        this.queryAdsList();
      },
      /**
       * 查询更多推荐项
       */
      async queryAdsList() {
        try {
          const res = await this.recommendServer.queryAdsList({
            webinar_id: this.$route.params.id,
            pos: this.pos,
            limit: 10
          });
          this.loading = false;
          const data = this.advs;
          this.advs = data.concat(res.data.adv_list);
        } catch (error) {
          this.loading = false;
          console.log(error);
        }
      },
      /**
       * 跳转链接
       * @param {String} url
       */
      handleJump(url) {
        const { system } = getBrowserType();
        if ('ios' === system) {
          console.log('当前是手机端打开-ios');
          window.location.href = url;
        } else {
          console.log('当前是手机端打开-其它');
          window.open(url, '_blank');
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-recommend {
    padding: 24px 0 0 0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    .vmp-recommend-list {
      display: block;
      width: 100%;
      // height: 100%;
      margin-bottom: 100px;
      overflow: hidden;
    }
    .recommend-item__content {
      display: flex;
      padding: 16px 0;
      margin: 0 24px;
      border-bottom: 1px solid var(--theme-tab-content-recommend-border);
      background-color: var(--theme-tab-content-recommend-bg);
      &__cover {
        width: 240px;
        height: 136px;
        background: #1a1a1a;
        border-radius: 4px;
        flex-shrink: 0;
        .ad_img {
          height: 100%;
          width: 100%;
          border-radius: 4px;
        }
      }
      &__info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-left: 16px;
        &-title {
          color: var(--theme-tab-content-recommend-title-font);
          font-style: normal;
          font-weight: 400;
          font-size: 28px;
          line-height: 39px;
          display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
          /* autoprefixer: ignore next */
          -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
          -webkit-line-clamp: 2; /** 显示的行数 **/
          overflow: hidden; /** 隐藏超出的内容 **/
        }
        &-link {
          display: inline-block;
          margin-right: auto;
          // width: 120px;
          // height: 50px;
          // line-height: 50px;
          padding: 8px 24px;
          line-height: 34px;
          border-radius: 26px;
          font-style: normal;
          font-weight: 400;
          font-size: 24px;
          text-align: center;
          background: var(--theme-tab-content-recommend-buy-bg);
          border: 1px solid var(--theme-tab-content-recommend-buy-border);
          color: var(--theme-tab-content-recommend-buy-font);
        }
      }
    }
    .van-cell {
      padding: 0 0;
      position: relative;
      line-height: 30px;
      background-color: var(--theme-tab-content-recommend-bg);
      // 废弃每列hover效果
      // &:active {
      //   background-color: var(--theme-tab-content-recommend-active-bg);
      //   .recommend-item__content {
      //     border-bottom: 1px solid transparent;
      //     &__info {
      //       &-link {
      //         background: var(--theme-tab-content-recommend-buy-active-bg);
      //         border: 1px solid var(--theme-tab-content-recommend-buy-active-border);
      //         color: var(--theme-tab-content-recommend-buy-active-font);
      //       }
      //     }
      //   }
      // }
      &::after {
        content: '';
        display: none;
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
