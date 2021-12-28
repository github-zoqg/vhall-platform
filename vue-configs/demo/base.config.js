/**
 * demo直播pc端工程通用基础配置
 */
module.exports = {
  'live-pc': {
    // html模板页面配置字段
    htmlConfig: {
      // cdn js
      cdnJs: {
        ElementUi: '//cnstatic01.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/index.js',
        doc: '//static.vhallyun.com/jssdk/vhall-jssdk-doc/latest/vhall-jssdk-doc-3.2.0.js',
        chat: '//static.vhallyun.com/jssdk/vhall-jssdk-chat/latest/vhall-jssdk-chat-2.1.4.js',
        player: '//static.vhallyun.com/jssdk/vhall-jssdk-player/latest/vhall-jssdk-player-2.4.0.js',
        interaction:
          '//static.vhallyun.com/jssdk/vhall-jssdk-interaction/latest/vhall-jssdk-interaction-2.3.6.js'
      },
      // cdn css
      cdnCss: {
        ElementUi:
          '//cnstatic01.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/theme-chalk/index.css',
        iconfont: '//static-component.vhall.com/iconfont/saas/v1/pc-lives/iconfont.css'
      }
    }
  }
};
