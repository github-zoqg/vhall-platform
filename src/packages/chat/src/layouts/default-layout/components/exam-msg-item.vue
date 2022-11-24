<template>
  <!--
    推送-快问快答 paper_send
    公布-快问快答-成绩 paper_send_rank
    快问快答-收卷 paper_end
    快问快答-自动收卷 paper_auto_end
    快问快答-自动公布成绩 paper_auto_send_rank
   -->
  <div class="msg-item-template__interact exam_msg_flex">
    <div class="msg-item-template__interact-content">
      <!-- 收到快问快答 / 公布-快问快答-成绩 / 收卷 -->
      <template v-if="['paper_send', 'paper_send_rank', 'paper_end'].includes(source.type)">
        <div
          class="msg-item__top"
          @tap="checkExamDetail(source.content.exam_id, source.type)"
          @click="checkExamDetail(source.content.exam_id, source.type)"
        >
          <span
            v-show="source.roleName"
            class="interact-content__role-name"
            :class="source.roleName | roleClassFilterForMsg"
          >
            {{ source.roleName | roleFilter }}
          </span>
          <span v-show="source.nickname" class="interact-content__nick-name">
            {{ source.nickname | overHidden(4) }}
          </span>
          <span>{{ source.content.text_content }}</span>
          <span class="msg-item__top__highlight" v-if="source.type != 'paper_end'">
            {{ source.type == 'paper_send' ? $t('chat.chat_1093') : $t('exam.exam_1004') }}
          </span>
        </div>
        <div
          class="msg-item__name"
          @tap="checkExamDetail(source.content.exam_id, source.type)"
          @click="checkExamDetail(source.content.exam_id, source.type)"
        >
          <span>《{{ overHidden(source.content.exam_title, 23) }}》</span>
        </div>
      </template>
      <!-- 快问快答-自动收卷 -->
      <template v-else-if="['paper_auto_end'].includes(source.type)">
        <div class="msg-item__top flex_center">
          {{ source.content.text_content }}
        </div>
        <div class="msg-item__name">
          <span>《{{ overHidden(source.content.exam_title, 23) }}》</span>
        </div>
      </template>
      <!-- 公布-快问快答-自动公布成绩 -->
      <template v-else-if="source.type == 'paper_auto_send_rank'">
        <div
          class="msg-item__top"
          @tap="checkExamDetail(source.content.exam_id, source.type)"
          @click="checkExamDetail(source.content.exam_id, source.type)"
        >
          <span>{{ source.content.text_content }}</span>
          <span class="msg-item__top__highlight">{{ $t('exam.exam_1004') }}</span>
        </div>
        <div
          class="msg-item__name"
          @tap="checkExamDetail(source.content.exam_id, source.type)"
          @click="checkExamDetail(source.content.exam_id, source.type)"
        >
          <span>《{{ overHidden(source.content.exam_title, 23) }}》</span>
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
      checkExamDetail(exam_id, sourceType) {
        this.$emit('checkExamDetail', {
          examId: exam_id,
          sourceType: sourceType
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-msg-item {
    /* 默认风格 */
    .msg-item-template__interact {
      &.exam_msg_flex {
        @font-link: #3562fa;
        @font-click-detail: #0a7ff5;
        margin-bottom: 8px;
        .msg-item-template__interact-content {
        }
        .msg-item__top {
          display: flex;
          justify-content: center;
          color: var(--chat-exam-font-color-msg-text);
          &__highlight {
            padding-left: 8px;
            color: @font-click-detail;
          }
        }
        .msg-item__name {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 14px;
          text-align: left;
          color: #999999;
          margin-top: 4px;
          .highlight {
            padding-left: 0;
            color: @font-click-detail;
          }
        }
      }
    }
  }
</style>
