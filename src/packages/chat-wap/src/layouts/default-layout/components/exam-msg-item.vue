<template>
  <!--
    推送-快问快答 paper_send
    公布-快问快答-成绩 paper_send_rank
    快问快答-收卷 paper_end
    快问快答-自动收卷 paper_auto_end
    快问快答-自动公布成绩 paper_auto_send_rank
   -->
  <div class="msg-item interact exam_msg_flex">
    <div class="msg-item-template__interact-content">
      <!-- 收到快问快答 / 公布-快问快答-成绩 / 收卷  -->
      <template v-if="['paper_send', 'paper_send_rank', 'paper_end'].includes(source.type)">
        <div
          class="exam_msg_bg"
          @tap="checkExamDetail(source.content, source.type)"
          @click="checkExamDetail(source.content, source.type)"
        >
          <span class="role" :class="source.roleName | roleClassFilter">
            <span>{{ source.roleName | roleFilter }}</span>
          </span>
          {{ overHidden(source.nickname, 8) }}{{ source.content.text_content }}
          <span class="highlight" v-if="source.type != 'paper_end'">
            {{ source.type == 'paper_send' ? $t('chat.chat_1093') : $t('exam.exam_1004') }}
          </span>
        </div>
        <div
          class="exam_msg_bg exam_title"
          @tap="checkExamDetail(source.content, source.type)"
          @click="checkExamDetail(source.content, source.type)"
        >
          <span class="highlight">《{{ overHidden(source.content.exam_title, 22) }}》</span>
        </div>
      </template>
      <!-- 快问快答-自动收卷 -->
      <template v-else-if="source.type == 'paper_auto_end'">
        <div class="exam_msg_bg">
          {{ source.content.text_content }}
        </div>
        <div class="exam_msg_bg exam_title">
          <span>《{{ overHidden(source.content.exam_title, 22) }}》</span>
        </div>
      </template>
      <!-- 公布-快问快答-自动公布成绩 -->
      <template v-else-if="source.type == 'paper_auto_send_rank'">
        <div
          class="exam_msg_bg"
          @tap="checkExamDetail(source.content, source.type)"
          @click="checkExamDetail(source.content, source.type)"
        >
          {{ source.content.text_content }}
          <span class="highlight">{{ $t('exam.exam_1004') }}</span>
        </div>
        <div
          class="exam_msg_bg exam_title"
          @tap="checkExamDetail(source.content, source.type)"
          @click="checkExamDetail(source.content, source.type)"
        >
          <span class="highlight">《{{ overHidden(source.content.exam_title, 22) }}》</span>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      source: {
        required: true,
        default: () => ({})
      }
    },
    filters: {
      //角色标签样式
      roleClassFilter(value) {
        //主持人
        if ([1, '1'].includes(value)) {
          return 'host';
        }
        //助理
        if ([3, '3'].includes(value)) {
          return 'assistant';
        }
        //游客
        return 'guest';
      },
      //消息里的角色样式
      roleClassFilterForMsg(value) {
        //主持人
        if ([1, '1'].includes(value)) {
          return 'host';
        }
        //助理
        if ([3, '3'].includes(value)) {
          return 'assistant';
        }
        //游客
        if ([4, '4'].includes(value)) {
          return 'guest';
        }
        return '';
      }
    },
    mounted() {},
    methods: {
      overHidden(value = '', len = 0) {
        if (value === null || value === undefined) return '';
        if (value.length > len) {
          return value.substring(0, len) + '...';
        }
        return value;
      },
      // 点击查看问卷
      checkExamDetail(content, sourceType) {
        this.$emit('checkExamDetail', {
          examId: content.exam_id,
          examTitle: content.exam_title,
          sourceType: sourceType
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-wap-msg-item {
    .msg-item {
      &.interact {
        &.exam_msg_flex {
          @font-link: #3562fa;
          @font-click-detail: #0a7ff5;
          display: block;
          text-align: center;
          background: var(--theme-chat-msg-interact-bg);
          border-radius: 40px;
          padding: 4px 25px;
          margin: 0 auto 38px auto;
          > div.msg-item-template__interact-content {
            background: unset;
            .exam_msg_bg {
              display: flex;
              justify-content: flex-start;
              align-items: top;
              flex-wrap: wrap;
              padding: 0px 0;
              width: 100%;
              border-radius: 40px;
              font-style: normal;
              font-weight: 400;
              font-size: 24px;
              line-height: 32px;
              text-align: center;
              color: rgba(0, 0, 0, 0.85);
              .role {
                margin-top: 0;
                line-height: unset;
              }
              .highlight {
                padding-left: 10px;
                color: @font-click-detail;
              }
              &.exam_title {
                font-style: normal;
                font-weight: 400;
                font-size: 20px;
                line-height: 24px;
                text-align: center;
                color: #595959;
                margin-top: 4px;
                .highlight {
                  padding-left: 0;
                  color: #595959;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
