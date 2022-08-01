<template>
  <div class="vmp-subject-body">
    <div class="vmp-subject-body_info">
      <div class="vmp-subject-body_main">
        <div class="subject_left">
          <div class="subject_left_main">
            <img :src="subjectDetailInfo.cover || defaultImages" />
          </div>
          <div class="subject_left_detail">
            <p>
              <i class="vh-iconfont vh-line-video-camera"></i>
              {{ subjectDetailInfo.webinar_num }}
            </p>
            <p v-if="subjectDetailInfo.hide_pv">
              <i class="vh-saas-iconfont vh-saas-line-heat"></i>
              {{ subjectDetailInfo.pv }}
            </p>
            <p v-if="subjectDetailInfo.hide_appointment">
              <i class="vh-iconfont vh-line-time"></i>
              {{ subjectDetailInfo.order_num }}
            </p>
          </div>
        </div>
        <div class="subject_right">
          <el-scrollbar>
            <div class="subject_right_text" v-html="subjectIntroInfo"></div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <div class="vmp-subject-body_list">
      <el-row :gutter="24" class="subject_lives">
        <el-col
          class="subject_lives_liveItem"
          :xs="24"
          :sm="12"
          :md="12"
          :lg="6"
          :xl="6"
          v-for="(item, index) in subjectDetailInfo.webinar_list"
          :key="index"
        >
          <div class="living_inner" @click="toDetail(item)">
            <div class="living_top">
              <span class="living_top_hot" v-if="item.hide_pv">
                <i class="vh-saas-iconfont vh-saas-line-heat">{{ item.pv }}</i>
              </span>
              <span class="living_liveTag">
                {{ liveTag(item) }}
                <span v-if="item.webinar_type != 6 && item.no_delay_webinar == 1">| 无延迟</span>
              </span>
              <div class="living_box"><img :src="item.img_url || defaultImages" alt="" /></div>
            </div>
            <div class="living_bottom">
              <div>
                <p class="living_bottom_title" :title="item.subject">
                  {{ item.subject }}
                </p>
                <p class="living_bottom_time">{{ item.start_time }}</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="subject_nomore">已经到底啦～</div>
    </div>
  </div>
</template>
<script>
  import { useSubjectServer } from 'middle-domain';
  import { boxEventOpitons, handleIntroInfo } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpSubjectBody',
    data() {
      return {
        webinarId: '',
        defaultImages: 'https://cnstatic01.e.vhall.com/static/img/v35-subject.png'
      };
    },
    beforeCreate() {
      this.subjectServer = useSubjectServer();
    },
    computed: {
      subjectDetailInfo() {
        return this.subjectServer.state.subjectDetailInfo;
      },
      subjectAuthInfo() {
        return this.subjectServer.state.subjectAuthInfo;
      },
      subjectIntroInfo() {
        return handleIntroInfo(this.subjectDetailInfo.intro);
      }
    },
    methods: {
      liveTag(val) {
        /**
         * webinar_state  1直播 2预约 3结束 4点播 5回放
         * webinar_type  1音频直播 2视频直播 3互动直播 5 定时直播 6 分组直播
         */
        const liveTypeStr = ['', '直播', '预告', '结束', '点播', '回放'];
        const liveStatusStr = ['', '音频直播', '视频直播', '互动直播', '', '', '分组直播'];
        let str = liveTypeStr[val.webinar_state];
        if (val.webinar_state != 4 && val.webinar_type != 5) {
          str += ` | ${liveStatusStr[val.webinar_type]}`;
        }
        return str;
      },
      toDetail(item) {
        this.webinarId = item.webinar_id;
        const { pass, is_preview } = this.subjectServer.state.subjectAuthInfo;
        // 预告状态、有暖场视频
        if (item.webinar_state == 2 && item.is_open_warm_video == 1) {
          this.goWatch();
          return;
        }
        // 回放状态、开启了试看
        if (item.webinar_state == 5 && is_preview == 1) {
          this.goWatch();
          return;
        }
        pass == 1 ? this.goWatch() : this.handleAuthInfo();
      },
      goWatch() {
        let href = `${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.webinarId}${window.location.search}`;
        window.open(href, '_blank');
      },
      changePass() {
        this.subjectServer.state.subjectAuthInfo.pass = 1;
      },
      handleAuthInfo() {
        const { verify } = this.subjectServer.state.subjectAuthInfo;
        let data = {
          subject_id: this.subjectDetailInfo.id,
          refer: this.$route.query.refer,
          record_id: this.$route.query.record_id,
          type: verify,
          ...this.$route.query
        };
        this.subjectServer.getSubjectWatchAuth(data).then(res => {
          this.handleAuthErrorCode(res.code, res.msg);
        });
      },
      handleAuthErrorCode(code, msg) {
        let placeHolderInfo = {
          placeHolder: '',
          webinarId: this.webinarId,
          isSubject: true
        };
        switch (code) {
          case 510008: // 未登录
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
            break;
          case 512525: // 填写表单emitClickOpenSignUpForm
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickOpenSignUpForm', this.webinarId)
            );
            break;
          case 512002:
          case 512522:
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            break;
          case 512531:
            // 邀请码
            placeHolderInfo.placeHolder =
              this.subjectAuthInfo.fcode_verify || this.$t('appointment.appointment_1024');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolderInfo)
            );
            break;
          case 512528:
            // 密码
            placeHolderInfo.placeHolder =
              this.subjectAuthInfo.password_verify || this.$t('appointment.appointment_1022');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolderInfo)
            );
            break;
          case 512532:
            //白名单
            placeHolderInfo.placeHolder =
              this.subjectAuthInfo.white_verify || this.$t('common.common_1006');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolderInfo)
            );
            break;
          case 512523:
            // 付费
            break;
          default:
            this.$message({
              message: msg || '验证失败',
              showClose: true,
              // duration: 0,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
            break;
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-subject-body {
    &_info {
      background: #f7f7f7;
      border-radius: 4px;
      .vmp-subject-body_main {
        width: 100%;
        height: 690px;
        display: flex;
        margin-top: 20px;
      }
      .subject_left {
        width: calc(100% - 384px);
        &_main {
          width: 100%;
          height: 632px;
          border-radius: 4px;
          background-color: #1a1a1a;
          flex: 1;
          img {
            width: 100%;
            height: 100%;
            border-radius: 4px 4px 0 0;
          }
        }
        &_detail {
          display: flex;
          padding: 19px 24px;
          background: #fff;
          border-radius: 0 0 4px 4px;
          p {
            padding-right: 18px;
            color: #666;
            font-size: 14px;
            line-height: 20px;
            .vh-line-video-camera {
              font-size: 16px;
            }
            .vh-saas-line-heat,
            .vh-line-time {
              font-size: 14px;
            }
          }
        }
      }
      .subject_right {
        margin-left: 20px;
        background: #fff;
        border-radius: 4px;
        width: 360px;
        // height: 100%;
        overflow-y: auto;
        padding: 8px 0;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
        &_text {
          color: #1a1a1a;
          height: calc(100% - 592px);
          word-break: break-all;
          line-height: 1.5;
          padding: 0 24px;
          strong {
            font-weight: bold;
          }
          p {
            font-style: normal;
            padding: 5px 0;
            font-size: 14px;
            img {
              margin: 5px 0;
            }
          }
          .show-link {
            color: #3562fa;
          }
        }
      }
    }
    &_list {
      margin-top: 24px;
      background: #f7f7f7;
      border-radius: 4px;
      height: 100%;
      .subject_lives {
        &_liveItem {
          margin-bottom: 24px;
          border-radius: 4px;
          .living_inner {
            display: inline-block;
            width: 100%;
            transition: all 0.15s ease-in;
            position: relative;
          }
          .living_inner:hover {
            box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.15);
          }
          .living_top {
            height: 150.4px;
            /* background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab); */
            background: #1a1a1a;
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            padding: 10px 10px;
            box-sizing: border-box;
            position: relative;
            border-radius: 4px 4px 0 0;
            &_hot {
              position: absolute;
              bottom: 0;
              left: 0;
              color: #fff;
              font-size: 14px;
              z-index: 2;
              height: 40px;
              width: 100%;
              background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.6));
              i {
                position: absolute;
                left: 14px;
                bottom: 10px;
                font-size: 14px;
              }
            }
          }
          .living_liveTag {
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            font-size: 12px;
            padding: 2px 9px;
            border-radius: 20px;
            position: relative;
            z-index: 2;
          }
          .living_box {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            overflow: hidden;
            border-radius: 4px 4px 0 0;
            img {
              width: 100%;
              height: 100%;
              object-fit: scale-down;
              cursor: pointer;
              border-radius: 4px 4px 0 0;
            }
          }
          .living_bottom {
            height: 84px;
            background: #fff;
            box-sizing: border-box;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            &_title {
              color: #1a1a1a;
              font-size: 16px;
              margin-bottom: 6px;
              line-height: 22px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              text-align: left;
              /* autoprefixer: ignore next */
              -webkit-box-orient: vertical;
            }
            &_time {
              font-size: 14px;
              color: #666;
              span {
                float: right;
                margin-top: -3px;
              }
            }
          }
        }
      }
      .subject_nomore {
        text-align: center;
        color: #999;
        font-size: 14px;
      }
    }
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #bbbbbb !important;
  }
  @media (min-width: 1920px) {
    .vmp-subject-body {
      width: 1510px;
      margin: 0 auto;
    }
    .el-col-xl-6 {
      width: 20%;
    }
  }
  @media (min-width: 1600px) {
    .vmp-subject-body {
      width: 1510px;
      margin: 0 auto;
    }
    .el-col-xl-6 {
      width: 20%;
    }
  }
</style>
