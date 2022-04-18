<template>
  <section class="vmp-rebroadcast">
    <saas-dialog
      :visible="isShow"
      :isClose="true"
      @onClose="close"
      title="转播"
      width="800px"
      style="min-width: 800px"
    >
      <div class="vmp-rebroadcast">
        <main class="vmp-rebroadcast-body">
          <!-- 控制面板 -->
          <section class="vmp-rebroadcast-control-panel" v-loading="loading">
            <!-- 搜索区域 -->
            <header class="vmp-rebroadcast-search">
              <span class="my-live">
                我的直播
                <i class="vh-iconfont vh-line-question"></i>
                <div class="tips">暂只支持转播直播</div>
              </span>
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
              <overlay-scrollbars
                ref="rebroadcastListScroll"
                :options="overlayScrollBarsOptions"
                style="height: 100%"
              >
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
              </overlay-scrollbars>
            </main>
          </section>

          <!-- 预览区域 -->
          <section class="vmp-rebroadcast-preview-panel">
            <header class="vmp-rebroadcast-preview-title">预览</header>
            <main class="vmp-rebroadcast-preview-box" v-loading="previewLoading">
              <img :src="domainState.docUrl || posterUrl" />
              <section
                v-if="isPreviewVisible"
                :class="[domainState.docUrl === '' ? 'full-video-box ' : 'mini-video-box']"
              >
                <video-preview ref="videoPreview" :videoParam="videoParam" />
              </section>
            </main>
            <footer class="vmp-rebroadcast-preview-panel__footer" v-if="currentRoomId">
              <section>
                <p v-if="rebroadcastingRoomId">
                  <el-checkbox v-model="isPushLocalStream">同时开始本地推流</el-checkbox>
                </p>
              </section>
              <section>
                <el-button v-if="rebroadcastingRoomId" round @click="stop">结束转播</el-button>
                <el-button v-if="!rebroadcastingRoomId" round @click="start">开始转播</el-button>
              </section>
            </footer>
          </section>
        </main>
      </div>
    </saas-dialog>
  </section>
</template>

<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import SaasDialog from '@/packages/pc-alert/src/dialog.vue';
  import { useRoomBaseServer, useRebroadcastServer, useInteractiveServer } from 'middle-domain';
  import { sleep } from '@/packages/app-shared/utils/tool';
  import VideoPreview from '@/packages/app-shared/components/video-preview';

  import NoCreateImg from './img/no-create@2x.png';
  import NoSearchImg from './img/no-search@2x.png';

  export default {
    name: 'VmpRebroadcastList',
    components: {
      SaasDialog,
      VideoPreview
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.rebroadcastServer = useRebroadcastServer();
      this.interactiveServer = useInteractiveServer();
    },
    data() {
      return {
        isShow: false,
        currentRoomId: '', // 当前选中的ID
        rebroadcastingRoomId: '', // 当前正在转播的
        inputVal: '', // 搜索
        loading: false,
        previewLoading: false,
        list: [],
        domainState: this.rebroadcastServer.state,
        nologoImg: '//t-alistatic01.e.vhall.com/static/img/video_default_nologo.png',
        posterUrl:
          '//t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/upload/common/static-imgs/c0/e7/c0e7569408de296971eb4b98945c240b.png',

        pushStreamSeperately: false,
        isPushLocalStream: false,
        isPreviewInit: false,
        isPreviewVisible: false,
        videoParam: {},
        overlayScrollBarsOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-dark os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        }
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
      this.rebroadcastServer.$on('live_broadcast_stop', async () => {
        this.$message.success('停止转播成功!');
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'stopRebroadcast'));

        if (this.isPushLocalStream) {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'startPush'));
        }

        this.$refs.videoPreview && this.$refs.videoPreview.destroy();
        await this.$nextTick(0);
        this.close();
      });
    },
    methods: {
      open() {
        this.isShow = true;
        this.getList();
      },
      close() {
        this.isShow = false;
        this.reset();
      },
      async reset() {
        this.$refs.videoPreview && this.$refs.videoPreview.destroy();
        await this.$nextTick(0);
        this.currentRoomId = '';
        this.rebroadcastingRoomId = '';
        this.pushStreamSeperately = false;
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
        this.currentRoomId = '';
        this.isPreviewVisible = false;
        await sleep(1000); // 等待video-preview destroy掉

        this.currentRoomId = id;
        this.previewLoading = true;
        this.domainState.sourceWebinarId = sourceWebinarId;

        const rebroadcastingItem = this.domainState.list.find(item => item.room_id === id);
        if (rebroadcastingItem && rebroadcastingItem.is_stream == 1) {
          this.rebroadcastingRoomId = id;
        }

        const { watchInitData } = this.roomBaseServer.state;

        try {
          const res = await this.rebroadcastServer.preview({
            webinar_id: watchInitData.webinar.id,
            source_id: sourceWebinarId
          });
          if (res.code !== 200) {
            return this.$message(this.$t(res.msg));
          }

          const { token, appId, accountId, roomId } = this.domainState;
          this.videoParam = {
            token,
            type: 'live',
            appId,
            accountId,
            autoplay: true,
            liveOption: {
              defaultDefinition: '360p',
              type: 'flv',
              roomId
            }
          };
          this.isPreviewVisible = true;
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
      async start() {
        const { watchInitData } = this.roomBaseServer.state;
        if (watchInitData.webinar.type !== 1) return this.$message(`请先开始直播`);

        try {
          const res = await this.rebroadcastServer.start({
            webinar_id: watchInitData.webinar.id,
            source_id: this.domainState.sourceWebinarId
          });
          if (res.code !== 200) return this.$message.error(`转播失败!`);

          window?.vhallReportForProduct?.report(120001); // 埋点 - 开始转播

          this.rebroadcastRoomId = this.currentRoomId; // 记录
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'startRebroadcast'));
          this.$message.success(`转播成功！`);
          this.close();
        } catch (err) {
          console.warn('转播失败', err);
          this.$message.error(`转播失败!`, err);
        }
      },
      /**
       * 停止转播
       */
      async stop() {
        const { watchInitData } = this.roomBaseServer.state;

        try {
          const res = await this.rebroadcastServer.stop({
            webinar_id: watchInitData.webinar.id,
            source_id: this.domainState.sourceWebinarId
          });

          if (res.code !== 200) {
            this.$message.error('停止转播失败!');
          }
        } catch (error) {
          console.error('error:', error);
          this.$message.error('停止转播失败!');
        }
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

          i {
            color: #999;
          }

          .tips {
            display: none;
            position: absolute;
            top: 28px;
            left: -20px;
            padding: 0 10px;
            width: 120px;
            z-index: 999;
            color: #fff;
            font-size: 12px;
            border-radius: 4px;
            background-color: rgba(51, 51, 51, 0.8);
            box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.2);
            height: 40px;
            box-sizing: border-box;
          }

          &:hover {
            .tips {
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
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

      .vmp-rebroadcast-preview-box {
        position: relative;
        background-color: #dfdfdf;
        border: #dfdfdf;
        width: 100%;
        height: 186px;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }

        .full-video-box {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }

        .mini-video-box {
          width: 118px;
          height: 89px;
          position: absolute;
          right: 0;
          top: 0;
        }
      }

      &__footer {
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
</style>
