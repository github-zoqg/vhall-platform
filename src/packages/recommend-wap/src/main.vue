<template>
  <div class="vmp-recommend" ref="recommendWrapper">
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
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
            <img :src="item.img_url ? item.img_url : defaultBanner" alt="" />
          </div>
          <div class="recommend-item__content__info">
            <span class="recommend-item__content__info-title">{{ item.subject }}</span>
            <span class="recommend-item__content__info-link">查看</span>
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
        this.loading = true;
        this.num++;
        this.pos = parseInt((this.num - 1) * this.limit);
        this.queryAdsList();
      },
      /**
       * 查询更多推荐项
       */
      async queryAdsList() {
        if (this.loading) {
          return;
        }
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
        window.open(url, '_blank');
      }
    }
  };
</script>
<style lang="less">
  .vmp-recommend {
    background: #fff;
    padding: 0px 32px;
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
    /* .recommend-item {
        width: 330px;
        // height: 230px;
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
      */
    .recommend-item__content {
      display: flex;
      padding: 24px 0;
      border-bottom: 1px solid #f0f0f0;
      &__cover {
        width: 240px;
        height: 136px;
        background: #1a1a1a;
        border-radius: 16px;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
          border-radius: 12px;
        }
      }
      &__info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-left: 24px;
        &-title {
          color: #262626;
          font-size: 28px;
          line-height: 38px;
        }
        &-link {
          display: inline-block;
          width: 120px;
          height: 54px;
          line-height: 54px;
          border-radius: 32px;
          border: 1px solid #8c8c8c;
          color: #595959;
          font-size: 24px;
          text-align: center;
        }
      }
    }
    .van-cell {
      position: relative;
      line-height: 30px;
      padding: 0;
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
