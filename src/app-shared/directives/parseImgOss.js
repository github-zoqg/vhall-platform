/**
 * @description 识别oss需要转换的图片地址
 * @param type 类型 img/bg 默认img  默认图片
 * @param url 图片的url type=bg时，必传
 * @param default 默认值, 默认1
 */
import { parseImgOssQueryString } from '@/app-shared/utils/tool.js';
import { cropperImage } from '@/app-shared/utils/common';

export const parseImgOss = {
  name: 'parseImgOss',
  option: {
    bind(el, binding, vnode) {
      // console.log('-----drag - bind-----', el, binding, vnode);
      const type = binding.value?.type || 'img';
      const url = binding.value?.url;
      let mode = binding.value?.default || 1;
      // 是否图片经阿里云转换
      if (cropperImage(url)) {
        let obj = parseImgOssQueryString(url);
        mode = Number(obj.mode);
      }
      if (type == 'img') {
        if (mode == 1) {
          el.style['object-fit'] = 'fill';
        }
        if (mode == 2) {
          el.style['object-fit'] = 'cover';
          el.style['object-position'] = 'left top';
        }
        if (mode == 3) {
          el.style['object-fit'] = 'contain';
          el.style['object-position'] = 'center';
        }
      }
      if (type == 'bg') {
        if (mode == 1) {
          el.style['background-size'] = '100% 100%';
        }
        if (mode == 2) {
          el.style['background-size'] = 'cover';
          el.style['background-position'] = 'left top';
        }
        if (mode == 3) {
          el.style['background-size'] = 'contain';
        }
      }
    },
    inserted(el, binding, vnode) {
      // console.log('-----drag - inserted-----', el, binding, vnode);
    },
    update(el, binding, vnode, oldVnode) {
      // console.log('-----drag - update-----', el, binding, vnode, oldVnode);
    },
    unbind(el, binding, vnode) {
      // console.log('-----drag - unbind-----', el, binding, vnode);
    }
  }
};
