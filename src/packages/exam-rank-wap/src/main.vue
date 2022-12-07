<template>
  <!-- 快问快答-排行榜 -->
  <van-popup
    get-container="body"
    :class="['vmp-exam-rank-wap', isExamStickTop || isPortraitLive ? 'exam-stick-top' : '']"
    v-model="examRankVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examRankVisible"
    :overlay="!isExamStickTop && !isPortraitLive"
    overlay-class="vmp-exam-rank-popup-overlay"
    :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examRank }"
    :style="{ zIndex: zIndexServerState.zIndexMap.examRank }"
    safe-area-inset-bottom
  >
    <RankTitle :title="examTitle" :showClose="true" @close="closeDialog" />
    <div class="vmp-rank-wap">
      <RankLabel />
      <div class="rank-list-wrap">
        <ul class="rank-list">
          <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list
              v-model="loading"
              :finished="finished"
              finished-text=""
              @load="onLoad"
              :immediate-check="false"
            >
              <li v-for="item of rankList" :key="item.id" class="rank-item">
                <RankItemWap :item="item" />
              </li>
            </van-list>
          </van-pull-refresh>
        </ul>
      </div>
      <div class="rank-list-more" v-if="rankList && rankList.length >= maxTotal">
        {{ $t('exam.exam_1045') }}
      </div>
    </div>
    <div class="dialog-bottom">
      <div class="≈">
        <RankItemWap class="ma" :item="ownerData" />
      </div>
    </div>
  </van-popup>
</template>
<script>
  import RankTitle from './rank-title.vue';
  import RankLabel from './rank-label.vue';
  import RankItemWap from './rank-item.vue';
  import { useZIndexServer, useExamServer, useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { uniqBy, throttle } from 'lodash';
  export default {
    name: 'VmpExamRankWap',
    components: {
      RankTitle,
      RankLabel,
      RankItemWap
    },

    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        examRankVisible: false,
        examTitle: '',
        loading: false,
        finished: false,
        refreshing: false,
        rankList: [],
        // 分页配置
        pageConfig: {
          page: 0,
          limit: 10,
          total: 0
        },
        maxTotal: 200,
        examId: '',
        ownerData: {
          rank_no: 0
        }
      };
    },
    created() {
      this.examServer = useExamServer();
    },
    computed: {
      // 是否是手机端 - 简洁模式
      isConcise() {
        let skin_json_wap = {
          style: 1
        };
        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return !!(skin_json_wap?.style == 3);
      },
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 快问快答-是否吸顶
      isExamStickTop() {
        return this.$domainStore.state?.roomBaseServer?.isExamStickTop || false;
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
      }
    },
    watch: {
      // 打开快问快答-排行榜弹窗(全屏,视频需要改为小窗)
      examRankVisible(val) {
        if (this.isConcise) {
          this.roomBaseServer.setIsExamStickTop(val);
          this.roomBaseServer.setStickType(val ? 'examRank' : '');
        }
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitExamVisible', [!!val, 'examRank'])
        );
      },
      // :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examRank }"
      // 无法动态更改zIndex
      'zIndexServerState.zIndexMap.examRank': {
        handler(val) {
          if (
            !this.isExamStickTop &&
            !this.isPortraitLive &&
            document.querySelector('.vmp-exam-rank-popup-overlay')
          ) {
            this.$nextTick(() => {
              document.querySelector('.vmp-exam-rank-popup-overlay').style.zIndex = val;
            });
          }
        }
      }
    },
    methods: {
      async open(examId, examTitle = '') {
        console.log('展示快问快答-成绩榜单部分，icon数量++');
        this.changeIconShowNum(true);
        this.examRankVisible = true;
        this.zIndexServer.setDialogZIndex('examRank');
        this.examId = examId;
        this.examTitle = examTitle;
        this.initData();
      },
      onLoad() {
        if (this.refreshing) {
          this.pageConfig.page = 0;
          this.rankList = [];
          this.refreshing = false;
        }
        this.getList();
      },
      onRefresh() {
        // 清空列表数据
        this.finished = false;
        this.pageConfig.page = 0;
        this.rankList = [];
        // 重新加载数据
        // 将 loading 设置为 true，表示处于加载状态
        this.loading = true;
        this.onLoad();
      },
      // 获取桌面
      initData() {
        this.onRefresh();
        // 获取个人成绩
        this.getOwnerRankData();
      },
      // 获取成员列表
      getList() {
        this.pageConfig.page++;
        const params = {
          pos: (this.pageConfig.page - 1) * this.pageConfig.limit,
          limit: this.pageConfig.limit,
          paper_id: this.examId,
          from_consumer: 1
        };
        return this.examServer
          .getExamRankList(params)
          .then(res => {
            if (res && res.code == 200) {
              this.pageConfig.total = res.data.total || 0;
              let maxTotal = res.data.total || 0;
              if (this.pageConfig.total >= this.maxTotal) {
                // 总条数大于或等于200条，最多查询200条
                maxTotal = this.maxTotal;
              } else if (this.pageConfig.total < this.maxTotal) {
                // 总条数小于200条，按照200条去查询
                maxTotal = this.pageConfig.total;
              }
              if (this.pageConfig.page == 1 && this.pageConfig.total <= 0) {
                // 第一页加载没数据，停止内容
                this.finished = true;
              }
              let list = res.data.list || [];
              this.rankList = this.rankList.concat(list);

              if (this.rankList.length >= maxTotal) {
                this.finished = true;
              }
            }
          })
          .catch(error => {
            console.log(error, '请求排行榜数据错误');
          })
          .finally(() => {
            this.loading = false;
          });
      },
      getOwnerRankData() {
        this.examServer
          .getExamUserScope(this.examId)
          .then(res => {
            if (res.code === 200) {
              let data = res.data;
              data.rank_no = Number(data.rank) || 0;
              this.ownerData = data;
            }
          })
          .catch(res => {});
      },
      closeDialog() {
        console.log('关闭快问快答-成绩榜单部分，icon数量--');
        this.changeIconShowNum(false);
        this.examRankVisible = false;
      },
      // change icon显示数量
      changeIconShowNum(status) {
        this.roomBaseServer.setShowIconNum(status);
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.roomBaseServer = useRoomBaseServer();
    }
  };
</script>
<style lang="less">
  // @import url('~@/app-shared/assets/css/mixin.less');
  .mixin clearfix {
    &:after {
      content: '';
      display: table;
      clear: both;
    }
  }

  .mixin relative {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .flex-mixin(@justify: flex-start, @align-items: center, @dir: row, @wrap: nowrap, @align-content: stretch) {
    display: flex;
    flex-flow: @dir @wrap;
    justify-content: @justify;
    align-items: @align-items;
    align-content: @align-content;
  }

  .bg-mixin(@size: contain, @repeat: no-repeat, @position: center, @origin: initial) {
    background-size: @size;
    background-repeat: @repeat;
    background-position: @position;
    background-origin: @origin;
  }

  .vmp-exam-rank-wap {
    height: 844px;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    background: transparent;
    background: url(https://s3.e.vhall.com/common-static/vhall-form/images/bg_exam_list.png)
      no-repeat;
    border-radius: 40px 40px 0px 0px;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    overflow: hidden;
    /** 快问快答 - 列表高度 */
    &.exam-stick-top {
      height: calc(100% - 422px);
      bottom: 0;
      top: auto;
    }
    .vmp-rank-wap {
      height: calc(100% - 116px);
      overflow: auto;
      position: relative;

      .rank-list-wrap {
        padding: 0 32px;
        padding-bottom: 116px;
      }
      .rank-list-more {
        font-style: normal;
        font-weight: 400;
        font-size: 24px;
        line-height: 32px;
        color: #8c8c8c;
        text-align: center;
        padding-top: 8px;
      }
      .rank-list {
        background: #fff;
        border-radius: 16px 16px 0px 0px;
        padding: 0 24px;
      }
      .rank-item:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
      .avatar-wrap {
        .flex-mixin();
        height: 64px;
        .nickname {
          max-width: 140px;
        }
      }

      .rank {
        .item {
          width: 100%;
          height: 110px;
          background: #fff;
          border-radius: 16px;
        }
      }
    }
    .dialog-bottom {
      position: absolute;
      width: 100%;
      left: 0;
      bottom: 0;
      bottom: constant(safe-area-inset-bottom);
      bottom: env(safe-area-inset-bottom);
      z-index: 2;
      background: #f5f5f5;
    }
    // @supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
    //   .dialog-bottom {
    //     bottom: calc(env(safe-area-inset-bottom) !important;
    //   }
    // }
    .self-rank {
      padding: 0 24px;
    }
  }
</style>
