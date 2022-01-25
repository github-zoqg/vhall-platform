// import { mapState, mapMutations } from 'vuex';
import Upload from '../components/upload/upload.vue';
// import { JSEncrypt } from 'jsencrypt'
import PwdInput from '../components/password/pwd-input.vue';
import { useUserServer } from 'middle-domain';
export default {
  name: 'VmpUserAccount',
  components: {
    Upload,
    PwdInput
  },
  data() {
    return {
      dialogVisible: true,
      accountVo: {
        nick_name: '', // 昵称
        avatar: '', // 头像
        phone: '', // 手机号
        has_password: '' // 是否设置密码
      },
      isNickNameEdit: false,
      nickName: '',
      nickError: '',
      avatar: '',
      domain_url: '',

      Weixin: null,
      QQ: null,
      useUserServer: null
    };
  },
  created() {
    this.useUserServer = useUserServer();
  },
  computed: {
    // ...mapState('watchBase', ['toolsCount', 'languages'])
  },
  methods: {
    // ...mapMutations('watchBase', ['setLoginToken', 'setUserInfo', 'setIsLogin']),
    handleUploadSuccess(res, file) {
      console.log(res, file);
      if (res.data) {
        const domain_url = res.data.domain_url || '';
        const file_url = res.data.file_url || '';
        this.avatar = file_url;
        this.domain_url = domain_url;
        // 发送保存头像接口
        this.changeAvatarSend(this.$parseURL(this.avatar).path);
      }
    },
    beforeUploadHandler(file) {
      console.log(file);
      const typeList = ['png', 'jpeg', 'gif', 'bmp'];
      console.log(file.type.toLowerCase());
      const typeArr = file.type.toLowerCase().split('/');
      const isType = typeList.includes(typeArr[typeArr.length - 1]);
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isType) {
        this.$message({
          message: this.$t('account.account_1044', { n: typeList.join('、') }),
          showClose: true,
          // duration: 0,
          type: 'error',
          customClass: 'zdy-info-box'
        });
        return false;
      }
      if (!isLt2M) {
        this.$message({
          message: this.$t('account.account_1045'),
          showClose: true,
          // duration: 0,
          type: 'error',
          customClass: 'zdy-info-box'
        });
        return false;
      }
      return isType && isLt2M;
    },
    uploadProcess(event, file, fileList) {
      console.log('uploadProcess', event, file, fileList);
    },
    uploadError(err, file, fileList) {
      console.log('uploadError', err, file, fileList);
      this.$message({
        message: this.$t('account.account_1046'),
        showClose: true,
        // duration: 0,
        type: 'error',
        customClass: 'zdy-info-box'
      });
    },
    uploadPreview(file) {
      console.log('uploadPreview', file);
    },
    delAvatarHandler() {
      this.avatar = '';
      this.domain_url = '';
      this.changeAvatarSend('');
    },
    changeAvatarSend(avatar) {
      // 发送保存头像接口
      this.$vhallapi.nav
        .editUser({
          avatar: avatar
        })
        .then(res => {
          if (res && res.code == 200) {
            this.$message({
              message: this.$t('account.account_1047'),
              showClose: true,
              // duration: 0,
              type: 'success',
              customClass: 'zdy-info-box'
            });
            // 用户信息接口更新
            this.initComp(1);
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg || this.$t('account.account_1048'),
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          }
        })
        .catch(res => {
          this.$message({
            message: this.$tec(res.code) || res.msg || this.$t('account.account_1048'),
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        });
    },
    initComp(type) {
      this.getUserInfo(type);
    },
    getUserInfo(type) {
      this.$vhallapi.nav
        .getInfo({
          scene_id: 2
        })
        .then(res => {
          if (res && res.code == 200) {
            // this.setUserInfo(res.data); TODO
            this.accountVo = res.data;
            // 设置用户昵称
            this.nickName = res.data.nick_name;
            if (type === 2) {
              // 昵称修改成功调用
              // this.$VhallEventBus.$emit(this.$VhallEventType.Chat.CHAT_NICKNAME_CHANGE, res.data.nick_name)
            }
            // QQ信息
            const QQ = res.data.user_thirds.filter(item => item.type === 2);
            if (QQ && QQ.length > 0) {
              this.QQ = QQ[0];
            } else {
              this.QQ = {};
            }
            // 微信信息
            const Weixin = res.data.user_thirds.filter(item => item.type === 3);
            if (Weixin && Weixin.length > 0) {
              this.Weixin = Weixin[0];
            } else {
              this.Weixin = {};
            }
            // 用户头像
            this.avatar = res.data.avatar;
            if (type === 1) {
              // 头像修改成功调用
              // this.$VhallEventBus.$emit(this.$VhallEventType.Chat.CHAT_AVATAR_CHANGE, res.data.avatar)
            }
            this.domain_url = res.data.avatar;
          } else {
            // this.setUserInfo(null); TODO
          }
        })
        .catch(e => {
          console.log(e);
          // this.setUserInfo(null); TODO
        });
    },
    // 设置手机号 or 修改手机号
    openPhoneDialog() {
      const that = this;
      if (this.accountVo && this.accountVo.phone) {
        // 当前为修改手机号
        this.phoneDialog.visible = true;
        this.phoneDialog.type = 'edit';
        this.phoneDialog.step = 1;
        // 错误信息清空，验证码和图片验证码清空，短信验证码状态还原
        this.phoneCaptVo.eMsg_edit_1 = false;
        this.checkForm.code = '';
        this.checkForm.imgCode = '';
        if (this.phoneCaptVo.timeInterval_edit_1) {
          clearInterval(this.phoneCaptVo.timeInterval_edit_1);
          this.phoneCaptVo.timeInterval_edit_1 = null;
        }
        this.phoneCaptVo.btnCtrl_edit_1 = 'disabled';
        this.phoneCaptVo.sendCode_edit_1 = false;
        this.phoneCaptVo.time_edit_1 = 60;
        // 若是修改手机号，表单初始值设定
        this.checkForm.phone = this.accountVo.phone;
        // 初始化网易云盾-图片验证码
        const tempTimer = setTimeout(function () {
          clearTimeout(tempTimer);
          that.$nextTick(() => {
            that.callCaptcha('checkForm');
          });
        }, 300);
      } else {
        // 当前为设置手机号
        this.phoneDialog.visible = true;
        this.phoneDialog.type = 'add';
        this.phoneDialog.step = 1;
        // 初始化网易云盾-图片验证码
        this.$nextTick(() => {
          this.callCaptcha('setPhoneForm');
        });
      }
    },
    // 切换昵称为 可修改状态
    changeNickEditStatus() {
      this.isNickNameEdit = true;
      this.nickName = this.accountVo.nick_name;
    },
    // 设置昵称 or 修改昵称
    editNickHandler() {
      if (!this.nickName) {
        this.nickError = this.$t('account.account_1055');
      } else {
        if (this.nickName.length < 1 || this.nickName.length > 30) {
          this.nickError = this.$t('account.account_1056');
        } else {
          this.nickError = '';
          this.$vhallapi.nav
            .editUser({
              nick_name: this.nickName
            })
            .then(res => {
              if (res && res.code == 200) {
                this.$message({
                  message: this.$t('account.account_1057'),
                  showClose: true,
                  // duration: 0,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
                // 触发保存接口
                this.isNickNameEdit = false;
                // 用户信息接口更新
                this.initComp(2);
              } else {
                this.$message({
                  message: this.$tec(res.code) || res.msg || this.$t('account.account_1058'),
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }
            })
            .catch(res => {
              this.$message({
                message: this.$tec(res.code) || res.msg || this.$t('account.account_1058'),
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
        }
      }
    },
    // 设置密码 or 修改密码
    openPwdHandler() {
      if (this.accountVo && this.accountVo.has_password > 0) {
        // 当前为修改密码
        this.pwdDialog.visible = true;
        this.pwdDialog.type = 'edit';
      } else {
        // 当前为设置密码
        this.pwdDialog.visible = true;
        this.pwdDialog.type = 'add';
      }
    },
    // QQ绑定 or QQ解绑
    editQQHandler() {
      if (this.QQ && this.QQ.nick_name) {
        // 解绑
        this.$confirm(this.$t('account.account_1060'), this.$t('account.account_1061'), {
          confirmButtonText: this.$t('account.account_1062'),
          cancelButtonText: this.$t('account.account_1063'),
          customClass: 'zdy-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            // 1微博 2QQ 3微信 4 阿里 5 SDK打赏生的用户6小程序观看端
            this.unBindSend(2);
          })
          .catch(() => {});
      } else {
        // 绑定
        this.$VhallStorage.set('tag', 'bindQQ', 'local');
        window.open(
          `${process.env.VUE_APP_BIND_BASE_URL}/v3/commons/auth/qq?jump_url=${encodeURIComponent(
            this.$VhallStorage.get('goHref', 'local')
          )}`,
          '_blank'
        );
      }
    },
    unBindSend(type) {
      this.$vhallapi.nav
        .unBindInfo({
          type: type
        })
        .then(res => {
          if (res && res.code == 200) {
            this.$message({
              message: this.$t('account.account_1064'),
              showClose: true,
              // duration: 0,
              type: 'success',
              customClass: 'zdy-info-box'
            });
            // 解绑成功后，刷新页面
            // window.location.reload()
            this.initComp();
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg || this.$t('account.account_1065'),
              showClose: true,
              // duration: 0,
              type: 'success',
              customClass: 'zdy-info-box'
            });
            this.initComp();
          }
        })
        .catch(res => {
          this.$message({
            message: this.$tec(res.code) || res.msg || this.$t('account.account_1065'),
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        });
    },
    // 微信绑定 or 微信解绑
    editWXHandler() {
      if (this.Weixin && this.Weixin.nick_name) {
        // 解绑
        this.$confirm(this.$t('account.account_1066'), this.$t('account.account_1061'), {
          confirmButtonText: this.$t('account.account_1062'),
          cancelButtonText: this.$t('account.account_1063'),
          customClass: 'zdy-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            this.unBindSend(3);
          })
          .catch(() => {});
      } else {
        // 绑定
        this.$VhallStorage.set('tag', 'bindWx', 'local');
        const hostPath = process.env.VUE_APP_BIND_BASE_URL + process.env.VUE_APP_WEB_KEY;
        // 前端回传地址
        const jumpUrlPath = `${window.location.origin}${process.env.VUE_APP_ROUTE_BASE}/lives/watch/${this.$route.params.il_id}`;
        window.open(
          `${hostPath}/commons/auth/weixin?source=pc&jump_url=${encodeURIComponent(jumpUrlPath)}`
        );
        // window.open(`${process.env.VUE_APP_BIND_BASE_URL}/v3/commons/auth/weixin?source=pc&jump_url=${encodeURIComponent(this.$VhallStorage.get('goHref', 'local'))}`, '_blank');
      }
    }
  },
  filters: {
    splitLenStr: function (name, len) {
      return name && name.length > len ? name.substring(0, len) + '...' : name;
    }
  }
};
