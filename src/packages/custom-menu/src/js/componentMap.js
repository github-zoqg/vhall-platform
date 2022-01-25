// <!-- 图文 -->
// <i class="iconfont-v3 saasicon_graphic" v-if="item.component_id == 1"></i>
// <!-- 二维码 -->
// <i class="iconfont-v3 saasicon_gQrcode" v-if="item.component_id == 2"></i>
// <!-- 直播 -->
// <i class="iconfont-v3 saasicon_live" v-if="item.component_id == 3"></i>
// <!-- 专题 -->
// <i class="iconfont-v3 saasicon_project" v-if="item.component_id == 4"></i>
// <!-- 图文链接 -->
// <i class="iconfont-v3 saasicon_Picturesofchain" v-if="item.component_id == 5"></i>
// <!-- 文字链接 -->
// <i class="iconfont-v3 saasicon_Textchain" v-if="item.component_id == 6"></i>
// <!-- 标题 -->
// <i class="iconfont-v3 saasicon_title" v-if="item.component_id == 7"></i>
// <!-- 分割线 -->
// <i class="iconfont-v3 saasicon_divider" v-if="item.component_id == 8"></i>

const compoentMap = {
  // 图文
  1: 'desimg',
  // 二维码
  2: 'qrcode',
  // 直播
  3: 'lives',
  // 专题
  4: 'projects',
  // 文字链接
  5: 'textlink',
  // 图片链接
  6: 'imglink',
  // 标题
  7: 'title',
  // 分割线
  8: 'line',
  // 排行榜
  9: 'rank'
};

export default compoentMap;
