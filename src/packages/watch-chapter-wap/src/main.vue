<template>
  <div class="vmp-chapter-wap">
    <ul v-if="support && chapterData.length != 0">
      <li v-for="(item, index) in chapterData" :key="index">
        <div
          class="chapter-info"
          :data-time="item.createTime"
          @click.stop="changeTime(item.createTime)"
          :class="{ active: select == item.createTime }"
        >
          <i
            class="vh-saas-iconfont vh-saas-line-Live vmp-chapter-icon"
            v-show="select == item.createTime"
          ></i>
          <span class="title">{{ index + 1 }}.{{ $t(item.title) }}</span>
          <span class="time">{{ item.createTime | secondToDate(1) }}</span>
        </div>
        <template v-if="item.sub.length > 0">
          <div
            class="step-info"
            v-for="(sub, i) in item.sub"
            :key="item.cid + '-step' + i"
            @click.stop="changeTime(sub.createTime)"
            :class="{ active: select == sub.createTime }"
          >
            <i
              class="vh-saas-iconfont vh-saas-line-Live vmp-chapter-icon"
              v-show="select == sub.createTime"
            ></i>
            <span class="title">{{ index + 1 }}-{{ i + 1 }}.{{ $t(sub.title) }}</span>
            <span class="time">{{ sub.createTime | secondToDate(1) }}</span>
          </div>
        </template>
      </li>
    </ul>
    <span v-else class="posit">
      <img src="./img/null.png" alt="" />
      <div class="font_sty">{{ this.$t('appointment.appointment_1019') }}</div>
    </span>
  </div>
</template>
<script>
  import { isMse } from '@/app-shared/utils/isMse';
  import { useRoomBaseServer, useDocServer, usePlayerServer } from 'middle-domain';
  export default {
    name: 'VmpChapterWap',
    data() {
      return {
        select: '',
        moment: null,
        support: true,
        isMyClick: false,
        chapterData: [],
        webinarData: {}
      };
    },
    beforeCreate() {
      this.webinarData = useRoomBaseServer().state.watchInitDate;
      this.docServer = useDocServer();
      this.playerServer = usePlayerServer();
    },
    created() {
      // this.acceptChapterData();
      if (
        this.webinarData.record &&
        this.webinarData.record.encrypt_status == 2 &&
        !isMse().supportMSE
      ) {
        this.support = false;
      }
    },
    mounted() {
      // 接受文档server消息 获取章节信息
      this.docServer.$on('dispatch_doc_vod_cuepoint_load_complate', msg => {
        console.log('dispatch_doc_vod_cuepoint_load_complate', msg);
        this.acceptChapterData(msg);
      });
      // 接受播放器server消息 更改章节item
      this.playerServer.$on('chapter_time_update', currentTime => {
        console.log(currentTime, 'currentTime');
        this.acceptCurrentTime(currentTime);
      });
    },
    methods: {
      // 更改播放器时间
      changeTime(t) {
        this.isMyClick = true;
        this.select = t;
        this.playerServer.setCurrentTime(t);
      },
      // 接受章节数据
      acceptChapterData(data) {
        this.chapterData = data;
      },
      // 接受当前时间
      acceptCurrentTime(currentTime) {
        if (this.isMyClick) {
          this.isMyClick = false;
          return false;
        }
        const currentNode = this.computeBeforeNode(currentTime);
        if (currentNode) {
          this.select = currentNode.createTime;
        } else {
          this.select = 0;
        }
      },
      computeBeforeNode(currentTime) {
        let beforeNode = null;
        // 这块查询有点绕，后来的大佬有思路可以优化一下
        for (let i = 0; i < this.chapterData.length; i++) {
          if (this.chapterData[i].createTime == currentTime) {
            // 如果当前节点的时间等于播放器当前时间，直接返回当前节点
            return this.chapterData[i];
          }
          if (this.chapterData[i].createTime > currentTime) {
            // 如果当前节点的时间大于播放器当前时间，直接返回 beforeNode
            return beforeNode;
          }
          // 如果当前节点时间小于播放器当前时间，需要判断当前节点是否存在子节点，如果有子节点，遍历子节点
          if (this.chapterData[i].sub.length) {
            // 如果当前节点有子节点，遍历子节点列表
            for (let j = 0; j < this.chapterData[i].sub.length; j++) {
              if (this.chapterData[i].createTime == currentTime) {
                // 如果当前节点的时间等于播放器当前时间，直接返回当前节点
                return this.chapterData[i].sub[j];
              }
              if (this.chapterData[i].sub[j].createTime > currentTime) {
                // 如果当前节点的时间大于播放器当前时间，直接返回 beforeNode
                return beforeNode;
              } else {
                // 更新 beforeNode
                beforeNode = this.chapterData[i].sub[j];
                if (j === this.chapterData[i].sub.length - 1 && i === this.chapterData.length - 1) {
                  // 如果是最后一个节点，直接返回最后一个节点
                  return beforeNode;
                }
              }
            }
          } else {
            // 更新 beforeNode
            beforeNode = this.chapterData[i];
            if (i === this.chapterData.length - 1) {
              // 如果是最后一个节点，直接返回最后一个节点
              return beforeNode;
            }
          }
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-chapter-wap {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0 0;
    background: var(--theme-chapter-list-bg);
    ul {
      display: block;
      width: 100%;
      height: 100%;
      overflow-y: scroll;
      touch-action: pan-y;
      box-sizing: border-box;
      padding: 0 0;
      font-size: 28px;
      font-style: normal;
      font-weight: 400;
    }
    li {
      display: block;
      width: 100%;
      min-height: 94px;
      .active {
        .title {
          color: var(--theme-chapter-font-color-active);
        }
        &.step-info {
          .title {
            width: 70%;
          }
        }
        .time {
          color: var(--theme-chapter-font-color-active);
        }
        .vmp-chapter-icon {
          font-size: 16px;
          margin-right: 8px;
          color: var(--theme-chapter-font-color-active);
        }
      }
      div {
        height: 100%;
        width: 100%;
        padding: 27px 24px;
        line-height: 40px;
      }
      &:last-child {
        padding-bottom: 100px;
      }
    }
    .chapter-info {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }
    .title {
      display: inline-block;
      width: 75%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      vertical-align: middle;
      text-align: left;
      color: var(--theme-chapter-font-color-title);
    }
    .time {
      display: inline-block;
      width: 25%;
      text-align: right;
      color: var(--theme-chapter-font-color-time);
    }
    .step-info {
      width: calc(100% - 48px);
      padding: 27px 0 27px 24px;
      margin-left: 24px;
    }
    .posit {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      img {
        width: 260px;
      }
      .font_sty {
        font-size: 30px;
        color: #8c8c8c;
        text-align: center;
      }
    }
  }
</style>
