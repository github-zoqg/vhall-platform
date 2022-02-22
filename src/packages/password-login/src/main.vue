<template>
  <div class="vmp-password-login">
    <template v-if="!isMobile">
      <!--头部-->
      <div class="vmp-password-login__header-wrap">
        <div class="vmp-password-login__header-content">
          <!-- 活动-标题、状态、主办方、时间-->
          <div class="header-content__title-wrap">
            <div class="header-content__title">
              <span>{{ (webinarInfo.subject || '') | textOverflowSlice(40) }}</span>
              <p
                v-if="webinarInfo && webinarInfo.subject && webinarInfo.subject.length > 40"
                class="header-content__title_hover"
              >
                {{ webinarInfo.subject }}
              </p>
            </div>
            <!-- 预告 -->
            <span v-show="webinarInfo.webinar_state == 2" class="header-content__tag subscribe">
              <label>
                {{ $t('预告') }}{{ webinarInfo.webinar_type == 5 ? ' | 定时直播' : '' }}
              </label>
            </span>
            <!-- 直播 -->
            <span v-show="webinarInfo.webinar_state == 1" class="header-content__tag live">
              <img src="img/live-white.gif" alt="" />
              <label>
                {{ $t('直播') }}{{ webinarInfo.webinar_type == 5 ? ' | 定时直播' : '' }}
              </label>
            </span>
            <!-- 结束 -->
            <span v-show="webinarInfo.webinar_state == 3" class="header-content__tag end">
              <label>
                {{ $t('结束') }}{{ webinarInfo.webinar_type == 5 ? ' | 定时直播' : '' }}
              </label>
            </span>
            <!-- 回放 -->
            <span v-show="webinarInfo.webinar_state == 5" class="header-content__tag playback">
              <label>
                {{ $t('回放') }}{{ webinarInfo.webinar_type == 5 ? ' | 定时直播' : '' }}
              </label>
            </span>
            <!-- 点播 -->
            <span v-show="webinarInfo.webinar_state == 4" class="header-content__tag demand">
              <label>
                {{ $t('点播') }}{{ webinarInfo.webinar_type == 5 ? ' | 定时直播' : '' }}
              </label>
            </span>
            <!-- 分组直播默认无延迟，不展示无延迟标记。其它若选择是无延迟且有权限则展示 -->
            <span
              v-if="webinarInfo.webinar_type != 6 && showDelay && hasDelayPermission"
              class="header-content__delay-icon"
            >
              <img :src="noDelayIconUrl" alt="" />
            </span>
          </div>
          <!--时间展示-->
          <p class="header-content__webinar-other">
            <span class="header-content__time">{{ webinarInfo.start_time }}</span>
          </p>
        </div>
      </div>
      <div class="vmp-password-login__main-wrap">
        <div
          :class="[
            'vmp-password-login__main-wrap__img',
            { 'vmp-password-login__main-wrap__img-show': webinarInfo.img_url }
          ]"
        >
          <img v-if="webinarInfo.img_url" :src="webinarInfo.img_url" alt="背景图" />
          <img v-else src="img/code-login__img.png" alt="背景图" />
        </div>
        <div class="vmp-password-login__main-wrap__form">
          <div
            :class="[
              'main-wrap__form__avatar',
              { 'main-wrap__form__allow-upload': ![1, '1'].includes(roleName) }
            ]"
            @click.stop.prevent="uploadAvatar"
          >
            <img :src="`${avatarUrl}`" alt="用户头像" v-if="avatarUrl" />
            <img src="img/advatar_default@2x.png" alt="默认头像" v-else />
            <div class="main-wrap__form__avatar-btn" v-if="![1, '1'].includes(roleName)">
              <span>编辑</span>
            </div>
          </div>
          <el-upload
            class="main-wrap__form__avatar-uploader"
            v-model="imgUrl"
            :action="actionUrl"
            :headers="uploadHeader"
            :data="{
              path: pathUrl,
              type: 'image'
            }"
            name="resfile"
            accept="image/gif, image/jpeg, image/jpg, image/png, image/bmp"
            :on-success="uploadSuccess"
            :on-progress="uploadProcess"
            :on-error="uploadError"
            :on-preview="uploadPreview"
            :before-upload="beforeUpload"
          >
            <el-button type="primary" round id="uploadBtn">上传</el-button>
          </el-upload>
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="password-login-form"
          >
            <el-form-item
              v-if="!isHost"
              prop="nickname"
              :class="[{ 'main-wrap__form__item-error-msg': nameErrorShow }]"
            >
              <el-input
                v-model.trim="loginForm.nickname"
                placeholder="姓名"
                :maxlength="30"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password" class="main-wrap__form__margin-bottom-zero">
              <el-input
                v-model.trim="loginForm.password"
                placeholder="口令 (6位)"
                :maxlength="6"
              ></el-input>
            </el-form-item>
            <el-form-item class="main-wrap__form__inner">
              <el-button class="main-wrap__form__red-button length-max" @click="handleEntryLive">
                进入直播
              </el-button>
            </el-form-item>
          </el-form>
          <p class="main-wrap__form__copyright" v-if="![1, '1'].includes(roleName)">
            推荐使用Chrome 74及以上版本浏览器
            <br />
            头像建议尺寸140*140px，1M内，jpg、gif、png、bmp
          </p>
          <p class="main-wrap__form__copyright" v-else>推荐使用Chrome 74及以上版本浏览器</p>
        </div>
      </div>
      <!--主体  -->
    </template>
    <template v-else>
      <div class="vmp-password-login__no-auth">只能通过PC端进入</div>
    </template>
  </div>
</template>

<script>
  //todo 后续应替换为全局工具服务里的
  import { uuid } from '@/packages/chat/src/js/utils';

  export default {
    name: 'VmpPasswordLogin',
    filters: {
      //文字过长截取
      textOverflowSlice(val = '', len = 0) {
        if (['', void 0, null].includes(val) || ['', void 0, null].includes(len)) {
          return '';
        }
        if (val.length > len) {
          return val.substring(0, len) + '...';
        }
        return val;
      }
    },
    data() {
      return {
        //是否是手机端
        isMobile: false,
        //活动信息
        webinarInfo: {},
        //展示无延迟标记
        showDelay: false,
        //是否有无延迟权限
        hasDelayPermission: false,
        //是否是主持人
        isHost: false,
        //上传成功的头像地址
        avatarUrl: '',
        //上传的图片地址
        imgUrl: '',
        //用户角色
        roleName: this.$route.params.role_name,
        //上传的请求头信息
        uploadHeader: {},
        //上传的地址
        actionUrl: '',
        //地址
        pathUrl: '',
        //登录的表单视图模型
        loginForm: {
          //昵称
          nickname: '',
          //口令
          password: ''
        },
        //表单校验
        loginRules: {
          nickname: [{ required: true, validator: this.validNickName, trigger: 'blur' }],
          password: [{ required: true, message: '直播口令不能为空', trigger: 'blur' }]
        },
        //是否有表单验证错误
        nameErrorShow: false,
        //灰度id todo 待移除
        grayId: ''
      };
    },
    computed: {
      // 无延迟图片地址 todo 待替换 为VUE_APP_PUBLIC_PATH
      noDelayIconUrl() {
        return `//t-alistatic01.e.vhall.com/saas-v3/static/common/img/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png`;
      }
    },
    beforeCreate() {},
    created() {
      this.checkIsMobile();
      this.checkIsHost();
      this.getWebinarInfo();
      this.initUploadInfo();
    },
    mounted() {},
    methods: {
      //初始化上传信息
      initUploadInfo() {
        this.uploadHeader = { platform: 17, 'request-id': uuid(), 'gray-id': this.grayId };
      },
      //获取活动信息 todo domain
      getWebinarInfo() {
        //todo 假数据，待移除
        this.webinarInfo = {
          id: 768635971,
          alias_name: '',
          user_id: 16422770,
          subject: '黄金链路预约',
          introduction: '<p></p>',
          img_url:
            'http://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/upload/common/static-imgs/c0/e7/c0e7569408de296971eb4b98945c240b.png',
          category: '1',
          start_time: '2021-12-29 22:16',
          actual_start_time: '2022-01-18 14:52',
          end_time: '2022-01-19 03:00',
          pv: 93,
          is_open: 1,
          reg_form: 0,
          verify: 0,
          password: '111',
          fee: '0',
          is_custom: 0,
          auto_record: 1,
          is_fms: 2,
          is_chat: 0,
          top: 0,
          is_allow: 2,
          is_old: 0,
          use_global_k: 1,
          exist_3rd_auth: 0,
          auth_url: '',
          failure_url: '',
          jump_url: '',
          buffer: 0,
          document_id: 0,
          created_at: '2021-12-28 22:06:40',
          is_demand: 0,
          is_new_version: 3,
          welcome_content: '',
          player: 2,
          vss_room_id: 'lss_5b351cd7',
          vss_inav_id: 'inav_0bcd72ef',
          vss_channel_id: 'ch_979n4oNE',
          is_private: 0,
          hide_pv: 1,
          hide_appointment: 1,
          hide_watch: 1,
          is_adi_watch_doc: 0,
          is_capacity: 0,
          new_channel_id: 'ch_wZ13FRdG',
          no_delay_webinar: 0,
          biz_id: 2,
          business_account_id: 0,
          inav_num: 16,
          biz_application_id: 'fd8d3653',
          webinar_state: 5,
          webinar_type: 3,
          webinar_curr_num: 0,
          webinar_show_type: 1,
          auto_speak: 0,
          view_num: 0,
          first_broad: '2021-12-30 15:30',
          record_subject: '',
          duration: '00:00:00',
          paas_record_id: '',
          msg_url: '',
          record_id: 0,
          valid_status: 'N',
          count_down: 0,
          user_name: '春有百花秋有月 夏有凉风冬有雪，若无闲事挂心头便是人间好时节',
          time: 1642674825
        };
      },
      //获取配置信息 todo domain
      getConfigList() {},
      //检查是否是手机端 todo utils服务提供，或者domain提供
      checkIsMobile() {
        const reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|wOSBrowser|BrowserNG|WebOS)/i;
        // 若是手机
        this.isMobile = navigator.userAgent.match(reg);
      },
      //检查是否是主持人
      checkIsHost() {
        this.isHost = location.href.indexOf('keylogin-host') !== -1;
      },
      //自定义表单校验
      validNickName(rule, value, callback) {
        this.nameErrorShow = value === '';
        value === '' ? callback(new Error('参会昵称不能为空')) : callback();
      },
      //处理进入直播
      handleEntryLive() {},
      //上传图片
      uploadAvatar() {
        // 非主持人角色时，可上传头像
        if (![1, '1'].includes(this.$route.params.role_name)) {
          const uploadBtn = document.getElementById('uploadBtn');
          uploadBtn.click();
        }
      },
      //上传头像成功
      uploadSuccess(res, file) {
        if (res.data) {
          this.imgUrl = res.data.file_url || '';
          this.avatarUrl = res.data.domain_url || '';
        }
      },
      //上传前处理
      beforeUpload(file) {
        const typeList = ['png', 'jpeg', 'gif', 'bmp'];
        const typeArr = file.type.toLowerCase().split('/');
        const isType = typeList.includes(typeArr[typeArr.length - 1]);
        const isLt2M = file.size / 1024 / 1024 < 1;
        if (!isType) {
          this.$message({
            message: `仅支持 ${typeList.join('、')} 格式`,
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        if (!isLt2M) {
          this.$message({
            message: '图片大小超过1M',
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        return isType && isLt2M;
      },
      //上传进度
      uploadProcess(event, file, fileList) {
        console.log('uploadProcess', event, file, fileList);
      },
      //上传出错处理
      uploadError(err, file, fileList) {
        console.log('uploadError', err, file, fileList);
        this.$message({
          message: '图片上传失败',
          showClose: true,
          // duration: 0,
          type: 'error',
          customClass: 'zdy-info-box'
        });
      },
      uploadPreview(file) {
        console.log('uploadPreview', file);
      }
    }
  };
</script>

<style lang="less">
  .vmp-password-login {
    @font-weight-bold: 500;
    @font-weight-normal: 400;
    /* 活动状态 */
    @tag-subscribe: #3562fa;
    @tag-live: #fb3a32;
    @tag-end: #666666;
    @tag-playback: #14ba6a;
    @tag-demand: #fa9a32;
    @font-color-icon: #cccccc; /* 图标 */
    @font-color-icon-hover: #fb3a32; /* 图标悬浮 */
    @font-user-icon: #666666;
    @font-user-icon-hover: #1a1a1a;
    @font-dark-low: #999999;
    width: 100%;
    height: 100vh;
    background: #f2f2f2;
    &__header-wrap {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      align-self: center;
      flex-direction: column;
      background-color: transparent;
      width: 100%;
    }
    &__header-content {
      width: calc(100% - 144px);
      margin: 0 72px;
      padding-top: 30px;
      // 浏览器中部最小间距，低于此1151px出具横向滚动条[左右8+32px]
      min-width: 1111px;
      .header-content__title-wrap {
        font-size: 18px;
        font-weight: @font-weight-bold;
        color: #1a1a1a;
        line-height: 28px;
      }
      .header-content__title {
        margin-right: 8px;
        position: relative;
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        &:hover {
          .header-content__title_hover {
            display: block;
          }
        }
      }
      .header-content__title_hover {
        display: none;
        position: absolute;
        top: 43px;
        border-radius: 4px;
        word-break: break-all;
        line-height: 17px;
        background: rgba(26, 26, 26, 0.8);
        font-size: 12px;
        color: #fff;
        padding: 8px 12px;
        z-index: 10;
        text-align: left;
        width: 372px;
      }
      .header-content__tag {
        padding: 0 8px;
        height: 20px;
        border-radius: 10px;
        display: inline-block;
        vertical-align: middle;
        line-height: 20px;
        margin-top: -2px;
        img {
          width: 8px;
          height: 8px;
          display: inline-block;
          vertical-align: top;
          margin: 6px 2px 6px 0;
        }
        label {
          display: inline-block;
          vertical-align: top;
          height: 16px;
          font-size: 12px;
          font-weight: @font-weight-normal;
          color: #ffffff;
          line-height: 16px;
          margin: 2px 0 2px 0;
        }
        &.subscribe {
          background: @tag-subscribe;
        }
        &.live {
          background: @tag-live;
        }
        &.end {
          background: @tag-end;
        }
        &.playback {
          background: @tag-playback;
        }
        &.demand {
          background: @tag-demand;
        }
      }
      .header-content__delay-icon {
        height: 28px;
        margin-left: 4px;
        display: inline-block;
        vertical-align: bottom;
        img {
          display: inline-block;
          width: 100%;
          height: 28px;
        }
      }
      .header-content__time {
        font-size: 14px;
        font-weight: @font-weight-normal;
        color: @font-dark-low;
        line-height: 20px;
      }
    }
    &__main-wrap {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      width: calc(100% - 144px);
      margin: 20px 72px 0 72px;
      background: #ffffff;
      min-height: 485px;
      height: calc(100% - 151px);
      border-radius: 4px;
      &__img {
        width: calc(100% - 360px);
        height: 100%;
        img {
          width: 100%;
          height: 100%;
          border-radius: 4px 0 0 4px;
          display: none;
        }
      }
      &__img-show {
        img {
          display: block;
        }
      }
      &__form {
        width: 360px;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        .password-login-form {
          .el-form-item__content .el-input__inner {
            border-radius: 20px;
            width: 260px;
            padding: 0 12px;
            color: #1a1a1a;
          }
          .el-form-item__content.el-form-item {
            margin-bottom: 16px;
            &.main-wrap__form__item-error-msg {
              margin-bottom: 24px;
            }
          }
        }
        .main-wrap__form__avatar {
          display: block;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          margin: 104px auto 24px auto;
          position: relative;
          img {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 60px;
          }
        }
        .main-wrap__form__allow-upload {
          &:hover {
            cursor: pointer;
          }
        }
        .main-wrap__form__avatar-btn {
          display: block;
          position: absolute;
          bottom: 0;
          width: 60px;
          height: 30px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 0 0 60px 60px;
          text-align: center;
          line-height: 30px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #ffffff;
        }
        .main-wrap__form__avatar-uploader {
          display: none;
        }
        .main-wrap__form__item-error-msg {
        }
        .main-wrap__form__margin-bottom-zero {
          margin-bottom: 0;
        }

        .main-wrap__form__inner {
          margin-bottom: 0;
          margin-top: 24px;
        }

        button.el-button.main-wrap__form__red-button {
          background: #fb3a32;
          color: #ffffff;
          border: 1px solid #fb3a32;
          &:hover {
            color: #fff;
            background: #fc615b;
            border: 1px solid #fc615b;
          }
          &:focus {
            color: #fff;
            background: #fb3a32;
            border: 1px solid #fb3a32;
          }
          &:active {
            background: #e2332c;
            border: 1px solid #e2332c;
          }
          &.is-disabled {
            background: #f09d99;
            border: 1px solid #f09d99;
            cursor: not-allowed;
            color: #fff;
            &:hover,
            &:focus,
            &:active {
              background: #f09d99;
              border: 1px solid #f09d99;
            }
          }
        }
        .length-max {
          width: 100%;
          height: 40px;
          border-radius: 20px;
        }
        .main-wrap__form__copyright {
          font-size: 12px;
          font-weight: 400;
          color: #999999;
          line-height: 17px;
          margin-top: auto;
          margin-bottom: 20px;
        }
      }
    }
    &__no-auth {
      position: fixed;
      left: 50%;
      top: 50%;
      width: 500px;
      margin-left: -250px;
      margin-top: -36px;
      color: #1a1a1a;
      font-size: 9px;
      font-family: 'Microsoft Yahei';
      text-align: center;
    }
  }
</style>
