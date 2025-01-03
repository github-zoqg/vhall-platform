<template>
  <div class="vmp-auth">
    <el-dialog
      :title="$t('appointment.appointment_1020')"
      :visible.sync="authVisible"
      @close="closeVisibleDialog"
      width="400px"
    >
      <div class="vmp-auth-wrap">
        <div :class="['vmp-auth-wrap-text', isWhiteCheck ? 'auth__privacy' : '']">
          <el-input
            :type="isHideEye ? 'text' : 'password'"
            v-model="authTitle"
            :placeholder="placeholder"
          >
            <i
              slot="suffix"
              @click="hideEye"
              :class="`vh-iconfont ${isHideEye ? 'vh-line-view' : 'vh-line-hidden'}`"
            ></i>
          </el-input>
        </div>
        <!-- 隐私合规（嵌入不支持） -->
        <vmp-privacy-compliance
          scene="auth"
          clientType="pc"
          compType="2"
          v-if="isWhiteCheck"
        ></vmp-privacy-compliance>
        <div class="vmp-auth-wrap-btn">
          <el-button type="primary" round @click="authSubmit">
            {{ $t('account.account_1062') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer, useSubjectServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpWatchAuth',
    data() {
      return {
        authVisible: false,
        isHideEye: false,
        isSubject: false,
        webinarId: '',
        placeholder: '',
        authTitle: '',
        isWhiteCheck: false
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      isEmbedVideo() {
        // 是不是单视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
      this.subjectServer = useSubjectServer();
    },
    methods: {
      openAuthDialog(info) {
        console.log(info);
        this.isSubject = info.isSubject;
        this.webinarId = info.webinarId;
        this.authVisible = true;
        this.placeholder = info.placeHolder;
        this.isWhiteCheck = info.isWhiteCheck; // 是否开启了白名单验证
      },
      hideEye() {
        this.isHideEye = !this.isHideEye;
      },
      closeVisibleDialog() {
        this.authTitle = '';
        this.placeholder = '';
        this.isHideEye = false;
        this.authVisible = false;
      },
      authSubmit() {
        if (this.isSubject) {
          this.authSubjectCheck();
        } else {
          this.authWebinarCheck();
        }
      },
      // 活动验证
      authWebinarCheck() {
        const { webinar } = this.roomBaseServer.state.watchInitData;
        console.log(webinar, '???13214');
        let data = {
          webinar_id: webinar.id,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id,
          type: webinar.verify == 6 ? 4 : webinar.verify,
          verify_value: this.authTitle,
          ...this.$route.query
        };
        if (this.isEmbed) {
          // 消息通知 - 添加参数字段
          data.clientType = 'embed';
          data.embed_type = this.isEmbedVideo ? 'video' : 'full';
        }
        this.subscribeServer.watchAuth(data).then(res => {
          if (res.code == 200) {
            if (res.data.status == 'live') {
              let pageUrl = '';
              if (location.pathname.indexOf('embedclient') != -1) {
                pageUrl = '/embedclient';
              }
              window.location.href =
                window.location.origin +
                process.env.VUE_APP_ROUTER_BASE_URL +
                `/lives${pageUrl}/watch/${webinar.id}${window.location.search}`;
            } else {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else if (res.code === 512525) {
            // 关闭权限验证框，打开报名表单
            this.closeVisibleDialog();
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickOpenSignUpForm')
            );
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg,
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
        });
      },
      // 专题验证
      authSubjectCheck() {
        const { subjectDetailInfo, subjectAuthInfo } = this.subjectServer.state;
        let data = {
          subject_id: subjectDetailInfo.id,
          visitor_id: subjectAuthInfo.visitor_id,
          type: subjectAuthInfo.verify,
          verify_value: this.authTitle,
          ...this.$route.query
        };
        this.subjectServer.getSubjectWatchAuth(data).then(res => {
          if (res.code == 200) {
            this.subjectServer.state.subjectAuthInfo.pass = 1;
            this.authVisible = false;
            let href =
              window.location.origin +
              process.env.VUE_APP_ROUTER_BASE_URL +
              `/lives/watch/${this.webinarId}${window.location.search}`;
            window.open(href, '_blank');
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg,
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-auth {
    &-wrap {
      padding-top: 12px;
      &-text {
        padding-bottom: 24px;
        .el-input__suffix {
          line-height: 40px;
          padding: 0 5px;
          cursor: pointer;
          .iconfont {
            font-size: 14px;
          }
        }
        .el-input__inner {
          padding-right: 40px;
        }
        &.auth__privacy {
          padding-bottom: 4px;
        }
      }
      &-btn {
        text-align: right;
        .el-button {
          background-color: var(--theme-color) !important;
          border: 1px solid var(--theme-color) !important;
        }
      }
    }
  }
</style>
