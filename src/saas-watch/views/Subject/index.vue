<template>
  <!-- pc专题详情页 -->
  <div
    class="vmp-watch-subject"
    v-loading="state === 0"
    element-loading-text="加载中"
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <template v-if="state == 1">
      <vmp-air-container cuid="layerSubjectRoot"></vmp-air-container>
      <div class="vmp-subject-pagination">
        <el-pagination
          v-show="total > pageInfo.limit"
          background="true"
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageInfo.limit"
          :current-page="pageNum"
          @current-change="currentChangeHandler"
          align="center"
        ></el-pagination>
      </div>
    </template>
    <template v-if="state == 2">
      <div class="vmp-watch-subject_error">
        <img src="./images/subject_null.png" alt="" />
        <p>此专题已下线</p>
      </div>
    </template>
  </div>
</template>
<script>
  import { setRequestHeaders, useSubjectServer, useUserServer } from 'middle-domain';
  export default {
    name: 'SubjectWatch',
    data() {
      return {
        state: 0,
        total: 0,
        maxPage: 1,
        pageNum: 1,
        pageInfo: {
          pos: 0,
          limit: 20
        }
      };
    },
    async created() {
      const userServer = useUserServer();
      if (localStorage.getItem('token')) {
        setRequestHeaders({
          token: localStorage.getItem('token') || undefined
        });
        await userServer.getUserInfo({ scene_id: 2 });
      }
      await this.getSubjectInfo();
    },
    mounted() {
      this.$i18n.locale = 'zh-CN';
    },
    methods: {
      async getSubjectInfo() {
        const subjectServer = useSubjectServer();
        try {
          const res = await subjectServer.getSubjectInfo({
            subject_id: this.$route.query.id
          });
          if (res.code !== 200) {
            if ([511006, 511007].includes(res.code)) {
              localStorage.removeItem('token');
              window.location.reload();
              return;
            }
            this.state = 2;
            return;
          }
          await this.getWebinarList();
          await this.initSubjectAuth();
          this.state = 1;
        } catch (err) {
          this.state = 2;
        }
      },
      async getWebinarList() {
        const subjectServer = useSubjectServer();
        let params = {
          subject_id: this.$route.query.id,
          pos: 0,
          limit: this.pageInfo.limit
        };
        await subjectServer.getWebinarList(params).then(res => {
          if (res.code === 200) {
            this.total = res.data.total;
            this.maxPage = Math.ceil(res.data.total / this.pageInfo.limit);
          }
        });
      },
      getWebinarMoreList() {
        console.log(this.maxPage, this.pageNum, this.total, '???!2324235');
        const subjectServer = useSubjectServer();
        let params = {
          subject_id: this.$route.query.id,
          pos: parseInt((this.pageNum - 1) * this.pageInfo.limit),
          limit: this.pageInfo.limit
        };
        subjectServer.getWebinarList(params);
      },
      async initSubjectAuth() {
        const subjectServer = useSubjectServer();
        const visitorId = localStorage.getItem('visitorId');
        let params = {
          subject_id: this.$route.query.id,
          visitor_id: !['', null, void 0].includes(visitorId) ? visitorId : undefined,
          ...this.$route.query
        };
        // 如果已经鉴权过，就直接进入观看端，否则走鉴权
        await subjectServer.initSubjectInfo(params);
      },
      currentChangeHandler(num) {
        this.pageNum = num;
        this.getWebinarMoreList();
      }
    }
  };
</script>
<style lang="less">
  .vmp-watch-subject {
    width: 100%;
    height: 100vh;
    background: #f7f7f7;
    overflow: auto;
    &_error {
      width: 202px;
      height: 90px;
      margin: 0 auto;
      text-align: center;
      padding-top: 162px;
      img {
        width: 100%;
      }
      p {
        text-align: center;
        font-size: 16px;
        color: #1a1a1a;
        line-height: 22px;
        padding-top: 12px;
        padding-left: 20px;
      }
    }
    .vmp-subject-bd {
      background: #f7f7f7;
      padding-top: 21px;
    }
  }

  // 分页样式重置
  .vmp-subject-pagination {
    margin-bottom: 48px;
    .el-pagination {
      &.is-background {
        .btn-next,
        .btn-prev {
          border: 1px solid #cccccc;
          background-color: transparent;
        }
        .el-pager {
          li {
            background-color: transparent;
          }
        }
        .el-input__inner {
          background: transparent;
        }
        .el-pager {
          .number {
            border: 1px solid #cccccc;
            &:not(.disabled).active {
              background-color: #fb3a32;
              border-color: transparent;
            }
          }
        }
      }
    }
  }
</style>
