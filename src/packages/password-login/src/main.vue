<template>
  <div class="vmp-password-login">
    <template v-if="!isMobile">
      <!--头部-->
      <div class="vmp-password-login__header-wrap">
        <div class="vmp-password-login__header-content">
          <!-- 活动-标题、状态、主办方、时间-->
          <div class="header-content__title-wrap">
            <div class="header-content__title">
              <span>{{ (webinarInfo.subject || '') | overHidden(40) }}</span>
              <p
                v-if="webinarInfo && webinarInfo.subject && webinarInfo.subject.length > 40"
                class="header-content__title_hover"
              >
                {{ webinarInfo.subject }}
              </p>
            </div>
            <!-- 预告 -->
            <span
              v-show="[2, '2'].includes(webinarInfo.webinar_state)"
              class="header-content__tag subscribe"
            >
              <label>
                {{ $t('预告')
                }}{{
                  [5, '5'].includes(webinarInfo.webinar_type)
                    ? ` | ${$t('common.common_1022')}`
                    : ''
                }}
              </label>
            </span>
            <!-- 直播 -->
            <span
              v-show="[1, '1'].includes(webinarInfo.webinar_state)"
              class="header-content__tag live"
            >
              <img src="./img/live-white.gif" alt="" />
              <label>
                {{ $t('直播')
                }}{{
                  [5, '5'].includes(webinarInfo.webinar_type)
                    ? ` | ${$t('common.common_1022')}`
                    : ''
                }}
              </label>
            </span>
            <!-- 结束 -->
            <span
              v-show="[3, '3'].includes(webinarInfo.webinar_state)"
              class="header-content__tag end"
            >
              <label>
                {{ $t('结束')
                }}{{
                  [5, '5'].includes(webinarInfo.webinar_type)
                    ? ` | ${$t('common.common_1022')}`
                    : ''
                }}
              </label>
            </span>
            <!-- 回放 -->
            <span
              v-show="[5, '5'].includes(webinarInfo.webinar_state)"
              class="header-content__tag playback"
            >
              <label>
                {{ $t('回放')
                }}{{
                  [5, '5'].includes(webinarInfo.webinar_type)
                    ? ` | ${$t('common.common_1022')}`
                    : ''
                }}
              </label>
            </span>
            <!-- 点播 -->
            <span
              v-show="[4, '4'].includes(webinarInfo.webinar_state)"
              class="header-content__tag demand"
            >
              <label>
                {{ $t('点播')
                }}{{ webinarInfo.webinar_type == 5 ? ` | ${$t('common.common_1022')}` : '' }}
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
          <img v-else src="./img/code-login__img.png" alt="背景图" />
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
            <img :src="defaultAvatar" alt="默认头像" v-else />
            <div class="main-wrap__form__avatar-btn" v-if="![1, '1'].includes(roleName)">
              <span>{{ $t('account.account_1008') }}</span>
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
            :disabled="formDisable"
          >
            <el-form-item
              v-if="!isHost"
              prop="nickname"
              :class="[{ 'main-wrap__form__item-error-msg': nameErrorShow }]"
            >
              <el-input
                v-model.trim="loginForm.nickname"
                :placeholder="$t('form.form_1001')"
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
            <div v-if="formDisable" class="password_err_tip">您已输入错误5次，请15分钟后重试</div>
            <el-form-item class="main-wrap__form__inner">
              <el-button class="main-wrap__form__red-button length-max" @click="handleEntryLive">
                {{ $t('webinar.webinar_1023') }}
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
      <div class="vmp-password-login__no-auth">{{ $t('webinar.webinar_1016') }}</div>
    </template>
  </div>
</template>

<script>
  import { uuid } from '@/app-shared/utils/tool';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import { useRoomBaseServer, useKeyLoginServer } from 'middle-domain';
  export default {
    name: 'VmpPasswordLogin',
    data() {
      return {
        //默认头像
        defaultAvatar: defaultAvatar,
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
        //灰度id
        grayId: '',
        //无延迟图标的地址(注意这是生产环境地址，测试环境地址是阿里的)
        noDelayIconUrl: `//cnstatic01.e.vhall.com/common-static/images/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png`,
        //上传图片地址
        actionUrl: `${process.env.VUE_APP_BASE_URL}/v3/commons/upload/index`,
        err_num: 0,
        errNumTimer: null,
        formDisable: false
      };
    },
    computed: {
      //编辑头像的请求头
      uploadHeader() {
        return { platform: 17, 'request-id': uuid(), 'gray-id': this.grayId };
      },
      //图片保存的路径
      pathUrl() {
        return `webinars/join-avatar/${dayjs().format('YYYYMM')}`;
      }
    },
    beforeCreate() {
      this.keyLoginServer = useKeyLoginServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      this.checkIsMobile();
      //窗口大小变更监听
      window.addEventListener('resize', this.checkIsMobile, false);
      this.checkIsHost();
      this.grayId = sessionStorage.getItem('initGrayId') || '';
      this.getWebinarInfo();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.checkIsMobile, false);
    },
    mounted() {
      // 初始化本地缓存
      if (!sessionStorage.getItem('invite_password')) {
        let arr = [];
        arr.push({
          webinar_id: this.$route.params.id,
          err_num: 0
        });
        sessionStorage.setItem('invite_password', JSON.stringify(arr));
      }
      console.log(JSON.parse(sessionStorage.getItem('invite_password')), 'obj');
      // 获取本活动错误次数
      let obj = JSON.parse(sessionStorage.getItem('invite_password')).find(
        item => item.webinar_id == this.$route.params.id
      );
      this.err_num = obj.err_num;
    },
    methods: {
      //获取活动信息
      getWebinarInfo() {
        const params = {
          webinar_id: this.$route.params.id,
          is_no_check: 1
        };
        return this.roomBaseServer
          .getWebinarInfo(params)
          .then(res => {
            const { code = '', data = {}, msg = '' } = res || {};
            if ([200, '200'].includes(code)) {
              this.webinarInfo = data;
              this.showDelay = [1, '1'].includes(data.no_delay_webinar);
              return this.getConfigList(data.user_id);
            } else {
              this.$message.error(msg);
            }
          })
          .catch(error => {
            let { msg = '活动信息获取失败' } = error || {};
            this.$message.error(msg);
          });
      },
      //获取配置信息
      getConfigList(id) {
        const params = {
          webinar_id: this.$route.params.id,
          webinar_user_id: id,
          scene_id: 1
        };
        return this.keyLoginServer.getConfigList(params).then(res => {
          if ([200, '200'].includes(res.code) && res.data && res.data.permissions) {
            let configList = JSON.parse(res.data.permissions);
            this.hasDelayPermission = configList['no.delay.webinar'];
          }
        });
      },
      //检查是否是手机端
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
      handleEntryLive() {
        const _this = this;
        this.$refs.loginForm.validate(valid => {
          valid && _this.handleLogin();
        });
      },
      //处理登录
      handleLogin() {
        const params = this.handleRoleLoginParams();
        this.keyLoginServer
          .roleLogin(params)
          .then(res => {
            const { code = '', msg = '' } = res || {};
            if ([200, '200'].includes(code)) {
              sessionStorage.setItem('interact_token', res.data.live_token);
              localStorage.setItem('visitorId', res.data.visitor_id);
              this.handleJump(params.type, res.data.live_token, res.data.visitor_id);
            } else {
              this.$message.error(msg);
              clearTimeout(this.errNumTimer);
              // 获取本场活动数据
              let errNumSession = JSON.parse(sessionStorage.getItem('invite_password'));
              let obj = errNumSession.find(item => item.webinar_id == this.$route.params.id);
              obj.err_num = ++this.err_num;
              console.log(this.err_num, errNumSession, 'errNumSession');
              sessionStorage.setItem('invite_password', JSON.stringify(errNumSession));
              // 5秒后清除累计错误次数
              this.errNumTimer = setTimeout(() => {
                obj.err_num = this.err_num = 0;
                sessionStorage.setItem('invite_password', JSON.stringify(errNumSession));
              }, 1000 * 60 * 5);
              // 如果错误5次 禁用表单15分钟
              if (this.err_num == 5) {
                this.formDisable = true;
                setTimeout(() => {
                  this.formDisable = false;
                }, 1000 * 60 * 15);
              }
            }
            return res;
          })
          .catch(error => {
            this.$message.error(error.msg || '口令登录失败');
          });
      },
      //处理口令登录参数
      handleRoleLoginParams() {
        const visitorId = localStorage.getItem('visitorId');
        let params = {
          webinar_id: this.$route.params.id,
          refer: '',
          // 1主持人 2嘉宾 3助理
          type: '',
          visitor_id: !['', null, void 0].includes(visitorId) ? visitorId : '',
          avatar: this.imgUrl || '',
          ...this.loginForm
        };

        //转换角色
        if ([1, '1'].includes(this.$route.params.role_name)) {
          params.type = 1;
        }
        if (![1, '1'].includes(this.$route.params.role_name)) {
          params.type = [4, '4'].includes(this.$route.params.role_name) ? 2 : 3;
        }
        return params;
      },
      //处理登录成功跳转
      handleJump(role = '', token = '', visitorId = '') {
        const _this = this;
        setTimeout(() => {
          if ([3, '3'].includes(role)) {
            _this.$router.push({
              name: 'LiveRoom',
              params: { id: _this.$route.params.id },
              query: { liveT: token }
            });
            return;
          }

          if ([1, '1'].includes(role) && _this.webinarInfo.webinar_type == 1) {
            _this.$router.push({
              name: 'LiveRoom',
              params: { id: _this.$route.params.id },
              query: { liveT: token }
            });
            return;
          }
          window.location.href = `//${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_ROUTER_BASE_URL}/chooseWay/${_this.$route.params.id}/${role}?type=code&liveT=${token}`;
        }, 300);
      },
      //上传图片
      uploadAvatar() {
        // 非主持人角色时，可上传头像
        if (![1, '1'].includes(this.$route.params.role_name)) {
          const uploadBtn = document.getElementById('uploadBtn');
          uploadBtn.click();
        }
      },
      //上传头像成功
      uploadSuccess(res) {
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
          this.$message.error(`仅支持 ${typeList.join('、')} 格式`);
          return false;
        }
        if (!isLt2M) {
          this.$message.error('图片大小超过1M');
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
        this.$message.error('图片上传失败');
      },
      uploadPreview(file) {
        console.log('图片预览', file);
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
    @tag-end: #666;
    @tag-playback: #14ba6a;
    @tag-demand: #fa9a32;
    @font-color-icon: #cccccc; /* 图标 */
    @font-color-icon-hover: #fb3a32; /* 图标悬浮 */
    @font-user-icon: #666;
    @font-user-icon-hover: #1a1a1a;
    @font-dark-low: #999;
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
          color: #fff;
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
      background: #fff;
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
          .password_err_tip {
            color: #f56c6c;
            font-size: 12px;
            position: absolute;
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
          color: #fff;
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
          color: #fff;
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
          color: #999;
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
