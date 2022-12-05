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
          <img :class="`img_box_bg box_bg_${item.itemMode}`" :src="item.img_url" alt="" />
          <div class="vh-chose-active-item__cover-status">
            <span class="liveTag">
              <label v-if="item.webinar_state == 1" class="live-status">
                <img src="../assets/imgs/live.gif" />
              </label>
              <div>
                <span>{{ getLiveTag(item) }}</span>
                <!--    <span
                  v-if="hasDelayPermission && item.no_delay_webinar == 1 && item.webinar_type !== 6"
                >
                  | {{ $t('common.common_1023') }}
                </span>
                <span v-if="item.webinar_show_type == 0">| {{ $t('common.common_1036') }}</span> -->
              </div>
            </span>
          </div>
          <div v-if="item.hide_pv == 1" class="vh-chose-active-item__cover-hots">
            <div class="vh-chose-active-item__cover-hots__content">
              <i class="vh-saas-iconfont vh-saas-line-heat"></i>
              <i>{{ item.pv }}</i>
            </div>
          </div>
        </div>
        <div class="vh-chose-active-item__titleInfo">
          <div class="vh-chose-active-item__title ellipsis">
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
  import { parseImgOssQueryString } from '@/app-shared/utils/tool.js';
  import { cropperImage } from '@/app-shared/utils/common';
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
        return this.roomBaseServer.state.watchInitData.join_info.third_party_user_id;
      },
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe';
      },
      hasDelayPermission() {
        return this.roomBaseServer.state.configList['no.delay.webinar'];
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
         * webinar_type  1音频直播 2视频直播 3互动直播 5定时直播 6分组直播
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
            this.activeList = res.data.list.map(item => {
              let mode = 1;
              if (cropperImage(item.img_url)) {
                mode = this.handlerImageInfo(item.img_url);
              }
              return {
                ...item,
                itemMode: mode
              };
            });
          }
        }
      },
      // 解析图片地址
      handlerImageInfo(url) {
        let obj = parseImgOssQueryString(url);
        return Number(obj.mode);
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
    // justify-content: center;
    justify-content: flex-start;
    align-items: center;
  }
  .live-check-page {
    justify-content: center;
    align-items: flex-start;
    margin: 0px 0px 20px;
  }
  .vh-chose-active-item {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    width: calc(50% - 16px);
    height: 306px;
    margin: 24px 8px 0 8px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--theme-tab-content-live-card-bg);

    &__cover {
      position: relative;
      width: 100%;
      height: 180px;
      background-size: 400% 400%;
      background: #000;
      animation: gradientBG 15s ease infinite;
      border-radius: 8px;
      .img_box_bg {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        &.box_bg_1 {
          object-fit: fill;
        }
        &.box_bg_2 {
          object-fit: cover;
          object-position: left top;
        }
        &.box_bg_3 {
          object-fit: contain;
          object-position: center;
        }
      }

      &-status {
        position: absolute;
        left: 10px;
        top: 15px;
        height: 42px;
        line-height: 42px;
        background: rgba(0, 0, 0, 0.65);
        border-radius: 100px;
        font-size: 20px;
        font-weight: 400;
        color: #ffffff;
        text-align: center;
        img {
          width: 10px;
          position: static;
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
        /*  opacity: 0.6; */
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
      max-height: 84px;
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: var(--theme-tab-content-live-title-font);
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
      color: var(--theme-tab-content-live-info-font);
      line-height: 32px;
      text-align: left;
      padding: 0px 0;
    }
    .liveTag {
      color: #fff;
      font-size: 20px;
      padding: 2px 0 2px 0; /* 外层 active-item__cover-status 有设定左右边距 */
      border-radius: 20px;
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: row;
      align-items: center;
      .live-status {
        padding-right: 6px;

        & > img {
          width: 16px;
          height: 16px;
        }
      }
    }
    .vh-chose-active-item__cover-status {
      padding: 0px 8px !important;
    }
    .ellipsis {
      display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
      -webkit-line-clamp: 2; /** 显示的行数 **/
      overflow: hidden; /** 隐藏超出的内容 **/
      text-overflow: ellipsis;
    }
  }
</style>
