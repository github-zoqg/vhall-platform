<template>
  <div class="vmp-chapter">
    <overlay-scrollbars ref="osComponentRef" :options="osComponentOptions" style="height: 100%">
      <template v-if="chapterInfo.length">
        <template v-for="(item, index) in chapterInfo">
          <!-- 父章节 -->
          <div
            :key="index"
            class="chapter-info"
            :data-time="item.createTime"
            :class="{ active: select == item.createTime, 'chapter-info-first': index === 0 }"
            @click.stop="changeTime(item.createTime)"
          >
            <div class="title">
              <img class="active-img" src="./img/playing.gif" alt="" />
              <span class="title-label">{{ index + 1 }}.{{ item.title }}</span>
            </div>
            <span class="time">{{ item.createTime | secondToDate(1) }}</span>
          </div>
          <!-- 子章节 -->
          <template v-if="item.sub.length > 0">
            <div
              v-for="(sub, i) in item.sub"
              :key="index + '-step' + i"
              class="step-info"
              :class="{ active: select == sub.createTime }"
              @click.stop="changeTime(sub.createTime)"
            >
              <div class="title">
                <img class="active-img" src="./img/playing.gif" alt="" />
                <span class="title-label">{{ index + 1 }}-{{ i + 1 }}.{{ sub.title }}</span>
              </div>
              <span class="time">{{ sub.createTime | secondToDate(1) }}</span>
            </div>
          </template>
        </template>
      </template>
      <div v-else class="chapter-nodata__container">
        <img class="chapter-nodata-img" src="./img/no-chapter.png" alt="" />
        <p class="chapter-nodata-desc">{{ $t('appointment.appointment_1019') }}</p>
      </div>
    </overlay-scrollbars>
  </div>
</template>
<script>
  import { usePlayerServer, useDocServer } from 'middle-domain';
  // import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpChapter',
    data() {
      return {
        select: '',
        isMyClick: false,
        chapterInfo: [],
        osComponentOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        }
      };
    },
    components: {},
    beforeCreate() {
      this.docServer = useDocServer();
      this.playerServer = usePlayerServer();
    },
    created() {
      // 接受文档server消息 获取章节信息
      this.docServer.$on('dispatch_doc_vod_cuepoint_load_complate', msg => {
        this.acceptChapter(msg);
      });
      // 接受播放器server消息 更改章节item
      this.playerServer.$on('chapter_time_update', currentTime => {
        this.acceptCurrentTime(currentTime);
      });
    },
    methods: {
      // 接受章节数据
      acceptChapter(chapters) {
        this.chapterInfo = chapters;
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
      // 更改时间
      changeTime(t) {
        this.isMyClick = true;
        this.select = t;
        this.playerServer.setCurrentTime(t);
      },
      computeBeforeNode(currentTime) {
        let beforeNode = null;
        // 这块查询有点绕，后来的大佬有思路可以优化一下
        for (let i = 0; i < this.chapterInfo.length; i++) {
          if (this.chapterInfo[i].createTime == currentTime) {
            // 如果当前节点的时间等于播放器当前时间，直接返回当前节点
            return this.chapterInfo[i];
          }
          if (this.chapterInfo[i].createTime > currentTime) {
            // 如果当前节点的时间大于播放器当前时间，直接返回 beforeNode
            return beforeNode;
          }
          // 如果当前节点时间小于播放器当前时间，需要判断当前节点是否存在子节点，如果有子节点，遍历子节点
          if (this.chapterInfo[i].sub.length) {
            // 如果当前节点有子节点，遍历子节点列表
            for (let j = 0; j < this.chapterInfo[i].sub.length; j++) {
              if (this.chapterInfo[i].createTime == currentTime) {
                // 如果当前节点的时间等于播放器当前时间，直接返回当前节点
                return this.chapterInfo[i].sub[j];
              }
              if (this.chapterInfo[i].sub[j].createTime > currentTime) {
                // 如果当前节点的时间大于播放器当前时间，直接返回 beforeNode
                return beforeNode;
              } else {
                // 更新 beforeNode
                beforeNode = this.chapterInfo[i].sub[j];
                if (j === this.chapterInfo[i].sub.length - 1 && i === this.chapterInfo.length - 1) {
                  // 如果是最后一个节点，直接返回最后一个节点
                  return beforeNode;
                }
              }
            }
          } else {
            // 更新 beforeNode
            beforeNode = this.chapterInfo[i];
            if (i === this.chapterInfo.length - 1) {
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
  .vmp-chapter {
    width: 100%;
    height: 100%;
    background: #2a2a2a;
    .chapter-info,
    .step-info {
      height: 40px;
      width: 312px;
      line-height: 40px;
      padding: 0 4px;
      margin: 0 20px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: #cccccc;
      font-size: 12px;
      cursor: pointer;
      .title {
        width: 262px;
        float: left;
      }
      .time {
        float: right;
      }
      .active-img {
        float: left;
        width: 8px;
        margin-top: 16px;
        margin-right: 4px;
        display: none;
      }
      .title-label {
        float: left;
        width: 262px;
        line-height: 40px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
      }
      &:hover {
        background: #1a1a1a;
        color: #fb3a32;
        line-height: 40px;
      }
      &.active {
        background: #1a1a1a;
        color: #fb3a32;
        .title-label {
          float: left;
          width: 250px;
          line-height: 40px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
        }
        .active-img {
          display: block;
        }
      }
    }
    .chapter-info-first {
      margin-top: 6px;
    }
    .step-info {
      width: 298px;
      padding-left: 18px;
      .title {
        width: 246px;
        .title-label {
          width: 246px;
        }
      }
      &.active {
        .title-label {
          width: 234px;
        }
      }
    }
    .chapter-nodata__container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      .chapter-nodata-img {
        width: 106px;
        margin-top: 157px;
      }
      .chapter-nodata-desc {
        margin-top: 17px;
        font-size: 16px;
        color: #999999;
        line-height: 22px;
      }
    }
  }
</style>
