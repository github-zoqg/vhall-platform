<template>
  <div class="vmp-rebroadcast">
    <main class="vmp-rebroadcast-body">
      <!-- 控制面板 -->
      <section class="vmp-rebroadcast-control-panel" v-loading="loading">
        <!-- 搜索区域 -->
        <header class="vmp-rebroadcast-search">
          <span class="my-live">我的直播</span>
          <el-button type="mini" round @click="getList">刷新</el-button>
          <el-input
            style="margin-left: 6px; width: 185px; border-radius: 20px"
            round
            v-model="inputVal"
            class="go-search"
            placeholder="请输入直播标题"
            clearable
            @keyup.enter.native="getList"
            @change="getList"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" @click="getList"></i>
          </el-input>
        </header>

        <!-- 列表区域 -->
        <main class="vmp-rebroadcast-control-panel">
          <section>
            <ul>
              <li
                class="vmp-rebroadcast-item"
                v-for="item in domainState.list"
                :key="item.id"
                @click="select(item.room_id, item.id)"
              >
                <i class="right-tag" v-show="item.is_stream == 1">转播中</i>
                <section class="item-logo">
                  <img :src="item.img_url || nologoImg" alt="" />
                  <i>直播</i>
                </section>
                <section class="item-content">
                  <p class="broadcast-title">{{ item.subject }}</p>
                  <p class="broadcast-time">{{ item.start_time }}</p>
                </section>
              </li>
            </ul>
            <section v-if="domainState.list.length === 0" class="vmp-search-result">
              <section>
                <img :src="tipsImg" alt="" />
                <p>{{ tipsText }}</p>
              </section>
            </section>
          </section>
        </main>
      </section>

      <section class="vmp-rebroadcast-preview-panel">
        <header class="vmp-rebroadcast-preview-title">预览</header>
        <main>
          <section v-if="isPreviewVisible">
            <video-preview ref="videoPreview" :videoParam="videoParam" />
          </section>
          <button @click="startRebroadcast">开始直播</button>
          <button @click="stopRebroadcast">结束转播</button>
        </main>
      </section>
    </main>
  </div>
</template>
<script>
  import { useRoomBaseServer, useRebroadcastServer } from 'middle-domain';
  import { sleep } from '@/packages/app-shared/utils/tool';
  import VideoPreview from '@/packages/app-shared/components/video-preview';

  import NoCreateImg from './images/no-create@2x.png';
  import NoSearchImg from './images/no-search@2x.png';
  export default {
    name: 'VmpRebroadcastContent',
    components: { VideoPreview },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.rebroadcastServer = useRebroadcastServer();
    },
    data() {
      return {
        current: '',
        inputVal: '',
        loading: false,
        previewLoading: false,
        list: [],
        domainState: this.rebroadcastServer.state,
        nologoImg: '//t-alistatic01.e.vhall.com/static/img/video_default_nologo.png',
        pushStreamSeperately: false,
        isPreviewVisible: false,
        videoParam: {}
      };
    },
    computed: {
      tipsImg() {
        if (this.inputVal) return NoSearchImg;
        return NoCreateImg;
      },
      tipsText() {
        if (this.inputVal) return this.$t('webinar.webinar_1042');
        return `暂无可转播直播`;
      }
    },
    created() {
      this.open();
    },
    methods: {
      open() {
        this.getList();
      },
      /**
       * 获取(更新)转播列表
       */
      async getList() {
        this.loading = true;
        await this.rebroadcastServer.getList({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          subject: this.inputVal,
          limit: 100
        });
        this.loading = false;
      },
      /**
       * 选择转播房间
       * @param {*} id 目标房间id
       * @param {*} sourceWebinarId 目标活动id
       */
      async select(id, sourceWebinarId) {
        this.current = id;
        this.previewLoading = true;
        this.sourceWebinarId = sourceWebinarId;
        this.isPreviewVisible = false;

        const { watchInitData } = this.roomBaseServer.state;

        try {
          const res = await this.rebroadcastServer.preview({
            webinar_id: watchInitData.webinar.id,
            source_id: sourceWebinarId
          });

          this.videoParam.type = 'live'; // 未生效
          this.videoParam.paas_record_id = ''; // 录播
          // rebroadcast = true
          // this.videoParam.poster = posterUrl // 未生效
          // isAudio // 不可配

          this.isPreviewVisible = true;
          console.log('res:::', res);
          await sleep(600);
          this.previewLoading = false;
        } catch (err) {
          this.$message.warning(err.msg);
          console.error(err);
        }
      },
      /**
       * 开始转播
       */
      async startRebroadcast() {
        // if !refs.preview return
        // if status!==1 清闲开始直播
        if (this.status !== 1) return this.$message(`请先开始直播`);

        try {
          const res = await this.rebroadcastServer.start({
            webinar_id: this.webinar_id,
            source_id: this.sourceWebinarId
          });
          if (res.code !== 200) {
            return this.$message.error(`转播失败!`);
          }

          this.getList(); // get-list
          this.rebroadcastRoomId = this.current; // 记录
          this.report();
          window?.middleEvent?.send(); // 事件·开始执行
          this.$message.success(`转播成功！`);
        } catch (err) {
          this.$message.error(`转播失败!`);
        }
      },
      /**
       * 停止转播
       */
      async stopRebroadcast() {
        try {
          const res = await this.rebroadcastServer.stopRebroadcast({
            webinar_id: this.webinar_id,
            source_id: this.sourceWebinarId
          });

          if (res.code === 200) {
            this.$message.success('停止转播成功!');
          } else {
            this.$message.error('停止转播失败!');
          }
        } catch (error) {
          this.$message.error('停止转播失败!');
        }
      },
      report() {
        // window.vhallReport.report({
        //   k: 120001,
        //   data: {
        //     business_uid: this.webinar.third_party_user_id,
        //     user_id: '',
        //     webinar_id: this.webinar_id,
        //     refer: '',
        //     s: '',
        //     report_extra: {},
        //     ref_url: '',
        //     req_url: ''
        //   }
        // });
      },
      /**
       * 推本地流
       */
      pushLocalStream() {
        // this.$EventBus.$emit('rebroadcastPushStream');
        // this.$emit('onClose');
      }
    }
  };
</script>
<style lang="less">
  .vmp-rebroadcast {
    background: #fff;
    padding: 0px 32px;
    display: flex;

    &-body {
      display: flex;
    }

    &-control-panel {
      flex: 1 1 auto;

      .vmp-rebroadcast-search {
        display: flex;
        align-items: center;
        padding: 10px 0 22px 0;

        .my-live {
          display: inline-block;
          width: 90px;
          text-align: left;
          position: relative;
          font-size: 14px;
          color: #1a1a1a;
        }

        .el-button {
          height: 36px;
          font-size: 14px;
          padding: 7px 24px;
        }

        .el-input {
          width: 185px;
        }
        .el-input__inner {
          width: 100%;
          border-radius: 20px;
          height: 36px;
        }
        .el-input__icon {
          line-height: 36px;
        }
      }

      .vmp-rebroadcast-control-panel {
        overflow-y: scroll;
        scroll-behavior: smooth;
        height: 338px;
        margin-bottom: 20px;

        .vmp-rebroadcast-item {
          position: relative;
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #e6e6e6;
          cursor: pointer;

          &:hover {
            background-color: #f7f7f7;
          }

          .right-tag {
            position: absolute;
            top: 0;
            right: 0;
            padding: 0 3px 0 4px;
            height: 18px;
            line-height: 18px;
            font-size: 12px;
            color: #fff;
            background: #fb3a32;
            font-style: normal;
            border-radius: 0 0 0 10px;
          }

          .item-logo {
            position: relative;
            img {
              width: 140px;
              height: 79px;
              border-radius: 4px;
              background-color: #1a1a1a;
            }

            i {
              position: absolute;
              top: 4px;
              left: 2px;
              width: 40px;
              text-align: center;
              height: 18px;
              line-height: 18px;
              color: #fff;
              background: rgba(0, 0, 0, 0.65);
              border-radius: 14px;
              font-size: 12px;
              font-style: normal;
            }
          }

          .item-content {
            box-sizing: content-box;
            display: flex;
            flex-direction: column;
            padding: 0 10px;

            .broadcast-title {
              width: 200px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 16px;
              color: #1a1a1a;
              text-align: left;
              margin-bottom: 5px;
            }

            .broadcast-time {
              text-align: left;
              font-size: 12px;
              color: #1a1a1a;
            }
          }
        }

        .vmp-search-result {
          font-size: 16px;
          color: #666;
          text-align: center;
          height: 100%;
          padding-top: 80px;
          width: 380px;
          img {
            width: 130px;
            height: 130px;
          }
        }
      }
    }

    &-preview-panel {
      flex: 0 0 auto;
      width: 330px;
      margin-left: 8px;

      .vmp-rebroadcast-preview-title {
        padding: 80px 0 12px 0;
      }
    }
  }
</style>
