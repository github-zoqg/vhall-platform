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
          <span class="question-reply" v-html="urlToLink(source.content)"></span>
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
            <span class="question-reply" v-html="urlToLink(source.answer.content)"></span>
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
    },
    methods: {
      // 将聊天消息中的链接用 a 标签包裹
      urlToLink(str) {
        if (!str) return '';

        // 提取聊天内容中的 img 标签
        const regImg = /<img.*?(?:>|\/>)/g;
        const imgArr = str.match(regImg);

        // 提取聊天内容中除去 img 标签以外的部分
        const strArr = str.split(regImg);
        // eslint-disable-next-line no-useless-escape
        const regUrl =
          /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/g;

        // 将聊天内容中除去 img 标签以外的聊天内容中的链接用 a 标签包裹
        strArr.forEach((item, index) => {
          const tempStr = item.replace(regUrl, function (match) {
            return `<a class='msg-item__content-body__content-link' href='${match}' target='_blank'>${match}</a>`;
          });
          strArr[index] = tempStr;
        });

        // 遍历 img 标签数组，将聊天内容中的 img 标签插回原来的位置
        if (imgArr) {
          const imgArrLength = imgArr.length;
          let imgIndex = 0;
          for (let strIndex = 0; strIndex < imgArrLength; ++strIndex) {
            strArr.splice(strIndex + imgIndex + 1, 0, imgArr[imgIndex]);
            imgIndex++;
          }
        }

        return strArr.join('');
      }
    }
  };
</script>
<style lang="less">
  .qa-item-wrapper {
    .msg-item__content-body__content-link {
      color: #3562fa;
      text-decoration: underline #3562fa !important;
    }
  }
</style>
