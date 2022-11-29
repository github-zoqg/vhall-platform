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
          <img class="cover_pic" :src="item.cover" v-parseImgOss="{ url: item.cover }" alt="" />
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
          <!-- <div class="vh-chose-active-item__info">
            {{ item.created_at.substr(0, 16) }}
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useCustomMenuServer } from 'middle-domain';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
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
        const url =
          window.location.protocol +
          process.env.VUE_APP_WAP_WATCH +
          process.env.VUE_APP_WEB_KEY +
          `/special/detail?id=${id}&delay=${this.hasDelayPermission ? 1 : 0}`;
        const { system } = getBrowserType();
        if ('ios' === system) {
          console.log('当前是手机端打开-ios');
          window.location.href = url;
        } else {
          console.log('当前是手机端打开-其它');
          window.open(url);
        }
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
    width: calc(50% - 16px);
    height: 306px;
    margin: 24px 8px 0 8px;
    border-radius: 8px;
    background: var(--theme-tab-content-project-card-bg);
    overflow: hidden;

    &__cover {
      position: relative;
      width: 100%;
      height: 180px;
      border-radius: 8px;
      .cover_pic {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: 8px;
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

        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
        border-radius: 0px 0px 16px 16px;
        height: 60px;
        width: 100%;
        left: 0;
        bottom: 0;
        // opacity: 0.6;
        z-index: 3;
        &__content {
          position: absolute;
          left: 18px;
          bottom: 15px;
          color: #ffffff;
          font-style: normal;
          font-weight: 400;
          font-size: 24px;
          line-height: 20px;
          z-index: 4;
        }
        .vh-saas-line-heat {
          font-size: 18px;
          margin-right: 12px;
          margin-top: 2px;
          color: #ffffff;
          &:before {
            display: inline-block;
            width: 20px !important;
            height: 20px !important;
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
      height: 95px;
    }
    &__title {
      width: 100%;
      min-height: 40px;
      // max-height: 84px;
      font-size: 28px;
      font-weight: 400;
      color: var(--theme-tab-content-project-title-font);
      line-height: 40px;
      margin-top: 12px;
      box-sizing: border-box;
      padding: 0 0;
      margin-bottom: 4px;
    }
    &__info {
      font-weight: 400;
      word-break: keep-all;
      white-space: nowrap;
      font-size: 24px;
      color: var(--theme-tab-content-project-info-font);
      line-height: 32px;
      font-style: normal;
      text-align: left;
      padding: 0 0;
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
    .ellipsis {
      display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
      -webkit-line-clamp: 3; /** 显示的行数 **/
      overflow: hidden; /** 隐藏超出的内容 **/
      text-overflow: ellipsis;
    }
  }
</style>
