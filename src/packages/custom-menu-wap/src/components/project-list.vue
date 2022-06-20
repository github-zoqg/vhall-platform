<template>
  <div>
    <div class="vh-chose-active-box" :class="{ 'project-check-page': isSubscribe }">
      <!-- 单个视频 -->
      <div
        v-for="item in activeList"
        :key="item.id"
        class="vh-chose-active-item"
        @click="linkSubject(item.id)"
      >
        <div class="vh-chose-active-item__cover">
          <img class="cover_pic" :src="item.cover" alt="" />
          <div v-if="item.hide_pv == 1" class="vh-chose-active-item__cover-hots">
            <div class="vh-chose-active-item__cover-hots__content">
              <i class="vh-saas-iconfont vh-saas-line-heat"></i>
              <i>{{ item.pv }}</i>
            </div>
          </div>
        </div>
        <div class="vh-chose-active-item__titleInfo">
          <div class="vh-chose-active-item__title ellipsis">
            {{ item.title }}
          </div>
          <div class="vh-chose-active-item__info">
            {{ item.created_at.substr(0, 16) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useCustomMenuServer } from 'middle-domain';

  export default {
    props: ['checkedList'],
    data() {
      return {
        activeList: [],
        loading: false,
        hasDelayPermission: false
      };
    },
    watch: {
      checkedList: function () {
        this.getActiveList();
      }
    },
    computed: {
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      }
    },
    beforeCreate() {
      this.customMenuServer = useCustomMenuServer();
    },
    created() {
      this.getActiveList();
    },
    methods: {
      linkSubject(id) {
        window.open(
          window.location.protocol +
            process.env.VUE_APP_WAP_WATCH +
            process.env.VUE_APP_WEB_KEY +
            `/special/detail?id=${id}&delay=${this.hasDelayPermission ? 1 : 0}`
        );
      },
      async getActiveList() {
        if (this.checkedList.length === 0) {
          this.activeList = [];
          return;
        }
        this.loading = true;

        const res = await this.customMenuServer.getProjectList({
          subject_ids: this.checkedList.join(',')
        });

        this.loading = false;
        if (res.code === 200 && res.data) {
          if (res.data.total == 0) {
            this.lock = true;
            this.total = 0;
          } else {
            this.activeList = res.data.list;
          }
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  .vh-chose-active-box {
    width: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .project-check-page {
    justify-content: center;
    align-items: flex-start;
    // margin: 0px 0px 20px;
  }
  .vh-chose-active-item {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 300px;
    height: 266px;
    margin: 20px 14px;
    border-radius: 6px;
    background: #f7f7f7;
    overflow: hidden;

    &__cover {
      position: relative;
      width: 100%;
      height: 180px;
      img {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }

      &-status {
        position: absolute;
        left: 10px;
        top: 15px;
        height: 20px;
        line-height: 20px;
        background: rgba(0, 0, 0, 0.65);
        border-radius: 100px;
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        text-align: center;
        img {
          height: 8px;
        }
      }
      &-hots {
        position: absolute;
        /* left: 12px;
        bottom: 10px;
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        line-height: 20px;
        z-index: 3; */

        background: linear-gradient(180deg, rgba(0, 0, 0, 6e-5) 0%, rgba(0, 0, 0, 0.6) 100%);
        border-radius: 0px 0px 16px 16px;
        height: 60px;
        width: 100%;
        left: 0;
        bottom: 0;
        opacity: 0.6;
        z-index: 3;
        &__content {
          position: absolute;
          left: 18px;
          bottom: 15px;
          line-height: 20px;
          font-size: 12px;
          font-weight: 400;
          color: #ffffff;
          z-index: 4;
        }
        .vh-saas-line-heat {
          font-size: 12px;
          margin-right: 16px;
          margin-top: 2px;
          &:before {
            display: inline-block;
            width: 14px !important;
            height: 14px !important;
          }
        }
      }
      .mask {
        position: absolute;
        bottom: 0px;
        left: 0px;
        width: 100%;
        height: 32px;
        z-index: 2;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%);
        border-radius: 4px;
      }
      .delay-icon {
        width: 48px;
        height: 24px;
        background: url('../assets/imgs/delay-icon.png') no-repeat;
        background-size: 48px 24px;
        background-position: center;
        float: right;
        margin: 4px 10px 0px 0px;
      }
    }
    &__titleInfo {
      height: 55px;
    }
    &__title {
      width: 100%;
      height: 36px;
      font-size: 28px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 36px;
      margin-top: 4px;
      box-sizing: border-box;
      padding: 0px 8px;
      margin-bottom: 4px;
    }
    &__info {
      font-weight: 400;
      word-break: keep-all;
      white-space: nowrap;
      font-size: 24px;
      color: @font-dark-low;
      line-height: 42px;
      text-align: left;
      padding: 0px 8px;
    }
    .liveTag {
      color: #fff;
      font-size: 12px;
      padding: 12px;
      border-radius: 20px;
      position: relative;
      z-index: 2;
      .live-status img {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-top: 4px;
        border-radius: 0px;
      }
    }
  }
</style>
