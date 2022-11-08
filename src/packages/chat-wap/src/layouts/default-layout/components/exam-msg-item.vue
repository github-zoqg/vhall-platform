<template>
  <!-- 
    推送-快问快答 paper_send
    公布-快问快答-成绩 paper_send_rank
    快问快答-收卷 paper_end
    快问快答-自动收卷 paper_auto_end
    快问快答-自动公布成绩 paper_auto_send_rank
   -->
  <div class="msg-item interact exam_msg_flex">
    <!-- 收到快问快答 -->
    <template v-if="source.type == 'paper_send'">
      <div
        class="interact-msg exam_msg_bg"
        @tap="checkExamDetail(source.content.exam_id, source.type)"
        @click="checkExamDetail(source.content.exam_id, source.type)"
      >
        {{ overHidden(source.nickname, 8) }}
        <span class="role" :class="source.roleName | roleClassFilter">
          <span>{{ source.roleName | roleFilter }}</span>
        </span>
        {{ source.content.text_content }}
        <span class="highlight">{{ $t('chat.chat_1093') }}</span>
      </div>
      <div
        class="interact-msg exam_msg_bg"
        @tap="checkExamDetail(source.content.exam_id, source.type)"
        @click="checkExamDetail(source.content.exam_id, source.type)"
      >
        <span class="highlight">{{ source.content.exam_title }}</span>
      </div>
    </template>
    <!-- 公布-快问快答-成绩 -->
    <template v-else-if="source.type == 'paper_send_rank'">
      <div
        class="interact-msg exam_msg_bg"
        @tap="checkExamDetail(source.content.exam_id, source.type)"
        @click="checkExamDetail(source.content.exam_id, source.type)"
      >
        {{ overHidden(source.nickname, 8) }}
        <span class="role" :class="source.roleName | roleClassFilter">
          <span>{{ source.roleName | roleFilter }}</span>
        </span>
        {{ source.content.text_content }}
        <span class="highlight">{{ $t('exam.exam_1004') }}</span>
      </div>
      <div
        class="interact-msg exam_msg_bg"
        @tap="checkExamDetail(source.content.exam_id, source.type)"
        @click="checkExamDetail(source.content.exam_id, source.type)"
      >
        <span class="highlight">{{ source.content.exam_title }}</span>
      </div>
    </template>
    <!-- 快问快答-收卷 -->
    <template v-else-if="source.type == 'paper_end'">
      <div class="interact-msg exam_msg_bg">
        {{ source.content.text_content }}
      </div>
      <div class="interact-msg exam_msg_bg">
        <span>{{ source.content.exam_title }}</span>
      </div>
    </template>
    <!-- 快问快答-自动收卷 -->
    <template v-else-if="source.type == 'paper_auto_end'">
      <div class="interact-msg exam_msg_bg">
        {{ source.content.text_content }}
      </div>
      <div class="interact-msg exam_msg_bg">
        <span>{{ source.content.exam_title }}</span>
      </div>
    </template>
    <!-- 公布-快问快答-自动公布成绩 -->
    <template v-else-if="source.type == 'paper_auto_send_rank'">
      <div
        class="interact-msg exam_msg_bg"
        @tap="checkExamDetail(source.content.exam_id, source.type)"
        @click="checkExamDetail(source.content.exam_id, source.type)"
      >
        {{ source.content.text_content }}
        <span class="highlight">{{ $t('exam.exam_1004') }}</span>
      </div>
      <div
        class="interact-msg exam_msg_bg"
        @tap="checkExamDetail(source.content.exam_id, source.type)"
        @click="checkExamDetail(source.content.exam_id, source.type)"
      >
        <span class="highlight">{{ source.content.exam_title }}</span>
      </div>
    </template>
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
<style lang="less"></style>
