<template>
  <div class="vmp-record-video-success-wrap">
    <div class="vmp-record-video-success" v-if="isRecordVideoSuccess">
      <div v-show="isShowRecordEditor" class="record-video-success__editor">
        <p class="record-video-success__editor-title">录制已结束，给录制内容添加一个标题吧！</p>
        <el-input
          class="record-video-success__editor-input"
          maxlength="100"
          v-model="recordTitleInput"
        ></el-input>
        <p class="record-video-success__editor-describe">*最多可输入100个字符</p>
        <div class="record-video-success__editor-button">
          <el-button @click="save" type="danger" class="record-video-success__editor-save">
            直接保存
          </el-button>
          <el-button @click="goCutting" class="record-video-success__editor-cut">
            前往剪辑
          </el-button>
        </div>
      </div>
      <div v-show="!isShowRecordEditor" class="record-video-success__created">
        <p class="record-video-success__created-box">
          录制已生成，可前往
          <span class="record-video-success__created-btn" @click="goBackRecordList">回放管理</span>
          查看
        </p>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpRecordVideoSuccess',
    data() {
      return {
        isRecordVideoSuccess: false, // 是否录制完成
        isShowRecordEditor: true,
        recordTitleInput: '' // 标题
      };
    },
    computed: {},
    methods: {
      // 展示录制成功页面
      showRecordVideoSuccessComp(id) {
        this._switchId = id;
        this.isRecordVideoSuccess = true;
      },
      // 直接保存
      async save() {
        const roomBaseServer = useRoomBaseServer();
        const res = await roomBaseServer.createRecordInRecord({
          webinar_id: roomBaseServer.state.watchInitData.webinar.id,
          name: this.recordTitleInput,
          switch_id: this._switchId,
          type: 1
        });
        if (res.code == 200) {
          this.isShowRecordEditor = false;
        }
      },
      // 前往剪辑
      goCutting() {
        const { watchInitData } = useRoomBaseServer().state;
        window.location.href = `//${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_ROUTER_BASE_URL}/videoTailoring/${watchInitData.webinar.id}?recordName=${this.recordTitleInput}&isRecordVideo=1&switch_id=${this._switchId}`;
      },
      // 前往回放管理
      goBackRecordList() {
        const { watchInitData } = useRoomBaseServer().state;
        window.location.href = `//${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_ROUTER_BASE_URL}/live/playback/${watchInitData.webinar.id}`;
      }
    }
  };
</script>
<style lang="less">
  .vmp-record-video-success-wrap {
    height: 0;
    width: 0;
    .vmp-record-video-success {
      background-size: 100% 100%;
      background-color: #2d2d2d;
      position: absolute;
      top: 0;
      left: 60px;
      right: 309px;
      bottom: 0;
      width: calc(100% - 370px);
      z-index: 3;
    }
    .record-video-success__created {
      width: 500px;
      height: 500px;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      margin: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 2;
      .record-video-success__created-box {
        font-size: 24px;
        color: #fff;
        width: 100%;
        text-align: center;
        .record-video-success__created-btn {
          cursor: pointer;
          color: #cc0000;
        }
      }
    }
    .record-video-success__editor {
      width: 500px;
      height: 500px;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      margin: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 2;
      &-title {
        width: 100%;
        text-align: center;
        color: #fff;
        font-size: 24px;
      }
      &-input {
        width: 320px;
        text-align: center;
        height: 45px;
        margin-top: 15px;
        .el-input__inner {
          height: 40px;
          background: #ffffff;
          box-sizing: border-box;
        }
      }

      &-describe {
        font-size: 14px;
        color: #ff0000;
        width: 100%;
        padding-left: 200px;
      }

      &-button {
        width: 100%;
        text-align: center;
        margin-top: 20px;
      }
      &-save {
        width: 124px;
        height: 40px;
        margin-right: 24px;
        background: #f34b46;
        color: #ffffff;
        line-height: 1;
        padding: 12px 20px;
        border: 1px solid #f56c6c;
      }

      &-cut {
        width: 124px;
        height: 40px;
        margin-right: 24px;
        line-height: 1;
        padding: 12px 20px;
      }
    }
  }
</style>
