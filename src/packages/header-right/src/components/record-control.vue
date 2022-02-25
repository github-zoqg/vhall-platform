<template>
  <div class="vmp-room-record-container">
    <div class="vmp-room-record vmp-room-operation" :class="{ recording: recording }" v-if="living">
      <i class="vh-iconfont vh-full-brush-l"></i>
      {{ statusText }}
    </div>
    <ol class="vmp-record-buttons">
      <li class="vmp-record-button" v-show="!recorded" @click="record">
        <i class="vh-iconfont vh-full-brush-l"></i>
        录制
      </li>
      <li class="vmp-resume-button" v-show="recorded && !paused" @click="pause">
        <i class="vh-iconfont vh-a-line-videopause"></i>
        暂停
      </li>
      <li class="vmp-recover-button" v-show="paused && recorded" @click="reRecord">
        <i class="vh-iconfont vh-full-brush-l"></i>
        恢复
      </li>
      <li class="vmp-stop-button" v-show="recorded && !paused" @click="stop(true)">
        <i class="vh-iconfont vh-line-square"></i>
        停止
      </li>
    </ol>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'RecordControl',
    data() {
      return {
        disabled: true,
        paused: false,
        recorded: false, // 是否开启录制（包括暂停）
        statusText: '录制',
        recording: false // 是否正在录制（不包括暂停）
      };
    },
    computed: {
      living() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      }
    },
    mounted() {
      if (this.$domainStore.state.roomBaseServer.watchInitData.cut_record_status == 2) {
        this.recorded = true;
        this.paused = true;
        this.statusText = '暂停';
        this.recording = false;
      } else if (this.$domainStore.state.roomBaseServer.watchInitData.cut_record_status == 1) {
        this.recorded = true;
        this.statusText = '录制中';
        this.recording = true;
      }
    },
    methods: {
      pause() {
        if (!this.recorded) {
          return;
        }
        this.paused = true;
        this.statusText = '暂停';
        this.recording = false;
        // TODO:数据上报
        // this.$vhall_paas_port({
        //   k: 110002,
        //   data: {
        //     business_uid: this.$parent.third_party_user_id,
        //     user_id: '',
        //     webinar_id: this.$route.params.il_id,
        //     refer: '',
        //     s: '',
        //     report_extra: {},
        //     ref_url: '',
        //     req_url: ''
        //   }
        // });
        console.log(useRoomBaseServer().pauseRecord);
        useRoomBaseServer().pauseRecord();
      },

      record() {
        if (!this.recorded) {
          this.recorded = true;
          this.statusText = '录制中';
          // TODO: 数据上报
          // this.$vhall_paas_port({
          //   k: 110001,
          //   data: {
          //     business_uid: this.$parent.third_party_user_id,
          //     user_id: '',
          //     webinar_id: this.$route.params.il_id,
          //     refer: '',
          //     s: '',
          //     report_extra: {},
          //     ref_url: '',
          //     req_url: ''
          //   }
          // });
          this.recording = true;
          console.log(useRoomBaseServer().startRecord);
          useRoomBaseServer().startRecord();
        }
      },

      stop(mark, isLiveStop) {
        if (!this.recording) return;
        this.recorded = false;
        this.statusText = '录制';
        // TODO: 数据上报
        // this.$vhall_paas_port({
        //   k: 110003,
        //   data: {
        //     business_uid: this.$parent.third_party_user_id,
        //     user_id: '',
        //     webinar_id: this.$route.params.il_id,
        //     refer: '',
        //     s: '',
        //     report_extra: {},
        //     ref_url: '',
        //     req_url: ''
        //   }
        // });
        this.recording = false;
        if (!isLiveStop) {
          // 增加isLiveStop  是否为结束直播导致停止录制    新版这种情况不掉接口
          useRoomBaseServer().endRecord();
        }
        if (mark) {
          this.$message.success('直播结束后，打点录制的直播将自动生成回放');
        }
      },

      reRecord() {
        this.paused = false;
        this.statusText = '录制中';
        this.recording = true;
        useRoomBaseServer().startRecord();
      }
    }
  };
</script>

<style lang="less">
  .vmp-room-record-container {
    height: 100%;
    display: flex;
    align-items: center;
    align-content: center;
    position: relative;
    .vmp-room-record {
      box-sizing: border-box;
      border: 1px solid rgba(151, 151, 151, 1);
      line-height: 24px;
      & > i.vh-full-brush-l {
        font-size: 12px;
        transform: scale(0.6);
        margin-right: 5px;
        vertical-align: middle;
      }
    }
    .vmp-room-operation {
      width: 100px;
      height: 26px;
      border-radius: 100px;
      font-size: 14px;
      text-align: center;
      line-height: 26px;
      color: rgba(255, 255, 255, 1);
      margin-right: 10px;
      padding: 0 10px;
      box-sizing: border-box;
      cursor: pointer;
    }
    .vmp-record-buttons {
      z-index: 3;
      display: none;
      position: absolute;
      top: 45px;
      left: -6px;
      width: 112px;
      background-color: #434343;
      text-align: center;
      padding: 3px 0;
      border-radius: 3px;
      border: 1px solid #2d2d2d;
      overflow: hidden;
      color: #ececec;
      box-sizing: border-box;
      & > li {
        width: 100%;
        height: 32px;
        line-height: 32px;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        box-sizing: border-box;
        vertical-align: middle;
        & > i {
          font-size: 7px;
          transform: scale(0.6);
          margin-right: 11px;
          vertical-align: middle;
        }
        &:hover {
          background-color: #1d1d1d;
        }
      }
    }
    &:hover {
      .vmp-record-buttons {
        display: block;
      }
    }
  }
</style>
