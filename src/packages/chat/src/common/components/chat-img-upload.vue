<template>
  <div class="vmp-chat-img-upload-container">
    <el-upload
      v-if="![2, '2'].includes(roleName)"
      class="vmp-chat-img-upload"
      :headers="headersVo"
      :action="action"
      :show-file-list="false"
      name="resfile"
      :before-upload="beforeUpload"
      :data="{
        path: `${roomId}/img`,
        type: 'image',
        interact_token: interact_token
      }"
      accept=".jpg, .jpeg, .png, .bmp"
      :on-success="uploadSuccess"
      :on-error="uploadError"
    >
      <i :class="['vh-iconfont', 'vh-line-picture-outline', uploadActive ? 'active' : '']"></i>
    </el-upload>
    <!-- 上传图片预览 -->
    <div v-show="uploadActive" class="vmp-chat-img-preview-wrap">
      <div class="vmp-chat-img-preview" v-for="(url, index) in imgUrls" :key="index">
        <img
          width="100%"
          height="100%"
          :src="url + '?x-oss-process=image/resize,m_lfit,h_34,w_34'"
          alt
        />
        <i class="vmp-chat-img-preview-close" @click="deleteImg(index)"></i>
      </div>
    </div>
  </div>
</template>

<script>
  import { uuid } from '@/app-shared/utils/tool';
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpChatImgUpload',
    props: {
      //房间号
      roomId: {
        type: [Number, String],
        default: ''
      },
      //用户身份
      roleName: {
        type: [Number, String],
        default: ''
      },
      //是否被禁言
      disable: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        //图片地址列表
        imgUrls: [],
        //上传图片请求的token
        headToken: localStorage.getItem('token') || '',
        interact_token: '',
        //上传图片地址
        action: `${process.env.VUE_APP_BASE_URL}/v3/commons/upload/index`
      };
    },
    computed: {
      headersVo: function () {
        const vo = { token: this.headToken, platform: 7, 'request-id': uuid() };
        // 获取参数
        const wIdIndex0 = location.href.lastIndexOf('/');
        const wIdIndex1 = location.href.lastIndexOf('?');
        const wId = location.href.substring(
          wIdIndex0 + 1,
          wIdIndex1 > 0 ? wIdIndex1 : location.href.length
        );
        if (sessionStorage.getItem(`V3_WAP_US_${wId}`)) {
          vo['gray-id'] = sessionStorage.getItem(`V3_WAP_US_${wId}`);
        }
        return vo;
      },
      //是否已有上传图片
      uploadActive() {
        return this.imgUrls.length;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    mounted() {
      this.initViewData();
    },
    methods: {
      //初始化视图数据
      initViewData() {
        const { state = {} } = this.roomBaseServer;
        this.interact_token = state.watchInitData.interact.interact_token || '';
      },
      //上传图片前置处理
      beforeUpload() {
        if (this.disable) {
          this.$message.error(this.$t('chat.chat_1006'));
          return false;
        }
        if (this.uploadActive >= 4) {
          this.$message.error('一次最多上传4张图片');
          return false;
        }
        return true;
      },
      //上传图片成功
      uploadSuccess(res) {
        if (!['200', 200].includes(res.code)) {
          return this.$message.warning(res.msg);
        }
        this.imgUrls.push(res.data.domain_url);
      },
      //上传聊天图片失败
      uploadError(err) {
        console.error('======上传聊天图片失败======', err);
      },
      //删除图片
      deleteImg(index) {
        this.imgUrls.splice(index, 1);
      },
      //获取上传成功的图片
      getImgUrls() {
        return this.imgUrls;
      },
      //清空上传成功的图片
      clearImgUrls() {
        this.imgUrls = [];
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-img-upload-container {
    @active-color: #fb3a32;
    .iconfont {
      color: #999;
      font-size: 19px;
      cursor: pointer;
      &.active {
        color: @active-color;
      }
      &:hover {
        color: @active-color;
        cursor: pointer;
      }
      &.vh-line-picture-outline {
        font-size: 18px;
      }
    }
    .vmp-chat-img-preview-wrap {
      padding: 8px;
      background: #3f3f3f;
      position: absolute;
      top: -60px;
      left: 5%;
      box-sizing: border-box;
      .vmp-chat-img-preview {
        float: left;
        width: 34px;
        height: 34px;
        margin-right: 8px;
        position: relative;
        box-sizing: border-box;
        cursor: pointer;
        &-close {
          position: absolute;
          width: 15px;
          height: 15px;
          background: url('../img/img-del.png') no-repeat;
          background-size: contain;
          top: 0;
          right: 0;
          display: none;
        }
        & > img {
          display: block;
        }
        &:last-child {
          margin-right: 0;
        }
        &:hover {
          border: 1px solid @active-color;
          .vmp-chat-img-preview-close {
            display: block;
          }
        }
      }
    }
  }
</style>
