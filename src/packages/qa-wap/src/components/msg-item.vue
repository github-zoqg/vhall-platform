<template>
  <div
    :class="['qa-item-wrapper', { 'qa-last-ios-progress': index == length - 1 }]"
    v-if="
      source.join_id == joinId || (source.answer && source.answer.join_id == joinId) || !isOnlyMine
    "
  >
    <template>
      <div class="question">
        <div class="user">
          <span class="avatar-box">
            <img
              class="avatar"
              :src="
                source.avatar !== '0'
                  ? source.avatar || require(`../img/question.png`)
                  : require(`../img/question.png`)
              "
            />
          </span>
          <span class="nick-name">
            {{ source.data ? source.data.nick_name : source.nick_name }}
          </span>
          <span class="time">{{ source.created_time.slice(-8) }}</span>
        </div>
        <div class="content">
          <span class="question-label">{{ $t('chat.chat_1040') }}：</span>
          <span class="question-reply" v-html="source.content"></span>
        </div>
      </div>
      <template v-if="source.answer">
        <div class="answer">
          <div class="user">
            <span class="avatar-box">
              <img
                class="avatar"
                :src="
                  source.answer.avatar !== '0'
                    ? source.answer.avatar || require(`../img/question.png`)
                    : require(`../img/question.png`)
                "
              />
            </span>
            <span :class="['role', source.answer.role_name]">
              {{ source.answer.role_name | roleFilter }}
            </span>
            <span class="nick-name">{{ source.answer.nick_name }}</span>
            <span class="time">{{ source.answer.created_time.slice(-8) }}</span>
          </div>
          <div class="content">
            <span class="question-label">{{ $t('chat.chat_1041') }}：</span>
            <span class="question-reply" v-html="source.answer.content"></span>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
<script>
  export default {
    props: {
      index: {
        // 每一行的唯一索引
        type: Number
      },
      source: {
        type: Object,
        required: true,
        default: () => {}
      },
      isOnlyMine: {
        default: false
      },
      joinId: {},
      length: {}
    },
    computed: {
      customRoleName() {
        return this.$domainStore.state.roomBaseServer.customRoleName;
      }
    }
  };
</script>
