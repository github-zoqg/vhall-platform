<template>
  <!-- 快问快答-排行榜 -->
  <van-popup
    get-container="#otherPopupContainer"
    class="vmp-exam-rank-wap"
    v-model="examRankVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examRankVisible"
    overlay-class="vmp-exam-rank-popup-overlay"
    :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examRank }"
    :style="{ zIndex: zIndexServerState.zIndexMap.examRank }"
  >
    <RankTitle :title="examTitle" :showClose="true" @close="closeDialog" />
    <div class="vmp-rank-wap">
      <RankLabel />
      <div class="rank-list-wrap">
        <ul class="rank-list">
          <van-list v-model="loading" :finished="finished" finished-text="" @load="onLoad">
            <li v-for="item of rankList" :key="item.id" class="rank-item">
              <RankItemWap :item="item" />
            </li>
          </van-list>
        </ul>
      </div>
      <div class="rank-list-more" v-if="rankList && rankList.length >= 200">
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
  import { useZIndexServer, useExamServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
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
        totalPages: 0, // 总页面
        targetPage: 1, // 当前目标页数
        queryParams: {
          pos: 0,
          limit: 10
        },
        rankList: [],
        examId: '',
        loading: false,
        finished: false,
        ownerData: {
          rank_no: 0
        }
      };
    },
    created() {
      this.examServer = useExamServer();
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    watch: {
      // 打开快问快答-排行榜弹窗(全屏,视频需要改为小窗)
      examRankVisible(val) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitExamVisible', [!!val, 'examRank'])
        );
      },
      // :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examRank }"
      // 无法动态更改zIndex
      'zIndexServerState.zIndexMap.examRank': {
        handler(val) {
          if (document.querySelector('.vmp-exam-rank-popup-overlay')) {
            this.$nextTick(() => {
              document.querySelector('.vmp-exam-rank-popup-overlay').style.zIndex = val;
            });
          }
        }
      }
    },
    methods: {
      // 关闭 快问快打 - 排行榜手机弹出框
      handleClose() {
        this.examRankVisible = false;
      },
      async open(examId, examTitle = '') {
        this.examRankVisible = true;
        this.zIndexServer.setDialogZIndex('examRank');
        this.examId = examId;
        this.examTitle = examTitle;
        this.initData();
      },
      // 获取桌面
      initData() {
        // 重置数据
        this.targetPage = 1;
        this.rankList = [];
        this.total = 0;
        // 获取第一页数据
        this.getRankData();
        // 获取个人成绩
        this.getOwnerRankData();
      },
      // 加载更多
      onLoad() {
        if (this.targetPage >= this.totalPages) {
          this.finished = true;
          this.loading = false;
          return false;
        }
        this.loading = true;
        this.targetPage++;
        this.queryParams.pos = parseInt((this.targetPage - 1) * this.queryParams.limit);
        this.getRankData();
      },
      getRankData() {
        const params = {
          pos: this.queryParams.pos,
          limit: this.queryParams.limit,
          paper_id: this.examId
        };
        this.loading = true;
        this.examServer
          .getExamRankList(params)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              const data = res.data;
              if (this.rankList && this.rankList.length > 0) {
                this.rankList.concat(data.list);
              } else {
                this.rankList = data.list || [];
              }
              this.total = data.total || 0;
              this.totalPages = Math.ceil(this.total / this.queryParams.limit);
              if (this.targetPage >= this.totalPages) {
                this.finished = true;
              }
            }
          })
          .catch(res => {
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
        this.examRankVisible = false;
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
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
    background: transparent;
    background: url(https://s3.e.vhall.com/common-static/vhall-form/images/bg_exam_list.png)
      no-repeat;
    border-radius: 40px 40px 0px 0px;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    overflow: hidden;

    .vmp-rank-wap {
      height: calc(100% - 116px);
      overflow: auto;
      position: relative;

      .rank-list-wrap {
        padding: 0 32px;
        padding-bottom: 116px;
      }
      .rank-list-more {
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
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
      z-index: 2;
      background: #f5f5f5;
    }
    .self-rank {
      padding: 0 24px;
    }
  }
</style>
