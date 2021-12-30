const pkgContext = require.context('../../packages/', true, /index.js$/);
const pageContext = require.context('../pages/', true, /index.vue$/);

let pagesPkgs = [];
let packages = [];
let components = [];

function generatePkg() {
  for (const key of pkgContext.keys()) {
    const component = pkgContext(key);

    packages.push({
      pathName: key.replace('./', '').replace('/index.js', ''),
      name: component.default.name,
      component: component.default
    });

    components.push(component.default);
  }
}

function generatePage() {
  for (const key of pageContext.keys()) {
    const pagePkg = pageContext(key);
    const pathName = key.replace('./', '').replace('/index.vue', '');
    pagesPkgs.push({
      name: pagePkg.default.name,
      pathName,
      page: pagePkg.default
    });
  }
}

function mapPageToPkgs() {
  packages = packages.map(pkg => {
    let pagePkg = pagesPkgs.find(page => page.pathName === pkg.pathName);
    if (pagePkg) {
      return { ...pkg, page: pagePkg.page };
    } else {
      return pkg;
    }
  });
}

generatePkg();
generatePage();
mapPageToPkgs();

console.log('packages:', packages);

export function dynamicLoadComponent() {
  return components;
}

export function dynamicLoadPacks() {
  return packages;
}

export function dynamicLoadPages() {
  return pagesPkgs;
}
