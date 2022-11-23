<template>
  <div class="icon-wrap-notice" v-if="noticeNum && isShowIcon">
    <img
      :src="
        noticeNum - noticeNumIsWatch
          ? imageAssets[iconStyle == 1 ? 'iconNum' : 'noticeIcon2']
          : imageAssets[iconStyle == 1 ? 'noticeIcon' : 'noticeIcon2']
      "
      alt=""
      @click="getNoticeList()"
    />
    <slot></slot>
    <span :class="'dot' + iconStyle" v-if="noticeNum - noticeNumIsWatch">
      <div align="center">
        {{ noticeNum - noticeNumIsWatch > 99 ? '99+' : noticeNum - noticeNumIsWatch }}
      </div>
    </span>
    <!-- 问卷列表弹框 -->
    <van-popup
      get-container="#otherPopupContainer"
      class="notice_base"
      v-model="isShowNotice"
      position="bottom"
      @close="closeNotice"
    >
      <div class="vmp-notice-list_container">
        <div class="container-title">
          <img src="./images/star1.png" alt="" class="star1" />
          <span class="container-title-text">
            <span class="title_text">{{ $t('interact_tools.interact_tools_1086') }}</span>
            <i class="container-title-text-line"></i>
          </span>

          <img src="./images/star2.png" alt="" class="star2" />
          <i class="vh-iconfont vh-line-close" @click="closeNotice"></i>
        </div>
        <van-list class="container-data" @load="moreLoadData" :immediate-check="false" offset="30">
          <ul v-show="noticeNum">
            <li v-for="(item, index) in noticeList" :key="index">
              <div class="data-text">
                <span class="data-text_circle" :class="index != 0 ? 'border_col_bfb' : ''">
                  <i class="num" :class="index != 0 ? 'col_bfb' : ''"></i>
                </span>
                <div class="data-text_title">
                  <div class="data-text_title_basebg">
                    <div>{{ item.content.content }}</div>
                    <div class="data-time">
                      {{ item.created_at.substr(5, 11) }}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </van-list>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import { useNoticeServer, useRoomBaseServer, useGroupServer } from 'middle-domain';

  import iconNum from './images/icon_num.png';
  import noticeIcon from './images/notice-icon.png';
  import noticeIcon2 from './images/notice-icon2.png';

  export default {
    name: 'QuestionnaireIcon',
    props: {
      iconStyle: {
        default: 1,
        type: Number,
        required: false
      } // 1为传统风格icon，2为新版icon
    },
    data() {
      return {
        noticeNum: 0,
        isShowIcon: false,
        isShowNotice: false, //是否显示公告列表
        noticeList: [],
        noticeNumIsWatch: sessionStorage.getItem(this.$route.params.id) || 0,
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        },
        imageAssets: {
          iconNum,
          noticeIcon,
          noticeIcon2
        }
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      noticeLatestInfo() {
        // 最新公告信息
        return this.roomBaseServer.state.noticeInfo;
      }
    },
    watch: {},
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      console.log(13132132);
      this.getNoticeInfo();
    },
    mounted() {
      this.initNotice();
    },
    methods: {
      // 初始化消息
      initNotice() {
        const { groupInitData } = this.groupServer.state;
        this.noticeServer.$on('live_over', () => {
          sessionStorage.setItem(this.$route.params.id, 0);
          this.isShowIcon = false;
        });
        // 结束讨论
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          if (!groupInitData.isInGroup) {
            this.getNoticeInfo();
          }
        });
        if (groupInitData.isInGroup) return;
        // 公告消息
        this.noticeServer.$on('room_announcement', msg => {
          // 展示icon数量+1
          !this.isShowIcon && this.roomBaseServer.setShowIconNum(true);
          this.isShowIcon = true;
          this.noticeNum = this.noticeNum + 1;
          this.noticeList.unshift({
            created_at: msg.push_time,
            content: {
              content: msg.room_announcement_text
            }
          });
        });
      },
      // 聚合接口检测是否有历史公告
      getNoticeInfo() {
        this.noticeNum = this.noticeLatestInfo.total || 0;
        if (this.noticeNum && this.noticeLatestInfo.list[0].created_at) {
          // 展示icon数量+1
          !this.isShowIcon && this.roomBaseServer.setShowIconNum(true);
          this.isShowIcon = true;
          this.pageInfo = {
            pos: 0,
            limit: 10,
            pageNum: 1
          };
        }
      },
      // 获取公告列表
      async getNoticeList(flag) {
        this.isShowNotice = true;
        const { watchInitData } = this.roomBaseServer.state;
        const params = {
          room_id: watchInitData.interact.room_id,
          is_cache: 1,
          ...this.pageInfo
        };

        this.noticeServer.getNoticeList({ params, flag }).then(result => {
          if (result.code === 200 && result.data) {
            this.noticeList = this.noticeServer.state.noticeList;
            this.totalPages = this.noticeServer.state.totalPages;
            this.total = result.data.total;
            this.noticeNum = result.data.total;
            sessionStorage.setItem(this.$route.params.id, this.noticeNum);
            this.noticeNumIsWatch = this.noticeNum;
          }
        });
      },
      // 滚动加载
      moreLoadData() {
        if (this.pageInfo.pageNum >= this.totalPages) {
          return false;
        }
        this.pageInfo.pageNum++;
        this.pageInfo.pos = parseInt((this.pageInfo.pageNum - 1) * this.pageInfo.limit);
        this.getNoticeList(true);
      },
      closeNotice() {
        this.noticeList = [];
        this.pageInfo = {
          pos: 0,
          limit: 10,
          pageNum: 1
        };
        this.isShowNotice = false;
      }
    }
  };
</script>

<style lang="less">
  .icon-wrap-notice {
    margin-top: 24px;
    width: 60px;
    height: 60px;
    position: relative;
    font-size: 28px;
    // background: linear-gradient(180deg, #fca810 0%, #fe7d00 100%);
    border-radius: 50%;
    img {
      width: 60px;
      height: 60px;
    }
    .van-overlay {
      background-color: rgba(0, 0, 0, 0.7) !important;
    }
    .dot1 {
      position: absolute;
      top: -10px;
      right: -12px;
      width: 30px;
      height: 30px;
      line-height: 33px;
      font-size: 20px;
      color: #ffffff;
      background: url(./images/Rectangle.png) no-repeat;
      background-size: 100%;
      div {
        zoom: 0.8;
      }
    }
    .dot2 {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      line-height: 18px;
      text-align: center;
      font-size: 14px;
      color: #ffffff;
      background: #fb2626;
    }
    .popup_base {
      width: 100vw;
      background: rgba(0, 0, 0, 0.6);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 30;
    }
    .notice_base {
      max-height: 680px;
      background: transparent;
      background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
      border-radius: 30px 30px 0 0;
    }
    .vmp-notice-list_container {
      max-height: 680px;
      overflow: auto;
      .container-title {
        height: 142px;
        background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
        text-align: center;
        position: relative;
        .star1 {
          position: relative;
          top: 72px;
          left: -54px;
          width: 27px;
          height: auto;
        }
        .container-title-text {
          position: relative;
          top: 47px;
          z-index: 2;
          .title_text {
            font-weight: 600;
            text-shadow: 0 0.05333rem 0 #fff;
            font-size: 40px;
            line-height: 56px;
          }
        }
        .container-title-text-line {
          display: inline-block;
          width: 100%;
          height: 18px;
          position: absolute;
          bottom: 0px;
          left: 49%;
          transform: translate(-51%);
          background: rgba(255, 171, 166, 0.6);
          border-radius: 36px;
          content: '';
          z-index: -1;
        }
        .star2 {
          height: auto;
          width: 45px;
          position: relative;
          top: 32px;
          left: 43px;
        }
      }
      .container-data {
        max-height: calc(680px - 210px);
        padding: 0 40px;
        margin-bottom: 68px;
        position: relative;
        overflow: auto;
        color: @font-light-normal;
        z-index: 2;
        ul {
          li {
            color: @font-light-normal;
            font-size: 28px;
            line-height: 1.2;
            position: relative;
            &:last-child {
              .data-text_title {
                padding-bottom: 0;
              }
            }
          }
        }
        .data-time {
          line-height: 1.6;
          font-size: 28px;
          display: inline-block;
          text-align: left;
          color: #8c8c8c;
          padding-top: 10px;
        }
        .data-text {
          position: relative;
          padding-left: 12px;
          &_circle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 27px;
            height: 27px;
            border-radius: 50%;
            background: #fdf1ed;
            border: 1px solid #fb2626;
            top: 30px;
            left: 0px;
            position: absolute;
            .num {
              display: inline-block;
              width: 15px;
              height: 15px;
              border-radius: 50%;
              background: #fb2626;
            }
          }
          .col_bfb {
            background: #bfbfbf;
          }
          .border_col_bfb {
            border-color: #bfbfbf;
            background: #fdf1ed;
          }
          &_title {
            padding: 0 0 21px 32px;
            color: #1a1a1a;
            line-height: 1.6;
            word-break: break-word;
            border-left: 1px dashed #bfbfbf;
            border-radius: 2px;
            font-size: 28px;
            .data-text_title_basebg {
              background: rgba(255, 255, 255, 0.6);
              border-radius: 16px;
              padding: 24px 31px 20px 24px;
              & > :first-child {
                line-height: 39px;
                font-size: 28px;
              }
            }
          }
        }
      }
      .vh-line-close {
        position: absolute;
        color: #8c8c8c;
        top: 37px;
        right: 30px;
        cursor: pointer;
      }
    }
  }
</style>
