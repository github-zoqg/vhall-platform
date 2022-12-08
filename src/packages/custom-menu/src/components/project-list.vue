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
              <i class="vh-saas-iconfont vh-saas-line-heat icon_heart_css"></i>
              <i>{{ item.pv }}</i>
            </div>
          </div>
        </div>
        <div class="vh-chose-active-item__titleInfo">
          <div class="vh-chose-active-item__title">
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
  export default {
    props: ['checkedList'],
    data() {
      return {
        activeList: [],
        loading: false,
        hasDelayPermission: false
      };
    },
    computed: {
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status === 'subscribe';
      }
    },
    watch: {
      checkedList: function () {
        this.getActiveList();
      }
    },
    beforeCreate() {
      this.customMenuServer = useCustomMenuServer();
    },
    created() {
      // this.hasDelayPermission = this.configList['no.delay.webinar'] == 1;
      this.getActiveList();
    },
    methods: {
      linkSubject(id) {
        // window.open(window.location.protocol + process.env.VUE_APP_WEB_BASE + process.env.VUE_APP_WEB_KEY + `/special/detail?id=${id}&delay=${this.hasDelayPermission ? 1 : 0}`)
        window.open(
          window.location.protocol +
            process.env.VUE_APP_WAP_WATCH +
            process.env.VUE_APP_WEB_KEY +
            `/special/detail?id=${id}&delay=${this.hasDelayPermission ? 1 : 0}`
        );
      },
      async getActiveList() {
        if (this.checkedList.length == 0) {
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
    justify-content: center;
  }
  .project-check-page {
    justify-content: center;
    align-items: flex-start;
    margin: 0px 0px 20px;
  }
  .vh-chose-active-item {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    width: 312px;
    height: 80px;
    padding: 8px 10px 8px;
    font-family: PingFangSC-Regular, PingFang SC;
    border-radius: 4px;
    background-color: var(--theme-tab-content-project-card-bg);
    &:hover {
      cursor: pointer;
      background-color: var(--theme-tab-content-project-card-hover-bg);
      .vh-chose-active-item__title {
        color: var(--theme-color);
      }
      .cover_pic {
        transform: scale(1.2);
      }
    }
    &__cover {
      position: relative;
      width: 142px;
      height: 80px;
      margin-right: 12px;
      border-radius: 4px;
      overflow: hidden;
      .cover_pic {
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        object-fit: contain;
        object-position: center;
      }
      &-status {
        position: absolute;
        left: 6px;
        top: 6px;
        min-width: 98px;
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
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
        border-radius: 0px 0px 4px 4px;
        height: 32px;
        width: 100%;
        left: 0;
        bottom: 0;
        z-index: 3;
        &__content {
          position: absolute;
          left: 10px;
          bottom: 4px;
          font-size: 12px;
          font-weight: 400;
          color: #ffffff;
          line-height: 20px;
          z-index: 4;
        }
        .icon_heart_css {
          &:before {
            display: inline-block;
            width: 14px !important;
            height: 14px !important;
            margin-top: 2px;
            margin-right: 4px;
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
      flex: 1;
    }
    &__title {
      margin: 10px 0px 4px 0px;
      font-size: 14px;
      font-weight: 400;
      color: var(--theme-tab-content-project-title-font);
      line-height: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      /**autoprefixer: ignore next */
      -webkit-box-orient: vertical;
      word-break: break-word;
    }
    &__info {
      font-weight: 400;
      word-break: keep-all;
      white-space: nowrap;
      font-size: 12px;
      color: var(--theme-tab-content-project-info-font);
      line-height: 16px;
      text-align: left;
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
  .project-check-page .vh-chose-active-item {
    flex-direction: column;
    width: 284px;
    height: 261px;
    margin: 0px 8px 16px;
    border-radius: 4px;
    padding: 0px;
    &__cover {
      width: 100%;
      height: 160px;
      background: #000;
      background-size: 400% 400%;
      animation: gradientBG 15s ease infinite;
      overflow: hidden;
      .cover_pic {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 0px;
        transition: all 0.3s;
        &:hover {
          transform: scale(1.2);
        }
      }
      &-hots {
        left: 0;
        bottom: 0;
        z-index: 3;
        border-radius: 0 0;
        &__content {
          left: 12px;
          bottom: 6px;
          font-size: 14px;
          z-index: 4;
        }
      }
    }
    &__titleInfo {
      height: 100px;
      background: #fff;
      &:hover {
        .vh-chose-active-item__title {
          color: var(--theme-color);
        }
      }
    }
    &__title {
      font-size: 16px !important;
      color: @font-light-normal;
      line-height: 24px;
      margin: 12px 16px 7px 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical;
    }
    &__info {
      font-size: 14px;
      font-weight: 400;
      color: @font-dark-second;
      line-height: 17px;
      margin-left: 16px;
    }
    .liveTag {
      height: 20px;
      padding: 0px;
    }
  }

  @media screen and (max-width: 1366px) {
    .project-check-page {
      .vh-chose-active-item {
        width: 249px;
        height: 240px;
        .vh-chose-active-item__cover {
          height: 140px;
        }
        .vh-chose-active-item__titleInfo {
          height: 100px;
        }
      }
    }
  }

  @media screen and (min-width: 1367px) and (max-width: 1600px) {
    .project-check-page {
      .vh-chose-active-item {
        width: 284px;
        height: 261px;
        .vh-chose-active-item__cover {
          height: 160px;
        }
        .vh-chose-active-item__titleInfo {
          height: 101px;
        }
      }
    }
  }
  @media screen and (min-width: 1601px) and (max-width: 1920px) {
    .project-check-page {
      .vh-chose-active-item {
        width: 358px;
        height: 302px;
        .vh-chose-active-item__cover {
          height: 202px;
        }
        .vh-chose-active-item__titleInfo {
          height: 100px;
        }
      }
    }
  }
  @media screen and (min-width: 1921px) {
    .project-check-page {
      .vh-chose-active-item {
        width: 358px;
        height: 302px;
        .vh-chose-active-item__cover {
          height: 202px;
        }
        .vh-chose-active-item__titleInfo {
          height: 100px;
        }
      }
    }
  }
</style>
