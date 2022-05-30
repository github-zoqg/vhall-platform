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
        <img class="banner" :src="item.img_url ? item.img_url : defaultBanner" />
        <h4 class="title ellipsis">{{ item.subject }}</h4>
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
        try {
          this.loading = false;
          const res = await this.recommendServer.queryAdsList({
            webinar_id: this.$route.params.id,
            pos: this.pos,
            limit: 10
          });

          const data = this.advs;
          this.advs = data.concat(res.data.adv_list);
        } catch (error) {
          console.log(error);
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
    overflow-y: auto;
    .vmp-recommend-list {
      display: block;
      width: 100%;
      // height: 100%;
      margin-bottom: 100px;
      overflow: hidden;
    }
    .recommend-item {
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
