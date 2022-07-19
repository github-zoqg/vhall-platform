// element-ui 中用来判断 text-overflow 的工具方法 start

const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const ieVersion = Number(document.documentMode);

const camelCase = function (name) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1');
};

function getStyle1(element, styleName) {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'styleFloat';
  }
  try {
    switch (styleName) {
      case 'opacity':
        try {
          return element.filters.item('alpha').opacity / 100;
        } catch (e) {
          return 1.0;
        }
      default:
        return element.style[styleName] || element.currentStyle
          ? element.currentStyle[styleName]
          : null;
    }
  } catch (e) {
    return element.style[styleName];
  }
}

function getStyle2(element, styleName) {
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '');
    return element.style[styleName] || computed ? computed[styleName] : null;
  } catch (e) {
    return element.style[styleName];
  }
}

export const getStyle = ieVersion < 9 ? getStyle1 : getStyle2;

// element-ui 中用来判断 text-overflow 的工具方法 end

const tableCellTooltip = {
  data() {
    return {
      isTextOverflow: false
    };
  },
  methods: {
    // 单元格鼠标移入事件
    handleCellMouseEnter(row, column, cell, event) {
      console.log('鼠标移入');
      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.cell .custom-tooltip-content');
      if (!cellChild) {
        return;
      }
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange();
      range.setStart(cellChild, 0);
      range.setEnd(cellChild, cellChild.childNodes.length);
      const rangeWidth = range.getBoundingClientRect().width;
      const padding =
        (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0);
      if (
        rangeWidth + padding > cellChild.offsetWidth ||
        cellChild.scrollWidth > cellChild.offsetWidth
      ) {
        this.isTextOverflow = true;
      }
    },
    handleCellMouseLeave() {
      console.log('鼠标移出');
      this.isTextOverflow = false;
    }
  }
};

export default tableCellTooltip;
