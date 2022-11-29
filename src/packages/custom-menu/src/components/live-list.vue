<template>
  <div>
    <div class="vh-chose-active-box" :class="{ 'live-check-page': isSubscribe }">
      <!-- 单个视频 -->
      <div
        v-for="item in activeList"
        :key="item.id"
        class="vh-chose-active-item"
        @click="gotoRoom(item.id)"
      >
        <div class="vh-chose-active-item__cover">
          <img
            class="cover_pic img_box_bg"
            v-parseImgOss="{ url: item.img_url }"
            :src="item.img_url"
            alt=""
          />
          <div class="vh-chose-active-item__cover-status">
            <span class="liveTag">
              <label v-if="item.webinar_state == 1" class="live-status">
                <img src="../assets/imgs/live.gif" alt="" />
              </label>
              <div class="scale8">
                <span>{{ getLiveTag(item) }}</span>
                <!-- <span
                  v-if="hasDelayPermission && item.no_delay_webinar == 1 && item.webinar_type !== 6"
                >
                  | {{ $t('common.common_1023') }}
                </span> -->
                <!-- <span v-if="item.webinar_show_type == 0">| {{ $t('common.common_1036') }}</span> -->
              </div>
            </span>
          </div>
          <div v-if="item.hide_pv == 1" class="vh-chose-active-item__cover-hots">
            <div class="vh-chose-active-item__cover-hots__content">
              <i class="vh-saas-iconfont vh-saas-line-heat icon_heart_css"></i>
              <i>{{ item.pv }}</i>
            </div>
          </div>
        </div>
        <div class="vh-chose-active-item__titleInfo">
          <div class="vh-chose-active-item__title">
            {{ item.subject }}
          </div>
          <div class="vh-chose-active-item__info">
            {{ item.start_time || item.created_at }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useCustomMenuServer, useRoomBaseServer } from 'middle-domain';
  export default {
    props: ['checkedList'],
    data() {
      return {
        activeList: [],
        loading: false
      };
    },
    computed: {
      userId() {
        return this.watchInitData.join_info.third_party_user_id;
      },
      hasDelayPermission() {
        return this.roomBaseServer.state.configList['no.delay.webinar'] == 1;
      },
      isSubscribe() {
        return this.roomBaseServer.state.watchInitData.status === 'subscribe';
      }
    },
    watch: {
      checkedList: {
        handler(val) {
          if (val) {
            this.getActiveList();
          }
        },
        deep: true,
        immediate: true
      }
    },
    beforeCreate() {
      this.customMenuServer = useCustomMenuServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    methods: {
      getLiveTag(val) {
        /**
         * webinar_state  1直播 2预约 3结束 4点播 5回放
         * webinar_type  1音频直播 2视频直播 3互动直播   6分组直播
         */
        const liveTypeMap = new Map([
          [0, ''],
          [1, this.$t('common.common_1018')],
          [2, this.$t('common.common_1019')],
          [3, this.$t('common.common_1020')],
          [4, this.$t('common.common_1024')],
          [5, this.$t('common.common_1021')]
        ]);

        const liveStatusStrMap = new Map([
          [0, ''],
          [1, this.$t('common.common_1026')],
          [2, this.$t('common.common_1027')],
          [3, this.$t('common.common_1028')],
          [4, ''],
          [5, ''],
          [6, this.$t('common.common_1029')]
        ]);

        let liveType = liveTypeMap.get(val.webinar_state);

        let liveStatus = '';
        if (val.webinar_state != 4 && val.webinar_type != 5) {
          liveStatus = ` | ${liveStatusStrMap.get(val.webinar_type)}`;
        }
        return `${liveType}${liveStatus}`;
      },
      gotoRoom(id) {
        this.$emit('link', id);
      },
      async getActiveList() {
        if (this.checkedList.length == 0) {
          this.activeList = [];
          return;
        }
        this.loading = true;

        const res = await this.customMenuServer.getActiveList({
          webinar_ids: this.checkedList.join(','),
          user_id: '',
          is_check: 0
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
  .live-check-page {
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
    border-radius: 4px;
    background-color: var(--theme-tab-content-live-card-bg);
    &:hover {
      cursor: pointer;
      background-color: var(--theme-tab-content-live-card-hover-bg);
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
      background: #383838;
      border-radius: 4px;
      overflow: hidden;
      .img_box_bg {
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
            margin-right: 4px;
            margin-top: 2px;
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
      flex: 1;
    }
    &__title {
      margin: 10px 0 4px 0;
      font-size: 14px;
      font-weight: 400;
      color: var(--theme-tab-content-live-title-font);
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      text-align: left;
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical;
      max-height: 200px;
      word-break: break-word;
    }
    &__info {
      font-weight: 400;
      word-break: keep-all;
      white-space: nowrap;
      font-size: 12px;
      color: var(--theme-tab-content-live-info-font);
      line-height: 16px;
      text-align: left;
    }
    .liveTag {
      color: #fff;
      font-size: 12px;
      border-radius: 20px;
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: row;
      align-items: center;
      .live-status {
        display: inline-block;
        width: 12px;
        img {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 0px;
          // margin-top: 4px;
        }
      }
      .scale8 {
        zoom: 0.8;
        white-space: nowrap;
      }
    }
    .vh-chose-active-item__cover-status {
      padding: 0px 8px !important;
    }
  }
  .live-check-page .vh-chose-active-item {
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
      .img_box_bg {
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
      &-status {
        padding: 0px 12px;
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
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
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
      display: inline-block;
      height: 20px;
      padding: 0px;
      .live-status {
        display: inline-block;
        width: 12px;
        img {
          margin-top: 4px;
        }
      }
    }
  }
  @media screen and (max-width: 1366px) {
    .live-check-page {
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
    .live-check-page {
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
    .live-check-page {
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
    .live-check-page {
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
