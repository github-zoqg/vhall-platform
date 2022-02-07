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
        主办方：{{
          baseObj.webinar && baseObj.webinar.userinfo && baseObj.webinar.userinfo.nickname
        }}
      </p>
      <div class="tab-box">
        <ul class="tab-list">
          <li
            @click="select(index)"
            :class="['tab-li', { 'tab-li-active': index == active }]"
            v-for="(item, index) in List"
            :key="index"
          >
            {{ item.text }}
            <span class="count">({{ item.count | filterChatCount }})</span>
          </li>
          <li v-if="active == 2" class="reply-text">
            <!-- <el-checkbox @change='setReply'
              v-model="openReply">公开</el-checkbox>
            <el-checkbox @change='setReply'
              v-model="privacyReply">私密</el-checkbox> -->
          </li>
        </ul>
        <div class="exact-search">
          <el-select
            v-if="active == 2"
            v-model="testAnswer"
            @change="handleSearchQaList"
            slot="prepend"
            placeholder="请选择"
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
            placeholder="输入关键词/用户昵称"
            v-model="exactSearch['exactSearch' + active]"
            @keyup.enter.native="handleSearchQaList"
            @clear="clearSearchQaList"
            clearable
          ></el-input>
        </div>
        <div class="tab-content">
          <!-- 待处理 -->
          <ul
            :class="[
              'await-deal',
              { showPagination: activeObj.count > 20, topLine: awaitList.length > 0 }
            ]"
            v-show="active == 0"
          >
            <template v-if="awaitList.length > 0">
              <li v-for="(item, index) in awaitList" :key="index" class="clearFix">
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
                      <span>{{ item.nick_name | filterNickName }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content" style="margin-top: 2px">
                    <span class="tiwen">提问</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="fr">
                  <el-button @click="reply('text', item, index)" size="small" class="setBut">
                    文字回复
                  </el-button>
                  <el-button @click="reply('audio', item, index)" size="small" class="setBut">
                    在直播中回答
                  </el-button>
                  <!-- <span @click="reply('text', item, index)"
                    class="setBut">文字回复</span>
                  <span @click="reply('audio', item, index)"
                    class="setBut">在直播中回答此问题</span> -->
                  <el-dropdown @command="replyBut" class="setBut">
                    <el-button class="el-dropdown-link">更多</el-button>
                    <el-dropdown-menu slot="dropdown" class="qa-more__dropdown">
                      <el-dropdown-item :command="{ type: 'private', item: item, index }">
                        私聊
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ type: 'no', item: item, index }">
                        不处理
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
                <span>{{ isSearch ? '暂未搜索到您想要的内容' : '暂无数据' }}</span>
              </div>
            </template>
          </ul>
          <!-- 直播中回答 -->
          <ul
            class="await-deal text-deal"
            :class="{ topLine: audioList.length > 0 }"
            v-show="active == 1"
          >
            <template v-if="audioList.length > 0">
              <li v-for="(item, index) in audioList" :key="index" class="clearFix">
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
                      <span>{{ item.nick_name | filterNickName }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content">
                    <span class="tiwen">提问</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="fr">
                  <span class="answer-control-btn" @click="reply({ type: 'private' }, item, index)">
                    私聊
                  </span>
                  <span class="answer-control-btn" @click="reply('text', item, index)">
                    文字回复
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
                          {{ item.operator.nick_name | filterNickName }}
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
                        {{ item.operator.role_name | filterRoleName }}
                      </span>
                      <span class="answer-time">{{ item.operator.operate_time }}</span>
                    </p>
                    <p class="livein-processed">已在直播中回答此问题</p>
                  </li>
                </ul>
              </li>
            </template>
            <template v-else>
              <div class="no-default">
                <img v-if="this.isSearch" src="./images/no-search.png" alt="" />
                <img v-if="!this.isSearch" src="./images/no-create.png" alt="" />
                <span>{{ isSearch ? '暂未搜索到您想要的内容' : '暂无数据' }}</span>
              </div>
            </template>
          </ul>
          <!-- 文字回复 -->
          <ul
            class="await-deal text-deal"
            :class="{ topLine: textDealList.length > 0 }"
            v-show="active == 2"
          >
            <template v-if="textDealList.length > 0">
              <li v-for="(item, index) in textDealList" :key="index" class="clearFix">
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
                      <span>{{ item.nick_name | filterNickName }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content">
                    <span class="tiwen">提问</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="fr">
                  <span class="answer-control-btn" @click="reply({ type: 'private' }, item, index)">
                    私聊
                  </span>
                  <span class="answer-control-btn" @click="reply('text', item, index)">
                    文字回复
                  </span>
                </div>
                <ul class="answer">
                  <li
                    class="await-name"
                    v-for="(ite, ind) in item.answer"
                    style="padding-bottom: 0px"
                    :key="ind"
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
                        <span class="answer-time">{{ ite.nick_name | filterNickName }}</span>
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
                        {{ ite.role_name | filterRoleName }}
                      </span>
                      <span class="answer-time">{{ ite.created_at }}</span>
                      <template v-if="ite.is_open == 1">
                        <span v-if="ite.is_backout == 1" style="margin-left: 10px">已撤销</span>
                        <span
                          v-if="ite.is_backout == 0"
                          @click="revoke(ite, ind, index)"
                          class="answer-time answer-revoke"
                        >
                          撤销回复
                        </span>
                      </template>
                      <template v-if="ite.is_open == 0">
                        <span v-if="ite.is_backout == 1" style="margin-left: 10px">已撤销</span>
                        <span
                          v-if="ite.is_backout == 0"
                          @click="revoke(ite, ind, index)"
                          class="answer-time answer-revoke"
                        >
                          撤销回复
                        </span>
                      </template>
                    </p>
                    <!-- <p class="livein-processed">已在直播中回答此问题</p> -->
                    <p class="answer-text">
                      <span class="answer-tip">
                        {{ ite.is_open == 1 ? '公开回答' : '悄悄回答' }}
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
                <span>{{ isSearch ? '暂未搜索到您想要的内容' : '暂无数据' }}</span>
              </div>
            </template>
          </ul>
          <!-- 不处理 -->
          <ul
            class="no-deal await-deal"
            :class="{ topLine: noDealList.length > 0 }"
            v-show="active == 3"
          >
            <template v-if="noDealList.length > 0">
              <li v-for="(item, index) in noDealList" :key="index" class="clearFix">
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
                      <span>{{ item.nick_name | filterNickName }}</span>
                    </el-tooltip>
                    <span>{{ item.created_at }}</span>
                  </p>
                  <p class="await-content">
                    <span class="tiwen">提问</span>
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
                      <span class="ellsips">{{ item.operator.nick_name | filterNickName }}</span>
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
                      {{ item.operator.role_name | filterRoleName }}
                    </span>
                  </div>
                  <span>处理时间：{{ item.operator.operate_time }}</span>
                </div>
              </li>
            </template>
            <template v-else>
              <div class="no-default">
                <img v-if="this.isSearch" src="./images/no-search.png" alt="" />
                <img v-if="!this.isSearch" src="./images/no-create.png" alt="" />
                <span>{{ isSearch ? '暂未搜索到您想要的内容' : '暂无数据' }}</span>
              </div>
            </template>
          </ul>
          <div class="pagination" v-show="activeObj.count > 20">
            <el-pagination
              class="pagination-Bwrap"
              :total="activeObj.count"
              :current-page.sync="searchParams.page"
              :page-size="searchParams.page_size"
              @current-change="currentChangeHandler"
              align="center"
            ></el-pagination>
          </div>
          <!-- 私聊组件 -->
          <div class="messChat">
            <span class="messchat-btn" v-show="!privateFlag" @click="messClick">私聊</span>
          </div>
        </div>
      </div>
    </div>
    <div class="private-window" v-show="privateFlag">
      <PrivateChat
        ref="private"
        :userInfo="baseObj"
        :webinar_id="webinar_id"
        :onlyChatMess="onlyChatMess"
        :priteChatList="priteChatList"
        @close="privateClose"
        @sendMsg="privateSendMsg"
      ></PrivateChat>
    </div>
    <el-dialog
      title="文字回复"
      custom-class="text-reply"
      :visible.sync="textDalog"
      :close-on-click-modal="false"
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
      <div slot="footer">
        <span class="answer-btn default-answer-btn" @click="handlerAnswer('public')">公开回答</span>
        <span class="answer-btn" @click="handlerAnswer('private')">悄悄回答</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { useRoomBaseServer, useMsgServer, useQaServer } from 'middle-domain';
  import PrivateChat from './components/private-chat/index';
  import { getQueryString } from './utils';
  import { textToEmoji, textToEmojiText } from '@/packages/chat/src/js/emoji';
  export default {
    name: 'VmpQa',
    components: {
      PrivateChat
    },
    filters: {
      filterRoleName(val) {
        if (val == 'host' || val == 1) {
          return '主持人';
        } else if (val == 'assistant' || val == 3) {
          return '助理';
        } else if (val == 'guest' || val == 4) {
          return '嘉宾';
        } else {
          return '';
        }
      },
      filterNickName(val) {
        if (val.length > 8) {
          return val.substring(0, 8) + '...';
        } else {
          return val;
        }
      },
      filterChatCount: function (num) {
        if (num > 9999) {
          return 9999 + '+';
        } else {
          return num;
        }
      }
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
        active: 0, // 当前正在展示的Dom
        $Chat: null, // 聊天句柄
        privateFlag: false,
        textDalog: false, // 是否显示输入框
        // 当前展示 提交信息集合
        sendMessage: {
          text: '',
          Radio: '1' // 信息类型
        },
        // openReply: true, // 文字回复之公开
        // privacyReply: true, // 文字回复之隐私
        searchParams: {
          page_size: 20,
          page: 0
        },

        webinar_id: null,
        isSearch: false // 是否是正在搜索数据
      };
    },
    computed: {
      //主办方信息
      baseObj() {
        return this.$domainStore.state.qaServer.baseObj;
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
      testAnswer() {
        return this.$domainStore.state.qaServer.testAnswer;
      },
      testAnswerSelects() {
        return this.$domainStore.state.qaServer.testAnswerSelects;
      },
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
      this.qaServer = useQaServer();
      console.log('qa useMsgServer------>', useMsgServer);
    },
    async mounted() {
      this.webinar_id = this.$router.currentRoute.params.id;

      if (location.search.includes('assistant_token=')) {
        sessionStorage.setItem('vhall_client_token', getQueryString('assistant_token') || '');
      }

      await this.qaServer
        .InitChatMess({
          webinar_id: this.webinar_id
        })
        .catch(err => {
          this.$message.error(err.msg);
        });

      await this.getPrivateList();

      this.getChat(0); // 待处理
      this.getChat(1); // 不处理
      this.getChat(2); // 直播中回答
      this.setReply(); // 文字回复

      this.initChat();

      //事件监听
      // this.$EventBus.$on('question_answer_create', e => {
      //   // 发起端收到消息
      //   e.content = this.emojiToText(e.content);
      //   this.awaitList.push(e);
      //   this.$nextTick(() => {
      //     this.List[0].count = this.awaitList.length;
      //     console.warn(this.awaitList, 'this.awaitList');
      //   });
      // });
    },
    methods: {
      //获取私聊列表
      async getPrivateList() {
        await this.qaServer
          .getPrivateList({
            room_id: this.baseObj.interact.room_id,
            webinar_id: this.$router.currentRoute.params.id
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      },
      handlerAnswer(statu) {
        this.sendMessage.Radio = statu == 'public' ? 1 : 0;
        this.textReply();
      },
      // 检索问答
      handleSearchQaList() {
        const searchContent = this.exactSearch[`exactSearch${this.active}`];
        if (searchContent) {
          this.isSearch = true;
        }
        if (this.active == 2) {
          this.setReply(0, searchContent);
        } else {
          const active = this.active == 1 ? 2 : this.active == 3 ? 1 : 0;
          this.getChat(active, 0, searchContent);
        }
      },
      clearSearchQaList() {
        this.exactSearch[`exactSearch${this.active}`] = '';
        // 重新查询下数据
        this.handleSearchQaList();
      },
      select(index) {
        this.active = index;
        this.isSearch = false;
        // this.activeObj = Object.assign(this.activeObj, {
        //   active: index,
        //   count: this.List[index].count
        // });
        this.$nextTick(() => {
          this.searchParams.page = 1;
        });
        const searchContent = this.exactSearch[`exactSearch${this.active}`];
        if (searchContent) {
          this.isSearch = true;
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
        const searchContent = this.exactSearch[`exactSearch${this.active}`];
        if (searchContent) {
          this.isSearch = true;
        }
        if (this.active == 2) {
          this.setReply((val - 1) * 20, searchContent);
        } else {
          let type;
          switch (this.active) {
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
          .getAutherQa({
            room_id: this.baseObj.interact.room_id,
            type: type,
            limit: 20,
            keyword: str,
            pos: pagePos || 0,
            sort_sequence: 1 // 是否按序号正序排列 0 否 1 是
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      },
      setReply(pagePos, keyword) {
        // 文本回复  --- 设置回复 / 获取回复
        const openType = this.testAnswer;
        console.log(8888888, openType, typeof openType);
        const data = {
          room_id: this.baseObj.interact.room_id,
          is_open: openType, // 0 私密 1 公开 2 全部
          pos: typeof pagePos == 'number' || typeof pagePos == 'string' ? pagePos : 0,
          limit: 20,
          keyword: keyword || '',
          sort_sequence: 1
        };
        this.$fetch('v3GetTextReply', data).then(res => {
          if (res.code == 200) {
            try {
              res.data.list.forEach(item => {
                if (item.content) {
                  item.content = textToEmojiText(item.content);
                }
              });
            } catch (error) {
              console.warn(error, '聊天消息过滤错误');
            }
            this.textDealList = res.data.list;
            this.List[2].count = res.data.total;
            this.activeObj.count = res.data.total;
          } else {
            this.$message.error(res.msg);
          }
        });
      },
      // 更多（私聊 & 不处理）: 修复42302-标记为直播中回答时数组移除错误问题后引入的 不处理错误问题。
      replyBut(val) {
        this.reply(val, val.item, val.index);
      },
      reply(val, item, index) {
        console.log('&&&&&&&', val, item, index);
        if (typeof val == 'object') {
          if (val.type == 'private') {
            // 合并 当前数据
            this.onlyChatMess = {};
            console.warn(val, item, '点击的是私聊');
            const privateMess = Object.assign(val, { activeDom: this.active, Subscript: index });
            if (this.active != 0) {
              privateMess.item = item;
            } else {
              privateMess.Subscript = val.index;
            }
            privateMess.nickname = privateMess.item.nick_name;
            privateMess.join_id = privateMess.item.join_id;
            privateMess.avatar = item.avatar;
            console.warn('--------点击的是私聊---------------', privateMess);
            if (!this.privateFlag) {
              this.privateFlag = true;
            }
            this.onlyChatMess = privateMess;
          } else {
            console.warn('不处理----开始执行');
            const data = {
              question_id: val.item.id,
              room_id: this.baseObj.interact.room_id,
              type: 1,
              is_open: 1
            };
            this.$fetch('v3ReplayUserQu', data).then(res => {
              if (res.code == 200) {
                this.$nextTick(() => {
                  this.List[0].count--;
                  if (this.List[0].count <= 0) this.List[0].count = 0;
                  this.List[3].count++;
                  this.awaitList.splice(index, 1); // 修复40714-标记为直播中回答时数组移除错误问题
                });
              } else {
                this.$message.error(res.msg);
              }
            });
          }
        } else {
          if (val == 'text') {
            this.sendMessage.text = '';
            this.sendMessage.Radio = '1';
            this.sendMessage = Object.assign(this.sendMessage, item, {
              activeDom: this.active,
              index: index
            });
            this.textDalog = true;
          } else if (val == 'audio') {
            // 设置为直播中回答
            const data = {
              question_id: item.id,
              room_id: this.baseObj.interact.room_id,
              type: 2,
              is_open: 1
            };
            this.$fetch('v3ReplayUserQu', data).then(res => {
              if (res.code == 200) {
                this.$nextTick(() => {
                  this.List[0].count--;
                  this.awaitList.splice(index, 1); // 修复40714-标记为直播中回答时数组移除错误问题
                  this.List[1].count++;
                });
              }
            });
          }
        }
      },
      async messClick() {
        console.warn('点击的升级', this.priteChatList);
        this.privateFlag = true;
        await this.getPrivateList();
        if (!(this.onlyChatMess && this.onlyChatMess.type)) {
          this.onlyChatMess = this.priteChatList[0];
        }
        this.$nextTick(() => {
          if (this.priteChatList.length != 0) {
            this.$refs.private.getDefaultContent(this.priteChatList[0].user_id, 'father');
          }
        });
      },
      privateClose() {
        this.privateFlag = false;
      },
      privateSendMsg(data, msg) {
        this.$Chat.emit(data, msg);
      },
      revoke(val, index, fatherIndex) {
        // 撤销回复
        this.$fetch('v3Revoke', { answer_id: val.id, room_id: this.baseObj.interact.room_id }).then(
          res => {
            if (res.code == 200) {
              this.$nextTick(() => {
                this.textDealList[fatherIndex].answer[index].is_backout = 1;
              });
            } else {
              this.$message.error(res.msg);
            }
          }
        );
      },
      // 初始化
      initChat() {
        // const option = {
        //   appId: this.baseObj.interact.paas_app_id, // appId 必须
        //   accountId: this.baseObj.join_info.third_party_user_id, // 第三方用户ID
        //   channelId: this.baseObj.interact.channel_id, // 频道id 必须
        //   token: this.baseObj.interact.paas_access_token, // 必须， token，初始化接口获取
        //   hide: true
        // };
        // window.VhallChat.createInstance(
        //   option,
        //   event => {
        //     this.$Chat = event.message; // 聊天实例句柄
        //     window.privateChat = event.message;
        //     this.$refs.private.listener();
        //     this.monitor();
        //   },
        //   err => {
        //     console.error(err);
        //   }
        // );
        this.qaServer.InitChatInstance();
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
      // 监听
      monitor() {
        this.$Chat.onRoomMsg(msg => {
          if (typeof msg !== 'object') {
            msg = JSON.parse(msg);
          }
          try {
            if (msg.data && typeof msg.data !== 'object') {
              msg.data = JSON.parse(msg.data);
            }
          } catch (e) {
            console.log(e);
          }
          Object.assign(msg, msg.data);
          // 观看端发送问答进入的 type:question_answer_create
          this.$EventBus.$emit(msg.type, msg);
        });
      },
      textReply() {
        if (this.sendMessage.text.trim() == '') {
          return this.$message.warning('请输入回复内容!');
        }
        const data = {
          question_id: this.sendMessage.id,
          content: this.sendMessage.text,
          is_open: Number(this.sendMessage.Radio),
          type: 3,
          room_id: this.baseObj.interact.room_id
        };
        this.$fetch('v3ReplayUserQu', data).then(res => {
          console.warn(res.data, 12);
          if (res.code == 200) {
            this.textDalog = false;
            if (this.active != 2) {
              if (this.sendMessage.activeDom == 0) {
                // 点击的是待处理的 Dom
                this.awaitList.splice(this.sendMessage.index, 1);
              } else if (this.sendMessage.activeDom == 1) {
                // 点击的是直播中回答 Dom
                this.audioList.splice(this.sendMessage.index, 1);
              } else {
                // 点击的是文字回复 Dom
                this.textDealList.splice(this.sendMessage.index, 1);
              }
              this.List[2].count++;
              this.List[this.sendMessage.activeDom].count--;
              if (this.List[this.sendMessage.activeDom].count <= 0) {
                this.List[this.sendMessage.activeDom].count = 0;
              }
            } else {
              setTimeout(() => {
                this.setReply(0);
              }, 500);
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
    min-height: 780px;
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
    &::-webkit-scrollbar {
      width: 5px;
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
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
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
          .text-deal {
            &::-webkit-scrollbar {
              height: 6px;
              border-radius: 10px;
              background-color: #fff;
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
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
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
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
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
                  font-family: PingFangSC-Regular, PingFang SC;
                  font-weight: 400;
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
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
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
          height: calc(100% - 58px) !important;
        }
        .pagination {
          height: 60px;
          .pageBox {
            width: 100%;
            background: #fff;
            padding: 0;
            position: absolute;
            left: 50%;
            bottom: 0px;
            height: 60px;
            transform: translateX(-50%);
            .el-pagination {
              height: 100%;
              margin-top: 20px;
            }
          }
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
            // &.answer-title {
            // }
            .avatar {
              display: inline-block;
              width: 30px;
              height: 30px;
              border-radius: 16px;
              margin-right: 8px;
              vertical-align: top;
            }
            &:hover {
              .answer-revoke {
                display: inline-block;
              }
            }
            .role-host,
            .role-assis,
            .role-guest {
              min-width: 32px;
              height: 16px;
              border-radius: 9px;
              font-size: 12px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              line-height: 16px;
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
              display: none;
              margin-left: 10px;
              &:hover {
                color: #3562fa;
                cursor: pointer;
              }
            }
            .answer-tip {
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
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
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
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
      color: #fc5659;
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
        border-color: #fc5659;
        background: #fc5659;
      }
      width: 500px !important;
      height: 356px !important;
      .el-message-box__header {
        padding: 0;
      }

      .el-dialog__body {
        padding-top: 0px;
        .el-textarea__inner {
          height: 196px;
          color: #1a1a1a;
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
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
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
    .answer-btn {
      display: inline-block;
      width: 104px;
      height: 36px;
      border-radius: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      line-height: 20px;
      margin: 0px 8px;
      line-height: 36px;
      text-align: center;
      border: 1px solid #cccccc;
      &:hover {
        cursor: pointer;
        background: #fb3a32;
        color: #fff;
        border: 1px solid #fb3a32;
      }
      &.default-answer-btn {
        background: #fb3a32;
        color: #fff;
        border: 1px solid #fb3a32;
      }
      // font-size: 14px;
      // font-family: PingFangSC-Regular, PingFang SC;
      // font-weight: 400;
      // color: #ffffff;
      // line-height: 20px;
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
