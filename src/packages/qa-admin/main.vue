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
      <p class="new-qa__title__name">
        <span class="new-qa__link" @click.stop.prevent="setUpdateQaShowNameDialog('show')">
          修改「问答」显示名称
        </span>
        <span class="new-qa__text">当前为「{{ qaName }}」</span>
      </p>

      <div class="tab-box">
        <!-- tab部分 -->
        <ul class="tab-list">
          <li
            @click="select(index, 'tab')"
            :class="['tab-li', { 'tab-li-active': index == activeIndex }]"
            v-for="(item, index) in List"
            :key="index"
          >
            {{ item.text }}
            <span class="count">({{ item.count | filterChatCount }})</span>
          </li>
        </ul>
        <!-- 查询条件过滤部分  -->
        <div class="exact-search">
          <!-- 选择本页 -->
          <el-checkbox
            class="new-qa__inline checkAll"
            v-model="checkAll"
            v-if="activeIndex === 0 || activeIndex === 1"
            @change="changeAllChecked"
          >
            选择本页
          </el-checkbox>
          <!-- 标记为不处理 -->
          <el-button
            round
            class="new-qa__inline unexact"
            v-if="activeIndex === 0"
            :disabled="!(questionIds && questionIds.length)"
            @click="handleEditBatchStatusOrDelMulti('unExact')"
          >
            批量标记为「不处理」
          </el-button>
          <!-- 批量删除 -->
          <el-button
            round
            class="new-qa__inline multiDel"
            v-if="activeIndex === 1"
            :disabled="!(questionIds && questionIds.length)"
            @click="handleEditBatchStatusOrDelMulti('delMulti')"
          >
            批量删除
          </el-button>
          <el-tooltip placement="right" v-if="activeIndex === 0 || activeIndex === 1">
            <div slot="content">
              <div class="doc-help-tips">
                <p>批量操作最多仅支持500条数据，更多勾选则不生效</p>
              </div>
            </div>
            <i class="el-tooltip vh-iconfont vh-line-question help-icon"></i>
          </el-tooltip>

          <!-- 下拉筛选-->
          <el-select
            v-if="activeIndex == 1"
            v-model="testAnswer"
            @change="handleSearchQaList"
            slot="prepend"
            :placeholder="$t('form.form_1018')"
            class="new-qa__inline select"
          >
            <el-option
              v-for="item in testAnswerSelects"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <!-- 关键词/用户昵称 筛选-->
          <el-input
            class="new-qa__inline exact-search-input"
            prefix-icon="el-icon-search"
            :placeholder="$t('form.form_1086')"
            v-model="exactSearch['exactSearch' + activeIndex]"
            @keyup.enter.native="handleSearchQaList"
            @clear="clearSearchQaList"
            clearable
          ></el-input>
        </div>
        <div class="tab-content" :class="[{ showPagination: activeObj.count > 20 }]">
          <!--  // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
          // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答 -->
          <!-- 待处理 -->
          <ul :class="['await-deal', { topLine: awaitList.length > 0 }]" v-show="activeIndex == 0">
            <template v-if="awaitList.length > 0">
              <li
                v-for="(item, index) in awaitList"
                :key="item.id"
                :class="['clearFix', { 'item-active': item.isCheckBox }]"
              >
                <div class="fl">
                  <p class="await-name">
                    <el-checkbox
                      class="await-item-checkItem"
                      v-model="item.isCheckBox"
                      @change="changeItemCheckStatus(item)"
                    ></el-checkbox>
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
                    回复
                  </el-button>
                  <el-button
                    @click="reply({ type: 'no', item: item, index }, item, index)"
                    size="small"
                    class="setBut"
                  >
                    {{ $t('chat.chat_1085') }}
                  </el-button>
                  <el-button
                    @click="replyBut({ type: 'private', item: item, index })"
                    size="small"
                    class="setBut"
                  >
                    {{ $t('common.common_1008') }}
                  </el-button>
                  <el-button
                    @click="replyBut({ type: 'audio', item: item, index })"
                    size="small"
                    class="setBut"
                  >
                    标记为直播中回答
                  </el-button>
                  <!-- <el-dropdown @command="replyBut" class="setBut">
                    <el-button class="el-dropdown-link">{{ $t('chat.chat_1084') }}</el-button>
                    <el-dropdown-menu slot="dropdown" class="qa-more__dropdown">
                      <el-dropdown-item :command="{ type: 'private', item: item, index }">
                        {{ $t('common.common_1008') }}
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ type: 'audio', item: item, index }">
                        标记为直播中回答
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown> -->
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
          <!-- 标记为直播中回答 -->
          <ul
            class="await-deal text-deal"
            :class="{ topLine: audioList.length > 0 }"
            v-show="activeIndex == 3"
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
                  <p class="await-content tag__no__check">
                    <span class="tiwen">{{ $t('chat.chat_1040') }}</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                </div>
                <div class="fr">
                  <span class="answer-control-btn" @click="replyAnswerStatus('no', item, index)">
                    标为未回复
                  </span>
                  <span class="answer-control-btn" @click="replyAnswerStatus('yes', item, index)">
                    标为已回复
                  </span>
                  <span class="answer-control-btn" @click="reply({ type: 'private' }, item, index)">
                    {{ $t('common.common_1008') }}
                  </span>
                  <span class="answer-control-btn" @click="reply('text', item, index)">回复</span>
                </div>
                <ul class="answer">
                  <li class="await-name">
                    <p class="answer-title">
                      <img
                        v-if="item.operator && item.operator.avatar"
                        class="avatar"
                        :src="item.operator.avatar || ''"
                      />
                      <img v-else class="avatar" src="./images/answer_default.png" />
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="item.operator.nick_name || ''"
                        placement="top-start"
                        v-if="item.operator && item.operator.nick_name"
                      >
                        <span class="answer-time" style="color: #666">
                          {{ item.operator.nick_name | overHidden(8) }}
                        </span>
                      </el-tooltip>
                      <span
                        v-if="
                          item.operator &&
                          (item.operator.role_name == 'host' ||
                            item.operator.role_name == 'assistant' ||
                            item.operator.role_name == 'guest')
                        "
                        :class="{
                          'role-host': item.operator && item.operator.role_name == 'host',
                          'role-assis':
                            item.operator &&
                            (item.operator.role_name == 'assistant' ||
                              item.operator.role_name == 'guest')
                        }"
                      >
                        {{ (item.operator ? item.operator.role_name : '') | roleFilter }}
                      </span>
                      <span class="answer-time">
                        {{ item.operator ? item.operator.operate_time : '' }}
                      </span>
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
            v-show="activeIndex == 1"
          >
            <template v-if="textDealList.length > 0">
              <li
                v-for="(item, index) in textDealList"
                :key="item.id"
                :class="['clearFix', { 'item-active': item.isCheckBox }]"
              >
                <div class="fl">
                  <el-checkbox
                    class="await-item-checkItem"
                    v-model="item.isCheckBox"
                    @change="changeItemCheckStatus(item)"
                  ></el-checkbox>
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
                  <span class="answer-control-btn" @click="reply('text', item, index)">回复</span>
                  <span
                    class="answer-control-btn"
                    @click="handleEditBatchStatusOrDelMulti('delRow', item)"
                  >
                    删除
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
            v-show="activeIndex == 2"
          >
            <template v-if="noDealList.length > 0">
              <li v-for="(item, index) in noDealList" :key="item.id" class="clearFix">
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
                    <span class="await-span">{{ item.created_at }}</span>
                  </p>
                  <p class="await-content tag__no__check">
                    <span class="tiwen">{{ $t('chat.chat_1040') }}</span>
                    <span class="content-text" v-html="item.content"></span>
                  </p>
                  <div class="no-deal-fr">
                    <div class="no-deal-fr-top">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="item.operator.nick_name"
                        placement="top-start"
                        v-if="item.operator && item.operator.nick_name"
                      >
                        >
                        <span class="ellsips">
                          {{ (item.operator ? item.operator.nick_name : '') | overHidden(8) }}
                        </span>
                      </el-tooltip>
                      <span
                        class="role-name"
                        :class="{
                          rolehost: item.operator && item.operator.role_name == 'host',
                          roleassistant:
                            item.operator &&
                            (item.operator.role_name == 'guest' ||
                              item.operator.role_name == 'assistant')
                        }"
                      >
                        {{ (item.operator ? item.operator.role_name : '') | roleFilter }}
                      </span>
                    </div>
                    <span>
                      {{ $t('chat.chat_1091') }}:
                      {{ item.operator ? item.operator.operate_time : '' }}
                    </span>
                  </div>
                </div>
                <div class="fr">
                  <span class="answer-control-btn" @click="replyAnswerStatus('no', item, index)">
                    标为未回复
                  </span>
                  <span class="answer-control-btn" @click="replyAnswerStatus('yes', item, index)">
                    标为已回复
                  </span>
                  <span class="answer-control-btn" @click="reply({ type: 'private' }, item, index)">
                    {{ $t('common.common_1008') }}
                  </span>
                  <span class="answer-control-btn" @click="reply('text', item, index)">回复</span>
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
              :current-page.sync="activeObj.page"
              :page-size="page_size"
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
    <!-- 修改问答名称 -->
    <el-dialog
      title="提示"
      custom-class="dialog__qa__set__name"
      :visible="updateQaShowVisibe"
      :close-on-click-modal="false"
      :before-close="setUpdateQaShowNameDialog"
      width="400px"
    >
      <div class="dialog__qa__set__name__content">
        <el-input v-model.trim="newQaName" show-word-limit maxlength="8" />
        <p class="tip__qa__set__name">
          可将名称修改为「投票」「报名」等，修改后用户观看直播时看到的是修改后的名称。
        </p>
      </div>
      <div class="footer">
        <el-button type="primary" round @click="updateQaShowName">确定</el-button>
        <el-button round @click="setUpdateQaShowNameDialog">取消</el-button>
      </div>
    </el-dialog>

    <!--没有权限弹窗 -->
    <saas-alert
      :visible="unExactOrDelPopAlert.visible"
      :confirm="unExactOrDelPopAlert.confirm"
      :knowText="'知道了'"
      :confirmText="'确定'"
      :cancelText="'取消'"
      @onSubmit="unExactOrDelSubmit"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">{{ unExactOrDelPopAlert.text }}</main>
    </saas-alert>
  </div>
</template>

<script>
  import {
    useRoomBaseServer,
    useQaAdminServer,
    Domain,
    useMsgServer,
    setRequestBody,
    setRequestHeaders
  } from 'middle-domain';
  import PrivateChat from '@/packages/live-private-chat/src/main.vue';
  import { textToEmoji } from '@/packages/chat/src/js/emoji';
  import { debounce, getQueryString } from '@/packages/app-shared/utils/tool';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  export default {
    name: 'VmpQaAdmin',
    components: {
      PrivateChat,
      SaasAlert
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
        page_size: 20,
        webinar_id: null,
        updateQaShowVisibe: false, // 是否展示 问答显示名称设置 弹出框，默认不展示
        newQaName: '', // 问答显示名称设置
        checkAll: false,
        unExactOrDelPopAlert: {
          // 设为批量不处理 或者 批量删除 的弹窗
          text: '',
          visible: false,
          confirm: true
        }
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
      questionIds() {
        return this.$domainStore.state.qaServer.questionIds;
      },
      filterTime() {
        return function (time) {
          return this.$moment(time).format('HH:mm');
        };
      },
      isAllChecked() {
        return this.$domainStore.state.qaServer.isAllChecked;
      },
      qaName() {
        return this.$domainStore.state.qaServer.qaName;
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
        const assistant_token = getQueryString('assistant_token');
        sessionStorage.setItem('vhall_client_token', assistant_token || '');
        if (location.search.includes('token_type=')) {
          // 1: livetoken   0:token
          if (getQueryString('token_type') == 1) {
            setRequestBody({
              live_token: assistant_token
            });
          } else {
            setRequestHeaders({
              token: assistant_token
            });
          }
        }
      }

      if (liveT || live_token) {
        setRequestBody({
          live_token: liveT || live_token
        });
      }

      await new Domain({
        plugins: ['chat'],
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

      // this.getChat(0); // 待处理
      // this.getChat(1); // 不处理
      // this.getChat(2); // 直播中回答
      // this.setReply(); // 文字回复
      this.getQuestionAnswerByTab(0); // 未回复 &待处理 列表
      this.getQuestionAnswerByTab(3); // 已回复 列表
      this.getQuestionAnswerByTab(1); // 不处理 列表
      this.getQuestionAnswerByTab(2); // 直播中回答 列表
      this.qaServer.initQaAdmin();
      this.getQaShowName();
      this.ready = true;
      this.qaServer.setState('pageSize', this.page_size);
      // this.select(0);
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
        // 按条件搜索的时候，重置选中状态与数据
        this.qaServer.clearQuestionIds();
        this.checkAll = false;
        // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
        // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答
        const queryStatusList = [0, 3, 1, 2]; //当前数组对应查询类型为 ['未回复', '已回复', '不处理', '在直播中回答']
        this.getQuestionAnswerByTab(queryStatusList[this.activeIndex], 0, searchContent);
      },
      clearSearchQaList() {
        this.exactSearch[`exactSearch${this.activeIndex}`] = '';
        // 重新查询下数据
        this.handleSearchQaList();
      },
      // 点击tab切换时接口调用，此时传入的为数组下标
      select(index, tab = null) {
        this.List[index].page = 1;
        this.qaServer.setState('activeIndex', index);
        this.qaServer.setState('activeObj', this.List[index]);
        this.qaServer.setState('isSearch', false);
        if (tab) {
          // 切换面板的时候，重置所有的选中
          this.clearAllChecked();
        }
        const searchContent = this.exactSearch[`exactSearch${this.activeIndex}`];
        if (searchContent) {
          this.qaServer.setState('isSearch', true);
        }
        // 问题类型： 0 未回复，1：不处理，2：直播间回复，3: 已回复
        const queryStatusList = [0, 3, 1, 2]; //当前数组对应查询类型为 ['未回复', '已回复', '不处理', '在直播中回答']
        this.getQuestionAnswerByTab(queryStatusList[index], 0, searchContent);
      },
      async currentChangeHandler(val) {
        console.warn('页码的点击效果----', val);
        const searchContent = this.exactSearch[`exactSearch${this.activeIndex}`];
        if (searchContent) {
          this.qaServer.setState('isSearch', true);
        }
        // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
        // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答
        const queryStatusList = [0, 3, 1, 2]; //当前数组对应查询类型为 ['未回复', '已回复', '不处理', '在直播中回答']
        await this.getQuestionAnswerByTab(
          queryStatusList[this.activeIndex],
          (val - 1) * this.page_size,
          searchContent
        );
        // 分页切换，设定全选状态
        this.checkAll = this.qaServer.pageChangeAllCheck(this.activeIndex);
      },
      getQaShowName() {
        this.qaServer
          .getQaShowName({
            webinar_id: this.webinar_id
          })
          .catch(err => {
            // this.$message.error(err.msg);
          });
      },
      setUpdateQaShowNameDialog(type) {
        if (type == 'show') {
          this.newQaName = this.qaName || '问答';
        }
        this.updateQaShowVisibe = type == 'show';
      },
      updateQaShowName() {
        if (!this.newQaName) {
          this.$message.error('请输入「问答」显示名称 ');
          return;
        }
        this.qaServer
          .updateQaShowName({
            webinar_id: this.webinar_id,
            name: this.newQaName
          })
          .then(res => {
            if (res.code == 200) {
              this.$message.success('修改成功');
              this.updateQaShowVisibe = false;
            } else {
              this.$message.error(res.msg || res.message || '修改失败');
            }
          })
          .catch(err => {
            // this.$message.error(err.msg);
          });
      },
      // Todo 废弃方法: 获取tab列表数据
      getChat(type, pagePos, str) {
        return this.qaServer
          .getQuestionByStatus({
            room_id: this.baseObj.interact.room_id,
            type: type,
            limit: this.page_size,
            keyword: str,
            pos: pagePos || 0,
            sort_sequence: 1 // 是否按序号正序排列 0 否 1 是
          })
          .catch(err => {
            // this.$message.error(err.msg);
          });
      },
      // Todo 废弃方法: 获取回复信息
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
        return this.qaServer.getTextReply(data);
      },
      // 点击tab获取问题及回复
      getQuestionAnswerByTab(type, pagePos, keyword) {
        // type问题类型： 0 未回复，1：不处理，2：直播间回复，3: 已回复
        let openType = 2; // 默认全部
        if (type == 3) {
          openType = this.testAnswer; // 若当前是已回复状态，按条件过滤
        }
        const params = {
          room_id: this.baseObj.interact.room_id,
          is_open: openType, // 0 私密 1 公开 2 全部
          pos: typeof pagePos == 'number' || typeof pagePos == 'string' ? pagePos : 0,
          limit: 20,
          keyword: keyword || '',
          sort_sequence: 1,
          status: type
        };
        return this.qaServer.getQuestionAnswer(params);
      },
      // 更多（私聊 & 在直播中回答）: 修复42302-标记为直播中回答时数组移除错误问题后引入的 不处理错误问题。
      replyBut(val) {
        if (val.type == 'audio') {
          this.reply(val.type, val.item, val.index);
        } else {
          this.reply(val, val.item, val.index);
        }
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
              setTimeout(() => {
                // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
                // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答
                if (this.activeIndex == 1) {
                  //发送回复后延时调用拉取列表接口，防止后端入库未完成，列表未更新
                  const queryStatusList = [0, 3, 1, 2]; //当前数组对应查询类型为 ['未回复', '已回复', '不处理', '在直播中回答']
                  this.getQuestionAnswerByTab(
                    queryStatusList[this.activeIndex],
                    (this.activeObj.page - 1) * this.page_size
                  );
                } else {
                  this.resetCurList();
                }
              }, 1000);
            }
          });
      },
      //更新当前tab当前页列表
      resetCurList() {
        // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
        // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答
        const queryStatusList = [0, 3, 1, 2]; //当前数组对应查询类型为 ['未回复', '已回复', '不处理', '在直播中回答']
        this.getQuestionAnswerByTab(
          queryStatusList[this.activeIndex],
          (this.activeObj.page - 1) * this.page_size,
          this.exactSearch[`exactSearch${this.activeIndex}`]
        );
      },
      // 单条记录-切换选中状态
      changeItemCheckStatus(item) {
        const len = this.questionIds.length + 1;
        if (item.isCheckBox && len > 25) {
          this.$message.error('批量操作最多仅支持500条数据，更多勾选则不生效');
          item.isCheckBox = false;
          this.checkAll = false;
          return;
        }
        const result = this.qaServer.changeItemQuestionIds(
          item.isCheckBox,
          item.id,
          this.activeIndex
        );
        if (result !== null) {
          this.checkAll = result;
        }
      },
      // 全选-切换选中状态
      changeAllChecked(checked) {
        if (this.activeIndex === 0) {
          const len = this.awaitList.length + this.questionIds.length;
          if (checked && len > 25) {
            this.$message.error(
              `批量操作最多仅支持500条数据，当前剩余可勾选${500 - this.questionIds.length}条`
            );
            this.checkAll = false;
            return;
          }
        }
        this.qaServer.changeAllQuestionIds(checked, this.activeIndex);
      },
      // 全选-清空选中状态
      clearAllChecked() {
        this.checkAll = false;
        this.qaServer.clearQuestionIds();
      },
      // 批量修改问题状态 - 不处理
      handleEditBatchStatusOrDelMulti(type, row = null) {
        if (row) {
          // 单条记录删除
          this.unExactOrDelPopAlert.visible = true;
          this.unExactOrDelPopAlert.text =
            type === 'unExact'
              ? '确定对勾选数据进行批量标记为不处理吗？'
              : '删除后将无法找回，确定删除？';
          this.unExactOrDelPopAlert.type = type;
          this.unExactOrDelPopAlert.row = row;
        } else {
          // 批量删除
          this.unExactOrDelPopAlert.row = null;
          if (this.questionIds && this.questionIds.length) {
            this.unExactOrDelPopAlert.visible = true;
            this.unExactOrDelPopAlert.text =
              type === 'unExact'
                ? '确定对勾选数据进行批量标记为不处理吗？'
                : '删除后将无法找回，确定删除？';
            this.unExactOrDelPopAlert.type = type;
          } else {
            this.$message.error('请至少选择一条记录');
          }
        }
      },
      // 弹出框 - 确认
      unExactOrDelSubmit() {
        if (this.unExactOrDelPopAlert.type == 'unExact') {
          this.sendUpdateBatch(1, this.questionIds); // 批量设置为不处理
        } else {
          this.sendDelQaAndAnswerMulti();
        }
      },
      // 弹出框 - 关闭 or 取消
      closeConfirm() {
        this.unExactOrDelPopAlert.visible = false;
        this.unExactOrDelPopAlert.text = '';
      },
      // 调用批量修改问题状态接口，支持单个
      sendUpdateBatch: debounce(async function (statusVal, ids = []) {
        this.qaServer
          .updateBatchStatus({
            room_id: this.baseObj.interact.room_id,
            question_ids: ids.join(','),
            status: statusVal
          })
          .then(res => {
            if (res.code != 200) {
              this.$message.error(res.msg || '修改失败');
            } else {
              this.qaServer.updateStatusToUNHANDLE(ids);
              // 若是批量设为不处理，弹出框打开的，需要关闭弹出框。
              if (this.unExactOrDelPopAlert && this.unExactOrDelPopAlert.visible) {
                this.closeConfirm();
              }
            }
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      }, 500),
      // 调用批量删除接口
      sendDelQaAndAnswerMulti: debounce(async function () {
        let questionIdsStr = null;
        if (this.unExactOrDelPopAlert.row) {
          questionIdsStr = `${this.unExactOrDelPopAlert.row.id}`;
        } else {
          questionIdsStr = this.questionIds.join(',');
        }
        if (!questionIdsStr) {
          this.$message.error('请至少选择一条记录');
          return;
        }
        const that = this;
        this.qaServer
          .delQaAndAnswerMulti({
            room_id: this.baseObj.interact.room_id,
            question_ids: questionIdsStr // question_ids必须是字符串形式
          })
          .then(res => {
            if (res.code != 200) {
              that.$message.error(res.msg || '批量删除失败');
            } else {
              // this.$message.success('删除成功');
              that.closeConfirm();
            }
          })
          .catch(err => {
            // this.$message.error(err.msg);
          });
      }, 500),
      // 设为 - 未回复状态 or 已回复状态
      replyAnswerStatus: debounce(async function (saveType, item, index) {
        console.log('设置为未回复状态-当前数据变化', saveType, item, index);
        this.qaServer
          .updateBatchStatus({
            room_id: this.baseObj.interact.room_id,
            question_ids: [item.id].join(','),
            status: saveType == 'no' ? 0 : 3
          })
          .then(res => {
            if (res.code == 200) {
              this.$message.success('设置成功');
              saveType === 'no'
                ? this.qaServer.updateStatusToUNANSWER(item)
                : this.qaServer.updateStatusToTEXTANSWER(item);
              // 原来数组顺序 0 - 未回复；1-标记为直播中回答；2-文字回复；3-不处理
              // 现在数组顺序 0 - 未回复；1-文字回复；2-不处理；3-标记为直播中回答
            } else {
              this.$message.error(res.msg || '设置失败');
            }
          })
          .catch(err => {
            // this.$message.error(err.msg);
          });
      }, 500)
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
        padding-top: 40px;
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 28px;
        color: #1a1a1a;
      }
      .host {
        margin: 4px auto 24px;
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: #666666;
        mix-blend-mode: normal;
        opacity: 0.66;
      }
      .new-qa__title__name {
        margin-bottom: 24px;
        .new-qa__link {
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          color: #3562fa;
          cursor: pointer;
        }
        .new-qa__text {
          margin-left: 16px;
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          color: #1a1a1a;
        }
      }
      .tab-box {
        min-width: 700px;
        height: calc(100% - 200px);
        .tab-list {
          .tab-li {
            display: inline-block;
            text-align: center;
            margin-right: 2px;
            position: relative;
            cursor: pointer;
            background: #f7f7f7;
            border: 1px solid #f2f2f2;
            border-radius: 4px 4px 0 0;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            color: #333333;
            padding: 9px 16px;
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
              font-weight: 500;
              color: #fb3a32;
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
          height: calc(100% - 210px);
          position: relative;
          ul {
            height: 100%;
            overflow-y: auto;
          }
          .await-deal {
            &.topLine {
              border-top: 1px solid #e6e6e6;
            }
            .await-item-checkItem {
              float: left;
              margin-right: 12px;
              width: 16px;
            }
            .await-id {
              width: auto;
              height: 14px;
              font-size: 16px;
              font-family: Arial-ItalicMT, Arial;
              font-weight: normal;
              color: #1a1a1a;
              line-height: 14px;
              margin-top: 4px;
            }
            font-size: 14px;
            li {
              border-bottom: 1px solid #e6e6e6;
              padding: 18px 24px;
              &:hover {
                background: #f7f7f7;
              }
              &.item-active {
                background: #f7f7f7;
              }
            }
            .fl {
              width: calc(100% - 288px);
              .await-name {
                font-style: normal;
                font-weight: 400;
                font-size: 14px;
                line-height: 14px;
                color: #666666;
                .el-checkbox__inner {
                  width: 16px;
                  height: 16px;
                }
                .lf-content {
                  display: inline-block;
                  vertical-align: top;
                }
                .avatar {
                  display: inline-block;
                  width: 30px;
                  height: 30px;
                  border-radius: 16px;
                  margin-right: 8px;
                  vertical-align: top;
                }
                span {
                  margin-right: 5px;
                  &.await-id {
                    margin-right: 16px;
                  }
                  &.await-span {
                    padding-left: 6px;
                  }
                }
                .mark {
                  margin: 0 10px;
                }
              }
              .await-content {
                width: 454px;
                padding-left: 104px;
                color: #1a1a1a;
                line-height: 22px;
                margin-top: -10px !important;
                &.tag__no__check {
                  padding-left: 76px;
                  width: 388px;
                }
                .tiwen {
                  margin-right: 8px;
                  color: #fc9600;
                }
                .content-text {
                  word-break: break-all;
                  line-height: 20px;
                }
              }
            }
            .fr {
              float: right;
              width: 288px;
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
              align-items: flex-start;
              justify-content: flex-start;
              margin-left: 74px;
              margin-top: 16px;
              span {
                float: right;
                height: 14px;
                font-size: 14px;
                line-height: 14px;
              }
              &-top {
                min-width: 60px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-around;
                color: #666666;
                .role-name {
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
                  margin-left: 12px;
                  margin-right: 12px;
                  font-style: normal;
                  font-weight: 400;
                  font-size: 12px;
                  line-height: 16px;
                  color: #fb3a32;
                  background: rgba(251, 58, 50, 0.2);
                  border-radius: 9px;
                  text-align: center;
                  padding: 0 4px;
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
          height: calc(100% - 210px);
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
            position: relative;
            margin-left: 104px;
            &.await-name {
              padding: 0 24px 0 8px;
              margin-top: 18px;
              border-left: 2px solid #cccccc;
              border-bottom: 0;
              border-right: 0;
              border-top: 0;
            }
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
              margin-left: 12px;
              margin-right: 12px;
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 16px;
              color: #fb3a32;
              background: rgba(251, 58, 50, 0.2);
              border-radius: 9px;
              text-align: center;
              padding: 0 4px;
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
      border-top: 1px solid #f0f0f0;
      margin-top: -1px;
      .el-checkbox {
        margin-right: 14px;
        margin-left: 24px;
      }
      .el-select {
        margin-left: 14px;
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
        margin-left: auto;
        .el-input__prefix {
          left: 10px;
          top: 2px;
        }
      }
      i.el-tooltip.vh-iconfont.vh-line-question.help-icon {
        font-size: 14px;
        color: #dadada;
        margin-left: 8px;
        cursor: pointer;
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
  /* 问答名称修改 */
  .dialog__qa__set__name {
    .tip__qa__set__name {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: #666666;
      text-align: left;
      margin-top: 8px;
      margin-bottom: 24px;
    }
    .footer {
      text-align: right;
      .el-button {
        text-align: center;
      }
    }
  }
</style>
