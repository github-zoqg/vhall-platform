<template>
  <div class="vmp-live-private-chat">
    <el-dialog
      :title="title"
      :visible.sync="visible"
      width="740px"
      custom-class="vmp-live-private-chat"
    >
      <div class="vmp-live-private-chat__wrap" @click="boxClick">
        <ul class="wrap__left">
          <li
            class="wrap__left-item"
            v-for="(group, index) in chatGroupList"
            :class="{ active: activeGroupIndex === index }"
            @click="selectGroup(index)"
            :key="group.id"
          >
            <em class="wrap__left-item__news-chat" v-if="group.news"></em>
            <span class="wrap__left-item__group-avatar_img">
              <img :src="group.avatar || defaultAvatar" alt="" />
            </span>
            <span class="wrap__left-item__group-name">{{ group.nickname }}</span>
            <i
              class="el-icon-circle-close wrap__left-item__close-icon"
              @click.stop="delChatItem(index)"
            ></i>
          </li>
        </ul>
        <div
          class="wrap__right"
          :class="{
            'hide-tip':
              activeGroupIndex !== -1 &&
              chatGroupList[activeGroupIndex] &&
              chatGroupList[activeGroupIndex].type == 2
          }"
        >
          <span class="wrap__right__header" v-if="currentSelectUser">
            提示：如想结束当前聊天，关闭左侧用户窗口即可
          </span>
          <div class="wrap__right__content">
            <chat-list
              @showImg="openImgPreview"
              :role="roleName"
              :webinar-id="webinarId"
              :login-info="loginInfo"
              :select-user-id="currentSelectUser"
              :room-id="roomId"
              ref="chatRef"
            ></chat-list>
          </div>
          <div class="wrap__right__send">
            <!--表情选择-->
            <emoji ref="emoji" class="wrap__right__emoji-box" @emojiInput="emojiInput"></emoji>
            <!--已上传的图片展示-->
            <div class="wrap__right__img-upload-list" v-if="showUploadImg">
              <div
                class="img-upload-item"
                v-for="(imgUrl, keyIdx) in imgList"
                @click="openImgPreview(keyIdx, imgList)"
                :key="keyIdx"
                :style="{
                  backgroundImage: `url(${imgUrl}?x-oss-process=image/resize,m_lfit,w_100${
                    isWebp ? '/format,webp' : ''
                  })`
                }"
              >
                <span class="img-delete" @click.stop="deleteImg(keyIdx)">
                  <i class="el-icon-close"></i>
                </span>
              </div>
              <div
                v-if="imgList.length < 5"
                class="img-upload-item img-upload-add"
                title="上传图片（上限5张）"
                @click="pickLoadImg"
              >
                <i class="el-icon-plus img-upload-icon"></i>
              </div>
            </div>
            <!--     左侧图标       -->
            <div class="wrap__right__send-tool">
              <i
                title="表情"
                class="vh-iconfont vh-line-expression icon-emoji"
                @click.stop="openEmojiModal"
              ></i>
              <!--              <i-->
              <!--                title="上传图片（上限5张）"-->
              <!--                class="vh-iconfont vh-line-illustrations"-->
              <!--                @click="handleUploadImg"-->
              <!--              ></i>-->
            </div>
            <!--聊天内容输入-->
            <!--            <textarea-->
            <!--              class="wrap__right__private-txt"-->
            <!--              :placeholder="inputPlaceholder"-->
            <!--              ref="sendBox"-->
            <!--              v-model="inputText"-->
            <!--              maxlength="200"-->
            <!--              @keydown.prevent.13="sendMessage"-->
            <!--            ></textarea>-->
            <el-input
              class="wrap__right__private-txt"
              type="textarea"
              :placeholder="inputPlaceholder"
              v-model="inputText"
              maxlength="200"
              show-word-limit
              :row="4"
              @keyup.enter.native="sendMessage"
            ></el-input>
            <el-button type="primary" size="small" class="small-button" round @click="sendMessage">
              发送
            </el-button>
          </div>
        </div>
        <img-preview
          ref="imgPreview"
          v-if="imgPreviewVisible"
          :images="previewImgList"
          @closeImgPreview="onClosePreviewImg"
        ></img-preview>
        <com-upload
          accept="png|jpg|jpeg|bmp|gif"
          :actionUrl="actionUrl"
          inputName="resfile"
          :fileSize="10240"
          :multiple="true"
          :totalCount="10"
          ref="uploadImg"
          :ex-params="extraParams"
          @error="handleUploadError"
          @load="handleUploadSuccess"
          style="display: none"
        ></com-upload>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import imgPreview from '@/packages/chat/src/components/img-preview';
  import emoji from '@/packages/chat/src/components/emoji';
  import chatList from './components/chat-list';
  import comUpload from '@/app-shared/components/com-upload';
  import { useChatServer, useRoomBaseServer } from 'middle-domain';
  import defaultAvatar from '@/app-shared/assets/img/my-dark@2x.png';
  export default {
    name: 'VmpLivePrivateChat',
    components: {
      imgPreview,
      comUpload,
      emoji,
      chatList
    },
    data() {
      return {
        //默认头像
        defaultAvatar: defaultAvatar,
        //模态窗是否可见
        visible: false,
        //模态窗标题
        title: '私聊',
        //是否支持webp
        isWebp: window.webp,
        //已经上传的图片
        imgList: [],
        //图片上传地址
        actionUrl: `${process.env.VUE_APP_BASE_URL}/v3/commons/upload/index`,
        //私聊群组列表
        chatGroupList: [],
        //当前选中的私聊群组的index
        activeGroupIndex: -1,
        //聊天输入框的值
        inputText: '',
        //聊天输入框提示文字
        inputPlaceholder: '请输入聊天内容',
        //是否展示图片上传
        showUploadImg: false,
        //上传图片额外参数
        extraParams: {},
        //图片预览弹窗是否可见
        imgPreviewVisible: false,
        //图片预览的列表
        previewImgList: [],
        //当前的用户角色
        roleName: '',

        //当前的登录信息
        loginInfo: {}
      };
    },
    computed: {
      //当前选中的人的id
      currentSelectUser() {
        let userId = '';
        if (this.chatGroupList.length && this.activeGroupIndex >= 0) {
          let temp = this.chatGroupList[this.activeGroupIndex];
          userId = temp.account_id;
        }
        return userId;
      },
      roomId() {
        return this.roomBaseServer.state.watchInitData.interact.room_id;
      },
      //当前的活动id
      webinarId() {
        return this.roomBaseServer.state.watchInitData.webinar.id;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.chatServer = useChatServer();
    },
    mounted() {
      this.initViewData();
      this.listenEvents();
    },
    destroyed() {
      this.chatServer.$off('receivePrivateMsg', this.showTip);
    },
    methods: {
      listenEvents() {
        this.chatServer.$on('receivePrivateMsg', this.showTip);
      },
      showTip(msg) {
        if (msg.sendId != this.currentSelectUser) {
          this.chatGroupList.forEach(item => {
            if (item.account_id == msg.sendId) {
              this.$set(item, 'news', true);
            }
          });
        }
      },
      //打开模态窗
      async openModal() {
        await this.getPrivateContactList();
        this.visible = true;
        this.activeGroupIndex = 0;
      },
      //获取私聊联系人列表
      getPrivateContactList() {
        const params = {
          room_id: this.roomId,
          webinar_id: this.webinarId
        };
        return this.chatServer
          .getPrivateContactList(params)
          .then(res => {
            const { code = '', msg = '', data = {} } = res || {};
            if ([200, '200'].includes(code)) {
              this.chatGroupList = Array.isArray(data.list) ? data.list : [];
            } else {
              this.$message.error(msg);
            }
            return res;
          })
          .catch(error => {
            this.$message.error(error.msg);
          });
      },
      //关闭模态窗
      handleClose() {
        this.visible = false;
      },
      //确认的处理方法
      handleConfirm() {
        this.handleClose();
      },
      //初始化上传图片额外信息
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        const interact_token = interact.interact_token || '';
        this.roleName = join_info.role_name;
        this.loginInfo = join_info;
        console.log(this.loginInfo, '当前的登录信息');
        this.extraParams = {
          path: `${this.roomId}/img`,
          type: 'image',
          interact_token
        };
      },
      //聊天框整体点击处理
      boxClick() {},
      //选中某个群组
      selectGroup(index) {
        this.activeGroupIndex = index;
        this.chatGroupList[index].news = false;
        this.$refs.chatRef.resetData();
        this.$nextTick(() => {
          this.$refs.chatRef.initEvent();
        });
      },
      //新建对话 暴露给问答管理使用的方法（可以是信令或者ref）
      addChatItem(chatItemInfo) {
        const isExit = this.chatGroupList.some((chatItem, index) => {
          if (chatItemInfo.id == chatItem.id) {
            this.selectGroup(index);
            return true;
          } else {
            return false;
          }
        });
        if (!isExit) {
          const { id, chat_name, account_id, avatar } = chatItemInfo;
          this.chatGroupList.push({ id: id, nickname: chat_name, account_id, avatar });
          this.selectGroup(this.chatGroupList.length - 1);
          //将联系人添加到私聊列表存储
          this.chatServer.addToRankList({
            room_id: this.roomId,
            webinar_id: this.webinarId,
            to: id
          });
        }
      },
      setRankList() {},
      //删除某个对话
      delChatItem(index) {
        this.chatGroupList.splice(index, 1);
        this.selectGroup(this.activeGroupIndex - 1);
      },
      //上传图片出错的回调
      handleUploadError(data) {
        this.$message(data.msg || '上传失败，请重试！');
      },
      //上传图片成功的回调
      handleUploadSuccess(data) {
        const fileObj = JSON.parse(data.data).data;
        if (this.imgList.length < 5) {
          this.imgList.push(fileObj.domain_url);
        }
      },
      //打开图片预览
      openImgPreview(index, list = []) {
        //处理掉图片携带的查询参数，只保留主要链接
        this.previewImgList = list.map(item => item.split('?')[0]);
        this.imgPreviewVisible = true;
        this.$nextTick(() => {
          this.$refs.imgPreview.jumpToTargetImg(index);
        });
      },
      //关闭图片预览的回调
      onClosePreviewImg() {
        this.imgPreviewVisible = false;
      },
      //打开表情模态窗
      openEmojiModal() {
        this.$refs.emoji.toggleShow();
      },
      //处理图片上传
      handleUploadImg() {
        this.showUploadImg = !this.showUploadImg;
        //清空已经上传的图片
        this.imgList.length = 0;
      },
      //删除图片
      deleteImg(index) {
        this.imgList.splice(index, 1);
      },
      //选择上传图片
      pickLoadImg() {
        if (this.imgList.length < 5) {
          this.showUploadImg = true;
          this.$refs.uploadImg.$el.click();
        }
      },
      //选中表情
      emojiInput(value) {
        const _this = this;
        this.$nextTick(() => {
          _this.inputText += value;
        });
      },
      //发送消息
      sendMessage() {
        //未选中私聊人员
        if (!this.currentSelectUser) {
          this.$message.warning('请选择私聊人员');
          return;
        }
        //判断是否有输入内容，或者上传图片
        if (
          (!this.inputText || (this.inputText && !this.inputText.trim())) &&
          !this.imgList.length
        ) {
          this.$message.warning('内容不能为空');
          return;
        }

        if (this.inputText.length > 200) {
          this.$message.warning('聊天内容不能超过200个字');
          return;
        }

        const currentMsg = useChatServer().createCurMsg();
        const target = this.chatGroupList[this.activeGroupIndex].account_id;
        currentMsg.setTarget(target);
        //将文本消息加入消息体
        currentMsg.setText(this.inputText);
        //将图片消息加入消息体
        currentMsg.setImage(this.imgList);
        //发送消息
        useChatServer().sendMsg(currentMsg);
        //清除发送后的消息
        useChatServer().clearCurMsg();
        this.imgList.length = 0;
        this.inputText = '';
        this.$refs.chatRef.scrollBottom();
      }
    }
  };
</script>

<style lang="less">
  .vmp-live-private-chat {
    @color-bd: #e2e2e2;
    @color-red: #fb3a32;
    @color-default: #ffd021;
    @color-default-hover: #fdd43f;

    @main-color: #fb3a32;
    .el-dialog__body {
      padding: 0;
    }
    .el-dialog__header {
      position: relative;
      height: 40px;
      padding: 0 20px;
      line-height: 40px;
      border-radius: 4px 4px 0 0;
      background-color: @main-color;
    }
    .el-dialog__title {
      font-size: 16px;
      color: #fff;
    }

    .el-dialog__headerbtn {
      top: 50%;
      right: 15px;
      transform: translateY(-50%);
      .el-dialog__close {
        color: #fff;
      }
    }
    &__wrap {
      display: flex;
      align-items: center;
      height: 480px;
      overflow: hidden;
      .wrap__left {
        height: 100%;
        width: 200px;
        border-right: solid 1px @color-bd;
        overflow: auto;
        user-select: none;
      }
      .wrap__left-item {
        position: relative;
        display: flex;
        align-items: center;
        height: 44px;
        line-height: 44px;
        padding-left: 10px;
        border-bottom: solid 1px @color-bd;
        transition: all 0.2s;
        .vh-iconfont {
          display: none;
          vertical-align: middle;
          font-size: 18px;
          &:hover {
            color: @color-red;
          }
        }
        &__group-avatar_img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 8px;
          img {
            display: block;
            width: 30px;
            height: 30px;
          }
        }
        &__close-icon {
          display: none;
          font-size: 18px;
        }
        &:hover {
          cursor: pointer;
          background-color: #f7f7f7;
          .wrap__left-item__close-icon {
            display: inline-block;
          }
        }
        &.active {
          cursor: pointer;
          background-color: #f7f7f7;
        }
      }

      .wrap__left-item__news-chat {
        display: block;
        content: '';
        position: absolute;
        top: 14px;
        left: 12px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: @color-red;
      }
      .wrap__left-item__group-name {
        width: 130px;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .wrap__right {
        height: 100%;
        width: calc(100% - 180px);
        &.hide-tip {
          .right-header {
            display: none;
          }
          .right-content {
            height: calc(100% - 120px);
          }
        }

        &__header {
          display: block;
          width: 100%;
          height: 40px;
          line-height: 40px;
          background-color: #fffceb;
          color: #666;
          text-align: left;
          padding-left: 16px;
        }
        &__content {
          width: 100%;
          height: calc(100% - 40px - 120px);
          overflow-y: auto;
        }
        &__send {
          position: relative;
          width: 100%;
          height: 120px;
          border-top: 1px solid @color-bd;
        }
        .wrap__right__emoji-box {
          position: absolute;
          top: 0;
          left: 0;
          transform: translate(0, -100%);
          width: 320px;
          height: 290px;
          padding: 12px 10px;
          background-color: #fff;
          box-shadow: 0 0 8px rgba(34, 34, 34, 0.5);
          border-radius: 4px;
          z-index: 2;
        }
        &__send-tool {
          height: 34px;
          line-height: 34px;
          padding-left: 10px;
          .vh-iconfont {
            margin-right: 6px;
            font-size: 18px;
            &:hover {
              cursor: pointer;
              color: @color-red;
            }
          }
        }
        &__private-txt {
          width: 80%;
          padding: 0 10px 0 10px;
          border: none;
          outline: none;
          .el-textarea__inner {
            height: 70px;
            border: none;
          }
        }
        .small-button {
          position: absolute;
          bottom: 16px;
          right: 16px;
        }
        &__img-upload-list {
          display: flex;
          position: absolute;
          top: -64px;
          left: 10px;
          max-width: 312px;
          height: 60px;
          padding-right: 6px;
          border-radius: 4px;
          background-color: #fff;
          font-size: 0;
          cursor: default;
          .img-upload-item {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 48px;
            margin: 6px 0 6px 6px;
            border-radius: 3px;
            vertical-align: middle;
            background: #eee no-repeat 50%;
            background-size: contain;
            cursor: pointer;
            border: solid 1px transparent;
            &:hover {
              .img-delete {
                display: flex;
              }
            }
            .img-delete {
              position: absolute;
              display: none;
              align-items: center;
              justify-content: center;
              top: -10px;
              right: -10px;
              width: 28px;
              height: 28px;
              line-height: 28px;
              text-align: center;
              background-color: #000;
              border-radius: 50%;
              transform: scale(0.5);
              color: #fff;
              i {
                font-size: 16px;
              }
              &:hover {
                background-color: @color-red;
              }
            }
            &.img-upload-add {
              display: flex;
              align-items: center;
              justify-content: center;

              position: relative;
              border: dashed 1px #aaa;
              line-height: 46px;
              text-align: center;
              color: #888;
              background-color: transparent;
              overflow: hidden;

              .img-upload-icon {
                font-size: 20px;
              }

              .com-upload {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
              }
              &:hover {
                color: @color-red;
                border-color: @color-red;
              }
            }
          }
        }
      }
    }
  }
</style>
