<template>
  <div class="new-qa">
    <div class="qa-wrap">
      <el-tooltip
        class="item"
        effect="dark"
        :content="baseObj.webinar && baseObj.webinar.subject"
        placement="top-start"
      >
        <h3 class="title ellsips">{{ baseObj.webinar && baseObj.webinar.subject }}</h3>
      </el-tooltip>
      <p class="host">
        {{ $t('nav.nav_1001') }}：{{
          baseObj.webinar && baseObj.webinar.userinfo && baseObj.webinar.userinfo.nickname
        }}
      </p>
      <div class="tab-box">
        <ul class="tab-list">
          <li
            @click="select(index)"
            :class="['tab-li', { 'tab-li-active': index == activeIndex }]"
            v-for="(item, index) in List"
            :key="index"
          >
            {{ item.text }}
            <span class="count">({{ item.count | filterChatCount }})</span>
          </li>
          <li v-if="activeIndex == 2" class="reply-text">
            <!-- <el-checkbox @change='setReply'
              v-model="openReply">公开</el-checkbox>
            <el-checkbox @change='setReply'
              v-model="privacyReply">私密</el-checkbox> -->
          </li>
        </ul>
        <div class="exact-search">
          <el-select
            v-if="activeIndex == 2"
            v-model="testAnswer"
            @change="handleSearchQaList"
            slot="prepend"
            :placeholder="$t('form.form_1018')"
          >
            <el-option
              v-for="item in testAnswerSelects"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-input
            class="exact-search-input"
            prefix-icon="el-icon-search"
            :placeholder="$t('form.form_1086')"
            v-model="exactSearch['exactSearch' + activeIndex]"
            @keyup.enter.native="handleSearchQaList"
            @clear="clearSearchQaList"
            clearable
          ></el-input>
        </div>
        <div class="tab-content" :class="[{ showPagination: activeObj.count > 20 }]">
          <!-- 待处理 -->
          <ul :class="['await-deal', { topLine: awaitList.length > 0 }]" v-show="activeIndex == 0">
            <template v-if="awaitList.length > 0">
              <li v-for="(item, index) in awaitList" :key="item.id" class="clearFix">
                <div class="fl">
                  <p class="await-name">
                    <span class="await-id" v-if="item.sequence">
                      {{ `${item.sequence}`.padStart(2, '0') }}
                    </span>
                    <img v-if="item.avatar" class="avatar" :src="item.avatar" />
                    <img v-else class="avatar" src="./images/answer_default.png" />
                    <!-- <div class="lf-content"> -->
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="item.nick_name"
                      placement="top-start"
                    >
                      <span>{{ item.nick_name | overHidden(8) }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content" style="margin-top: 2px">
                    <span class="tiwen">{{ $t('chat.chat_1040') }}</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="fr">
                  <el-button @click="reply('text', item, index)" size="small" class="setBut">
                    {{ $t('chat.chat_1082') }}
                  </el-button>
                  <el-button @click="reply('audio', item, index)" size="small" class="setBut">
                    {{ $t('chat.chat_1083') }}
                  </el-button>
                  <!-- <span @click="reply('text', item, index)"
                    class="setBut">{{ $t('chat.chat_1082') }}</span>
                  <span @click="reply('audio', item, index)"
                    class="setBut">在直播中回答此问题</span> -->
                  <el-dropdown @command="replyBut" class="setBut">
                    <el-button class="el-dropdown-link">{{ $t('chat.chat_1084') }}</el-button>
                    <el-dropdown-menu slot="dropdown" class="qa-more__dropdown">
                      <el-dropdown-item :command="{ type: 'private', item: item, index }">
                        {{ $t('common.common_1008') }}
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ type: 'no', item: item, index }">
                        {{ $t('chat.chat_1085') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </li>
            </template>
            <template v-else>
              <div class="no-default">
                <img v-if="this.isSearch" src="./images/no-search.png" alt="" />
                <img v-if="!this.isSearch" src="./images/no-create.png" alt="" />
                <span>
                  {{ isSearch ? $t('webinar.webinar_1042') : $t('webinar.webinar_1006') }}
                </span>
              </div>
            </template>
          </ul>
          <!-- 直播中回答 -->
          <ul
            class="await-deal text-deal"
            :class="{ topLine: audioList.length > 0 }"
            v-show="activeIndex == 1"
          >
            <template v-if="audioList.length > 0">
              <li v-for="(item, index) in audioList" :key="item.id" class="clearFix">
                <div class="fl">
                  <p class="await-name">
                    <span class="await-id" v-if="item.sequence">
                      {{ `${item.sequence}`.padStart(2, '0') }}
                    </span>
                    <img v-if="item.avatar" class="avatar" :src="item.avatar" />
                    <img v-else class="avatar" src="./images/answer_default.png" />
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="item.nick_name"
                      placement="top-start"
                    >
                      <span>{{ item.nick_name | overHidden(8) }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content">
                    <span class="tiwen">{{ $t('chat.chat_1040') }}</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="fr">
                  <span class="answer-control-btn" @click="reply({ type: 'private' }, item, index)">
                    {{ $t('common.common_1008') }}
                  </span>
                  <span class="answer-control-btn" @click="reply('text', item, index)">
                    {{ $t('chat.chat_1082') }}
                  </span>
                </div>
                <ul class="answer">
                  <li class="await-name">
                    <p class="answer-title">
                      <img v-if="item.operator.avatar" class="avatar" :src="item.operator.avatar" />
                      <img v-else class="avatar" src="./images/answer_default.png" />
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="item.operator.nick_name"
                        placement="top-start"
                      >
                        <span class="answer-time" style="color: #666">
                          {{ item.operator.nick_name | overHidden(8) }}
                        </span>
                      </el-tooltip>
                      <span
                        v-if="
                          item.operator.role_name == 'host' ||
                          item.operator.role_name == 'assistant' ||
                          item.operator.role_name == 'guest'
                        "
                        :class="{
                          'role-host': item.operator.role_name == 'host',
                          'role-assis':
                            item.operator.role_name == 'assistant' ||
                            item.operator.role_name == 'guest'
                        }"
                      >
                        {{ item.operator.role_name | roleFilter }}
                      </span>
                      <span class="answer-time">{{ item.operator.operate_time }}</span>
                    </p>
                    <p class="livein-processed">{{ $t('chat.chat_1086') }}</p>
                  </li>
                </ul>
              </li>
            </template>
            <template v-else>
              <div class="no-default">
                <img v-if="this.isSearch" src="./images/no-search.png" alt="" />
                <img v-if="!this.isSearch" src="./images/no-create.png" alt="" />
                <span>
                  {{ isSearch ? $t('webinar.webinar_1042') : $t('webinar.webinar_1006') }}
                </span>
              </div>
            </template>
          </ul>
          <!-- 文字回复 -->
          <ul
            class="await-deal text-deal"
            :class="{ topLine: textDealList.length > 0 }"
            v-show="activeIndex == 2"
          >
            <template v-if="textDealList.length > 0">
              <li v-for="(item, index) in textDealList" :key="item.id" class="clearFix">
                <div class="fl">
                  <p class="await-name">
                    <span class="await-id" v-if="item.sequence">
                      {{ `${item.sequence}`.padStart(2, '0') }}
                    </span>
                    <img v-if="item.avatar" class="avatar" :src="item.avatar" />
                    <img v-else class="avatar" src="./images/answer_default.png" />
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="item.nick_name"
                      placement="top-start"
                    >
                      <span>{{ item.nick_name | overHidden(8) }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content">
                    <span class="tiwen">{{ $t('chat.chat_1040') }}</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="fr">
                  <span class="answer-control-btn" @click="reply({ type: 'private' }, item, index)">
                    {{ $t('common.common_1008') }}
                  </span>
                  <span class="answer-control-btn" @click="reply('text', item, index)">
                    {{ $t('chat.chat_1082') }}
                  </span>
                </div>
                <ul class="answer">
                  <li
                    class="await-name"
                    v-for="(ite, ind) in item.answer"
                    style="padding-bottom: 0px"
                    :key="ite.id"
                  >
                    <p class="answer-title">
                      <img v-if="ite.avatar" class="avatar" :src="ite.avatar" />
                      <img v-else class="avatar" src="./images/answer_default.png" />
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="ite.nick_name"
                        placement="top-start"
                      >
                        <span class="answer-time">{{ ite.nick_name | overHidden(8) }}</span>
                      </el-tooltip>
                      <span
                        v-if="
                          ite.role_name == 'host' ||
                          ite.role_name == 'assistant' ||
                          ite.role_name == 'guest'
                        "
                        :class="{
                          'role-host': ite.role_name == 'host',
                          'role-assis': ite.role_name == 'assistant' || ite.role_name == 'guest'
                        }"
                      >
                        {{ ite.role_name | roleFilter }}
                      </span>
                      <span class="answer-time">{{ ite.created_at }}</span>
                      <template v-if="ite.is_open == 1">
                        <span v-if="ite.is_backout == 1" style="margin-left: 10px">
                          {{ $t('chat.chat_1087') }}
                        </span>
                        <span
                          v-if="ite.is_backout == 0"
                          @click="revoke(ite, ind, index)"
                          class="answer-time answer-revoke"
                        >
                          {{ $t('chat.chat_1088') }}
                        </span>
                      </template>
                      <template v-if="ite.is_open == 0">
                        <span v-if="ite.is_backout == 1" style="margin-left: 10px">
                          {{ $t('chat.chat_1087') }}
                        </span>
                        <span
                          v-if="ite.is_backout == 0"
                          @click="revoke(ite, ind, index)"
                          class="answer-time answer-revoke"
                        >
                          {{ $t('chat.chat_1088') }}
                        </span>
                      </template>
                    </p>
                    <!-- <p class="livein-processed">{{ $t('chat.chat_1086') }}</p> -->
                    <p class="answer-text">
                      <span class="answer-tip">
                        {{ ite.is_open == 1 ? $t('chat.chat_1089') : $t('chat.chat_1090') }}
                      </span>
                      <span v-html="ite.content"></span>
                    </p>
                  </li>
                </ul>
              </li>
            </template>
            <template v-else>
              <div class="no-default">
                <img v-if="this.isSearch" src="./images/no-search.png" alt="" />
                <img v-if="!this.isSearch" src="./images/no-create.png" alt="" />
                <span>
                  {{ isSearch ? $t('webinar.webinar_1042') : $t('webinar.webinar_1006') }}
                </span>
              </div>
            </template>
          </ul>
          <!-- 不处理 -->
          <ul
            class="no-deal await-deal"
            :class="{ topLine: noDealList.length > 0 }"
            v-show="activeIndex == 3"
          >
            <template v-if="noDealList.length > 0">
              <li v-for="item in noDealList" :key="item.id" class="clearFix">
                <div class="fl">
                  <p class="await-name">
                    <span class="await-id" v-if="item.sequence">
                      {{ `${item.sequence}`.padStart(2, '0') }}
                    </span>
                    <img v-if="item.avatar" class="avatar" :src="item.avatar" />
                    <img v-else class="avatar" src="./images/answer_default.png" />
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="item.nick_name"
                      placement="top-start"
                    >
                      <span>{{ item.nick_name | overHidden(8) }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content">
                    <span class="tiwen">{{ $t('chat.chat_1040') }}</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="no-deal-fr">
                  <div class="no-deal-fr-top">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="item.operator.nick_name"
                      placement="top-start"
                    >
                      <span class="ellsips">{{ item.operator.nick_name | overHidden(8) }}</span>
                    </el-tooltip>
                    <span
                      class="role-name"
                      :class="{
                        rolehost: item.operator.role_name == 'host',
                        roleassistant:
                          item.operator.role_name == 'guest' ||
                          item.operator.role_name == 'assistant'
                      }"
                    >
                      {{ item.operator.role_name | roleFilter }}
                    </span>
                  </div>
                  <span>{{ $t('chat.chat_1091') }}: {{ item.operator.operate_time }}</span>
                </div>
              </li>
            </template>
            <template v-else>
              <div class="no-default">
                <img v-if="this.isSearch" src="./images/no-search.png" alt="" />
                <img v-if="!this.isSearch" src="./images/no-create.png" alt="" />
                <span>
                  {{ isSearch ? $t('webinar.webinar_1042') : $t('webinar.webinar_1006') }}
                </span>
              </div>
            </template>
          </ul>
          <div class="pagination" v-show="activeObj.count > 20">
            <el-pagination
              :total="activeObj.count"
              :current-page.sync="searchParams.page"
              :page-size="searchParams.page_size"
              @current-change="currentChangeHandler"
              align="center"
            ></el-pagination>
          </div>
          <div class="messChat">
            <span class="messchat-btn" @click="messClick">
              {{ $t('common.common_1008') }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <PrivateChat v-if="ready" ref="privateChat"></PrivateChat>
    <el-dialog
      :title="$t('chat.chat_1082')"
      custom-class="text-reply"
      :visible="textDialogStatus"
      :close-on-click-modal="false"
      :before-close="handleCloseChatDialog"
      width="50%"
    >
      <div id="send-content" class="send-content">
        <el-input
          type="textarea"
          :rows="5"
          resize="none"
          v-model.trim="sendMessage.text"
        ></el-input>
        <span class="len-tip">
          <i
            :class="{
              normal: sendMessage.text.length > 0 && sendMessage.text.length < 1000,
              err: sendMessage.text.length >= 1000
            }"
          >
            {{ sendMessage.text.length }}
          </i>
          /
          <i>1000</i>
        </span>
      </div>
      <div class="footer">
        <el-button type="primary" round @click="handlerAnswer('public')">
          {{ $t('chat.chat_1089') }}
        </el-button>
        <el-button round @click="handlerAnswer('private')">{{ $t('chat.chat_1090') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { useRoomBaseServer, useQaAdminServer, Domain, useMsgServer } from 'middle-domain';
  import PrivateChat from '@/packages/live-private-chat/src/main.vue';
  import { textToEmoji } from '@/packages/chat/src/js/emoji';
  import { debounce, getQueryString } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpQaAdmin',
    components: {
      PrivateChat
    },
    watch: {
      'sendMessage.text.length': {
        handler(val) {
          const str = this.sendMessage.text;
          if (val >= 1000) {
            this.sendMessage.text = str.substring(0, 1000);
          } else {
            this.sendMessage.text = str;
          }
        },
        immediate: true
      }
    },
    data() {
      return {
        $Chat: null, // 聊天句柄
        ready: false,
        privateFlag: false,
        testAnswer: 2,
        testAnswerSelects: [
          {
            label: '全部回答',
            value: 2
          },
          {
            label: '公开回答',
            value: 1
          },
          {
            label: '悄悄回答',
            value: 0
          }
        ],
        // openReply: true, // 文字回复之公开
        // privacyReply: true, // 文字回复之隐私
        searchParams: {
          page_size: 20,
          page: 0
        },
        webinar_id: null
      };
    },
    computed: {
      //主办方信息
      baseObj() {
        return this.$domainStore.state.qaServer.baseObj;
      },
      activeIndex() {
        return this.$domainStore.state.qaServer.activeIndex;
      },
      isSearch() {
        return this.$domainStore.state.qaServer.isSearch;
      },
      textDialogStatus() {
        return this.$domainStore.state.qaServer.textDialogStatus;
      },
      sendMessage() {
        return this.$domainStore.state.qaServer.sendMessage;
      },
      awaitList() {
        return this.$domainStore.state.qaServer.awaitList;
      }, // 待处理
      textDealList() {
        return this.$domainStore.state.qaServer.textDealList;
      }, // 文字回复
      audioList() {
        return this.$domainStore.state.qaServer.audioList;
      }, // 直播中回答
      noDealList() {
        return this.$domainStore.state.qaServer.noDealList;
      }, // 不处理
      activeObj() {
        return this.$domainStore.state.qaServer.activeObj;
      },
      List() {
        return this.$domainStore.state.qaServer.List;
      },
      exactSearch() {
        return this.$domainStore.state.qaServer.exactSearch;
      },
      // testAnswer() {
      //   return this.$domainStore.state.qaServer.testAnswer;
      // },
      // testAnswerSelects() {
      //   return this.$domainStore.state.qaServer.testAnswerSelects;
      // },
      onlyChatMess() {
        return this.$domainStore.state.qaServer.onlyChatMess;
      },
      priteChatList() {
        return this.$domainStore.state.qaServer.priteChatList;
      },
      filterTime() {
        return function (time) {
          return this.$moment(time).format('HH:mm');
        };
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.qaServer = useQaAdminServer();
    },
    async created() {
      this.webinar_id = this.$router.currentRoute.params.id;
      const { liveT = '', live_token = '' } = this.$route.query;
      if (location.search.includes('assistant_token=')) {
        sessionStorage.setItem('vhall_client_token', getQueryString('assistant_token') || '');
      }
      await new Domain({
        plugins: ['chat'],
        requestBody: {
          live_token: liveT || live_token
        },
        isNotInitRoom: true
      });
      const watchInitData = await this.qaServer
        .initChatMess({
          webinar_id: this.webinar_id
        })
        .then(res => {
          this.roomBaseServer.state.watchInitData = res.data;
          return res.data;
        })
        .catch(err => {
          this.$message.error(err.msg);
        });

      await useMsgServer().initMaintMsg({ ...watchInitData, hide: 1 });
      await Promise.all([this.roomBaseServer.getCustomRoleName(), this.chatPrivateGetRankList()]);

      this.getChat(0); // 待处理
      this.getChat(1); // 不处理
      this.getChat(2); // 直播中回答
      this.setReply(); // 文字回复

      this.qaServer.initQaAdmin();
      this.ready = true;
    },
    methods: {
      /**
       * 关闭文字回复窗口
       */
      handleCloseChatDialog() {
        this.qaServer.setState('textDialogStatus', false);
      },
      //获取私聊列表
      async chatPrivateGetRankList() {
        await this.qaServer
          .chatPrivateGetRankList({
            room_id: this.baseObj.interact.room_id,
            webinar_id: this.$router.currentRoute.params.id
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      },
      handlerAnswer(status) {
        this.qaServer.handlerAnswer(status);
        this.textReply();
      },
      // 检索问答
      handleSearchQaList() {
        const searchContent = this.exactSearch[`exactSearch${this.activeIndex}`];
        if (searchContent) {
          this.qaServer.setState('isSearch', true);
        }
        if (this.activeIndex == 2) {
          this.setReply(0, searchContent);
        } else {
          const activeIndex = this.activeIndex == 1 ? 2 : this.activeIndex == 3 ? 1 : 0;
          this.getChat(activeIndex, 0, searchContent);
        }
      },
      clearSearchQaList() {
        this.exactSearch[`exactSearch${this.activeIndex}`] = '';
        // 重新查询下数据
        this.handleSearchQaList();
      },
      select(index) {
        this.searchParams.page = 1;
        this.qaServer.setState('activeIndex', index);
        this.qaServer.setState('isSearch', false);
        const searchContent = this.exactSearch[`exactSearch${this.activeIndex}`];
        if (searchContent) {
          this.qaServer.setState('isSearch', true);
        }
        // 0 未处理 1 不处理 2 直播中回答 3 文字回复
        switch (index) {
          case 0:
            this.getChat(0, 0, searchContent);
            break;
          case 1:
            this.getChat(2, 0, searchContent);
            break;
          case 2:
            // 获取文字回复
            this.setReply(0, searchContent);
            break;
          case 3:
            this.getChat(1, 0, searchContent);
            break;
        }
      },
      currentChangeHandler(val) {
        console.warn('页码的点击效果----', val);
        const searchContent = this.exactSearch[`exactSearch${this.activeIndex}`];
        if (searchContent) {
          this.qaServer.setState('isSearch', true);
        }
        if (this.activeIndex == 2) {
          this.setReply((val - 1) * 20, searchContent);
        } else {
          let type;
          switch (this.activeIndex) {
            case 0:
              type = 0;
              break;
            case 1:
              type = 2;
              break;
            case 3:
              type = 1;
              break;
          }
          this.getChat(type, (val - 1) * 20, searchContent);
        }
      },
      getChat(type, pagePos, str) {
        this.qaServer
          .getQuestionByStatus({
            room_id: this.baseObj.interact.room_id,
            type: type,
            limit: 20,
            keyword: str,
            pos: pagePos || 0,
            sort_sequence: 1 // 是否按序号正序排列 0 否 1 是
          })
          .catch(err => {
            // this.$message.error(err.msg);
          });
      },
      setReply(pagePos, keyword) {
        // 文本回复  --- 设置回复 / 获取回复
        const openType = this.testAnswer;
        const data = {
          room_id: this.baseObj.interact.room_id,
          is_open: openType, // 0 私密 1 公开 2 全部
          pos: typeof pagePos == 'number' || typeof pagePos == 'string' ? pagePos : 0,
          limit: 20,
          keyword: keyword || '',
          sort_sequence: 1
        };
        this.qaServer.getTextReply(data);
      },
      // 更多（私聊 & 不处理）: 修复42302-标记为直播中回答时数组移除错误问题后引入的 不处理错误问题。
      replyBut(val) {
        this.reply(val, val.item, val.index);
      },
      reply: debounce(async function (val, item, index) {
        if (typeof val == 'object') {
          if (val.type == 'private') {
            await this.$refs.privateChat.openModal();
            this.$nextTick(() => {
              this.$refs.privateChat.addChatItem({
                type: 1,
                id: item.join_id,
                account_id: item.account_id,
                chat_name: item.nick_name,
                avatar: item.avatar
              });
            });
          } else {
            this.qaServer
              .replyUserQuestion({
                question_id: val.item.id,
                room_id: this.baseObj.interact.room_id,
                type: 1,
                is_open: 1
              })
              .then(res => {
                if (res.code != 200) {
                  this.$message.error(res.msg);
                }
              });
          }
        } else {
          if (val == 'text') {
            this.qaServer.replayIsText(item, index);
          } else if (val == 'audio') {
            // 设置为直播中回答
            this.qaServer
              .replyUserQuestion({
                question_id: item.id,
                room_id: this.baseObj.interact.room_id,
                type: 2,
                is_open: 1
              })
              .then(res => {
                if (res.code != 200) {
                  this.$message.error(res.msg);
                }
              });
          }
        }
      }, 300),
      async messClick() {
        console.warn('qa messClick---------->', this.priteChatList);
        this.privateFlag = true;
        await this.chatPrivateGetRankList().then(res => {});
        this.$refs.privateChat.openModal();
        //todo 调用私聊组件中的方法, 需要通过事件驱动
        // this.$nextTick(() => {
        //   if (this.priteChatList.length != 0) {
        //     this.$refs.private.getDefaultContent(this.priteChatList[0].user_id, 'father');
        //   }
        // });
      },
      privateClose() {
        this.privateFlag = false;
      },
      // 撤销回复
      revoke(val, index, fatherIndex) {
        this.qaServer
          .revokeReply({
            answer_id: val.id,
            room_id: this.baseObj.interact.room_id,
            index: index,
            father_index: fatherIndex
          })
          .then(res => {
            if (res.code != 200) {
              this.$message.error(res.msg);
            }
          });
      },
      emojiToText(content) {
        return textToEmoji(content)
          .map(c => {
            return c.msgType == 'text'
              ? c.msgCont
              : `<img width="24" src="${c.msgImage}" border="0" />`;
          })
          .join(' ');
      },
      textReply() {
        if (this.sendMessage.text.trim() == '') {
          return this.$message.warning('请输入回复内容!');
        }
        this.qaServer
          .replyUserQuestion({
            question_id: this.sendMessage.id,
            content: this.sendMessage.text,
            is_open: Number(this.sendMessage.Radio),
            type: 3,
            room_id: this.baseObj.interact.room_id
          })
          .then(res => {
            if (res.code == 200) {
              if (this.activeIndex == 2) {
                //发送回复后延时调用拉取列表接口，防止后端入库未完成，列表未更新
                setTimeout(() => {
                  this.setReply(0);
                }, 1000);
              }
            }
          });
      }
    }
  };
</script>

<style lang="less">
  .el-dropdown-menu {
    &.qa-more__dropdown {
      background-color: #fff;
      border: 1px solid #ebeef5;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .el-dropdown-menu__item {
        &:focus,
        &:not(.is-disabled):hover {
          color: #606266;
          background-color: #ecf5ff;
        }
      }

      &.el-popper[x-placement^='bottom'] .popper__arrow {
        border-bottom-color: transparent;
      }
      &.el-popper[x-placement^='bottom'] .popper__arrow::after {
        border-bottom-color: #fff;
      }
      &.el-popper[x-placement^='top'] .popper__arrow {
        border-top-color: transparent;
      }
      &.el-popper[x-placement^='top'] .popper__arrow::after {
        border-top-color: #fff;
      }
    }
  }

  .new-qa {
    background: #f7f7f7;
    height: 100%;
    .fl {
      float: left;
    }
    .clearFix:after {
      clear: both;
      content: '';
      display: block;
      width: 0;
      height: 0;
      visibility: hidden;
    }
    .qa-wrap {
      width: 720px;
      margin: 0 auto;
      height: 100%;
      padding: 0 150px;
      background: #fff;
      .title {
        padding-top: 30px;
        font-size: 20px;
        font-weight: 500;
        color: #1a1a1a;
      }
      .host {
        margin: 4px auto 24px;
        font-size: 14px;
        color: #666666;
      }
      .tab-box {
        min-width: 700px;
        height: calc(100% - 200px);
        .tab-list {
          height: 44px;
          line-height: 44px;
          .tab-li {
            display: inline-block;
            min-width: 120px;
            text-align: center;
            background: #f7f7f7;
            margin-right: 3px;
            position: relative;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            border: 1px solid #e6e6e6;
            font-size: 14px;
            line-height: 42px;
            margin-top: 1px;
            cursor: pointer;
            .border {
              display: none;
              border: 2px solid red;
              background: red;
              width: calc(100% - 4px);
              position: absolute;
              top: 0;
              left: 0;
            }
            &-active {
              color: #fb3a32;
              font-weight: bold;
              background: #fff;
              border-bottom: 1px solid #fff;
              .count {
                color: #fb3a32;
              }
              .border {
                display: inline-block;
              }
            }
            &:hover {
              color: #fb3a32;
            }
          }
          .reply-text {
            width: 140px;
            height: calc(100% - 2px);
            float: right;
            .el-checkbox {
              margin-right: 0;
              &:nth-child(1) {
                margin-right: 15px;
              }
            }
          }
        }
        .tab-content {
          height: calc(100% - 44px);
          position: relative;
          ul {
            height: 100%;
            overflow-y: auto;
          }
          .await-deal {
            &.topLine {
              border-top: 1px solid #e6e6e6;
            }
            .await-id {
              width: 30px;
              height: 14px;
              font-size: 16px;
              font-family: Arial-ItalicMT, Arial;
              font-weight: normal;
              color: #1a1a1a;
              line-height: 14px;
              margin-top: 4px;
              float: left;
            }
            font-size: 14px;
            li {
              border-bottom: 1px solid #e6e6e6;
              padding: 20px 20px;
              &:hover {
                background: #f7f7f7;
              }
            }
            .fl {
              width: calc(100% - 350px);
              .await-name {
                color: #666666;
                .lf-content {
                  display: inline-block;
                  vertical-align: top;
                }
                .avatar {
                  display: inline-block;
                  width: 30px;
                  height: 30px;
                  border-radius: 16px;
                  margin-right: 10px;
                  vertical-align: top;
                }
                span {
                  margin-right: 5px;
                }
                .mark {
                  margin: 0 10px;
                }
              }
              .await-content {
                width: 454px;
                padding-left: 75px;
                color: #1a1a1a;
                line-height: 22px;
                margin-top: -10px;
                .tiwen {
                  margin-right: 8px;
                  color: #fc9600;
                }
                .content-text {
                  word-break: break-all;
                }
              }
            }
            .fr {
              float: right;
              width: 350px;
              text-align: right;
              .el-dropdown-link {
                margin: 0 8px;
                border: none;
                &:hover {
                  color: #fb3a32;
                }
              }
              .el-button {
                padding: 0px;
                margin: 0 8px;
                background: transparent;
                border: none;
                span {
                  color: #1a1a1a;
                }

                &:hover {
                  span {
                    color: #fb3a32;
                  }
                }
              }
              .answer-control-btn {
                font-size: 14px;
                color: #1a1a1a;
                line-height: 14px;
                margin: 0px 8px;
                &:hover {
                  cursor: pointer;
                  color: #fb3a32;
                }
              }
            }
            .no-default {
              display: flex;
              flex-direction: column;
              justify-content: center;
              margin: 100px auto;
              img {
                display: inline-block;
                width: 140px;
                height: 140px;
                margin: 0px auto;
              }
              span {
                margin: 0px auto;
                color: #666666;
              }
            }
          }
          .messChat {
            position: fixed;
            width: 80px;
            height: 80px;
            background: #fb3a32;
            box-shadow: 0px 2px 12px 0px rgba(207, 45, 48, 0.7),
              0px 1px 2px 0px rgba(220, 64, 66, 0.5);
            bottom: 40px;
            right: 100px;
            border-radius: 40px;
            // &:hover {
            //   cursor: pointer;
            // }
            .messchat-btn {
              display: inline-block;
              border: none;
              padding: 5px 20px;
              width: 100%;
              height: 100%;
              position: absolute;
              top: 50%;
              left: 50%;
              font-size: 14px;
              color: #fff;
              border: none;
              transform: translate(-50%, -50%);
              background: transparent;
              line-height: 80px;
              text-align: center;
              &:hover {
                cursor: pointer;
              }
            }
          }
          // .messChat {
          //   position: absolute;
          //   bottom: 0;
          //   right: 0;
          //   .el-button {
          //     background: #169bd5;
          //     color: #fff;
          //     border: none;
          //     padding: 5px 20px;
          //   }
          // }
          .no-deal {
            .no-deal-fr {
              font-size: 14px;
              color: #1a1a1a;
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              justify-content: flex-end;

              span {
                float: right;
                height: 14px;
                font-size: 14px;
                line-height: 14px;
              }
              span:nth-child(1) {
                margin-bottom: 8px;
              }
              &-top {
                min-width: 60px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-around;
                color: #666666;
                .role-name {
                  margin-bottom: 8px;
                  margin-left: 8px;
                }
                .rolehost,
                .roleassistant {
                  display: inline-block;
                  min-width: 30px;
                  border-radius: 9px;
                  font-size: 12px;
                  line-height: 16px;
                  padding: 0px 4px;
                  height: 16px;
                  text-align: center;
                }
                .rolehost {
                  color: #fb3a32;
                  background: rgba(251, 58, 50, 0.2);
                }
                .roleassistant {
                  color: #0a7ff5;
                  background: #ade1ff;
                }
              }
              .answer-control-btn {
                font-size: 14px;
                color: #1a1a1a;
                line-height: 14px;
                margin: 0px 8px;
                &:hover {
                  cursor: pointer;
                  color: #fb3a32;
                }
              }
            }
          }
        }
        .showPagination {
          height: calc(100% - 120px);
        }
        .pagination {
          height: 60px;
        }
        // 文字回复  回答
        .answer {
          font-size: 14px;
          color: #666666;
          width: 100%;
          border: none;
          li {
            border: none !important;
            position: relative;
            margin-left: 54px;
          }
          p {
            &.answer-title {
              span {
                line-height: 16px;
                display: inline-block;
                &.answer-revoke {
                  display: none;
                }
              }
            }
            .avatar {
              display: inline-block;
              width: 30px;
              height: 30px;
              border-radius: 16px;
              margin-right: 8px;
              vertical-align: top;
            }
            &:hover {
              span {
                &.answer-revoke {
                  display: inline-block;
                }
              }
            }
            .role-host,
            .role-assis,
            .role-guest {
              min-width: 32px;
              height: 16px;
              border-radius: 9px;
              font-size: 12px;
              padding: 0px 4px;
              margin-left: 12px;
              margin-right: 16px;
            }
            .role-host {
              color: #fb3a32;
              background: rgba(251, 58, 50, 0.2);
            }
            .role-assis {
              background: #ade1ff;
              color: #0a7ff5;
            }

            .answer-open {
              padding: 3px 8px;
              background: #169bd5;
              color: #fff;
              font-size: 14px;
              margin-right: 14px;
            }
            .privacy {
              background: #ff9933;
            }
            .answer-revoke {
              text-decoration: none;
              color: #1a1a1a;
              font-size: 14px;
              margin-left: 10px;
              &:hover {
                color: #3562fa;
                cursor: pointer;
              }
            }
            .answer-tip {
              font-size: 14px;
              color: #fc9600;
              margin-right: 10px;
              line-height: 20px;
            }
            &.answer-text {
              display: inline-block;
              color: #1a1a1a;
              line-height: 22px;
              word-break: break-all;
              margin-left: 40px;
              width: 414px;
              margin-top: -10px;
            }
            &.livein-processed {
              margin-left: 38px;
              margin-top: -10px;
              color: #fa9a32;
              display: inline-block;
              line-height: 22px;
            }
          }
        }
      }

      .el-pagination {
        margin-top: 30px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .el-pager {
          .number {
            border: 1px solid #cccccc;
            margin: 0px 4px !important;
            border-radius: 3px;
            width: 32px !important;
            height: 32px !important;
            &:not(.disabled).active {
              background-color: #fb3a32;
              border-color: transparent;
              color: #fff;
            }
          }
        }
        .btn-next,
        .btn-prev {
          border: 1px solid #cccccc;
          margin: 0px 4px !important;
          border-radius: 3px;
          width: 32px !important;
          height: 32px !important;
        }

        .el-pagination__rightwrapper {
          font-size: 14px;
          color: #666666;
          line-height: 20px;
        }
        &.is-background {
          .btn-next,
          .btn-prev,
          .el-pager li {
            background-color: #fff;
          }
        }
      }
    }
    .ellsips {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
    .send-right {
      padding: 9px 48px !important;
      color: #333;
    }
    .el-radio__input.is-checked + .el-radio__label {
      color: #fb3a32;
    }

    .exact-search {
      width: 100%;
      height: 40px;
      padding-top: 24px;
      padding-bottom: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      .el-select {
        margin-right: 20px;
        .el-input {
          &.is-focus {
            .el-input__inner {
              border-color: #999;
            }
          }
        }
      }
      .el-input--prefix {
        .el-input__inner {
          padding-left: 35px;
        }
      }
      .el-input__inner {
        border-radius: 20px;
        &:focus {
          border-color: #999;
          color: #1a1a1a;
        }
      }
      .exact-search-input {
        width: 220px;
        .el-input__prefix {
          left: 10px;
          top: 2px;
        }
      }
    }
    // 问答管理 回复
    .text-reply {
      .el-radio__input.is-checked .el-radio__inner {
        border-color: #fb3a32;
        background: #fb3a32;
      }
      width: 500px !important;
      .footer {
        padding-top: 20px;
        text-align: right;
      }
      // height: 356px !important;
      .el-message-box__header {
        padding: 0;
      }
      .el-dialog__header {
        padding: 24px 32px;
      }
      .el-dialog__body {
        padding-top: 0px;
        .el-textarea__inner {
          height: 196px;
          color: #1a1a1a;
          padding-top: 10px;
          padding-bottom: 10px;
        }
        .el-button + .el-button {
          margin-left: 16px;
        }
      }
      .send-left {
        display: inline-block;
        width: 140px;
        margin-right: 20px;
      }
    }
    .send-content {
      width: 436px;
      height: 196px;
      position: relative;
      .el-textarea {
        width: 100%;
        height: 100%;
      }
      .len-tip {
        position: absolute;
        bottom: 4px;
        right: 4px;
        font-size: 14px;
        color: #999999;
        line-height: 24px;
        i {
          font-style: normal;
        }
        .normal {
          color: #3562fa;
        }
        .err {
          color: #fb2626;
        }
      }
    }
    .setBut,
    .el-dropdown-link {
      color: #1a1a1a;
    }
    .private-window {
      position: fixed;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
    }
  }
</style>
