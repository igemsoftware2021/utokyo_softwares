const fs = require('fs').promises
const yaml = require('js-yaml')
const rimraf = require('rimraf')
const path = require('path')

const team = 'UTokyo'

function isWiki() {
  return process.argv.includes('--wiki')
}
// returns 'server' 'generate' or other
function getMode() {
  if (process.argv[2] === 'server') {
    return 'server'
  }
  if (process.argv[2] === 'generate') {
    return 'generate'
  }
  return 'other'
}
hexo.extend.filter.register('before_generate', async function() {
  if (!isWiki() || getMode() !== 'generate') {
    return
  }
  console.log('wiki generate')
  try {
    const data = await fs.readFile(this.base_dir + '_config.wiki.yml', 'utf8')
    const wikiConfig = yaml.load(data)
    for (let key in wikiConfig) {
      this.config[key] = wikiConfig[key]
    }
  } catch (err) {
    if (err.errno === -4058) {
      console.log('no specific config for wiki')
    } else {
      reject(err)
    }
  }
})

hexo.extend.helper.register('isGeneratedWiki', function() {
  return isWiki() && getMode() === 'generate'
})

const original_partial = hexo.extend.helper.get('partial')
const templates = []
hexo.extend.helper.register('partial', function(src, config) {
  if (getMode() !== 'generate' || config || !isWiki()) {
    return original_partial.bind(this)(src, config)
  } else {
    if (!templates.includes(src)) {
      templates.push(src)
    }
    return `{{ Template:${team}/template/${src} }}`
  }
})

function removeFolder(path) {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) {
        reject(err)
        return
      }
      resolve(err)
    })
  })
}

const ignoreFiles = [
  '.git',
  '.github',
  '.gitignore'
]

async function writeTemplate(src, content) {
  try {
    await fs.mkdir(path.dirname(src))
  } catch (e) { }
  await fs.writeFile(
    src,
    '<html>' + content + '</html>\n'
  )
}

async function writeLibTemplate(templatePath, name, content) {
  try {
    await fs.mkdir(templatePath + 'lib')
  } catch (e) { }
  await fs.writeFile(
    `${templatePath}lib/${name}`,
    `${content}\n`
  )
}

if (getMode() === 'server' && isWiki()) {
  hexo.extend.injector.register('head_begin', `
  <link rel="stylesheet" href="https://2021.igem.org/wiki/load.php?debug=false&amp;lang=en&amp;modules=mediawiki.legacy.commonPrint%2Cshared%7Cmediawiki.skinning.content.externallinks%7Cmediawiki.skinning.interface%7Cmediawiki.ui.button%7Cskins.igem.styles&amp;only=styles&amp;skin=igem&amp;*"><style>a:lang(ar),a:lang(kk-arab),a:lang(mzn),a:lang(ps),a:lang(ur){text-decoration:none}
  /* cache key: 2021_igem_org:resourceloader:filter:minify-css:7:329647e7075f31ea1bfe23cc06e29c9e */</style>
  <script src="/js/load-php.js"></script>
  <script>if(window.mw){
    mw.config.set({"wgCanonicalNamespace":"","wgCanonicalSpecialPageName":false,"wgNamespaceNumber":0,"wgPageName":"Team:","wgTitle":"Team:","wgCurRevisionId":64148,"wgRevisionId":64148,"wgArticleId":2709,"wgIsArticle":true,"wgIsRedirect":false,"wgAction":"view","wgUserName":"Shundroid","wgUserGroups":["*","user","autoconfirmed"],"wgCategories":[],"wgBreakFrames":false,"wgPageContentLanguage":"en","wgPageContentModel":"wikitext","wgSeparatorTransformTable":["",""],"wgDigitTransformTable":["",""],"wgDefaultDateFormat":"dmy","wgMonthNames":["","January","February","March","April","May","June","July","August","September","October","November","December"],"wgMonthNamesShort":["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"wgRelevantPageName":"Team:","wgUserId":2019,"wgUserEditCount":64,"wgUserRegistration":1622250209000,"wgUserNewMsgRevisionId":null,"wgIsProbablyEditable":true,"wgRestrictionEdit":[],"wgRestrictionMove":[]});
  }</script><script>if(window.mw){
    mw.loader.implement("user.options",function($,jQuery){mw.user.options.set({"ccmeonemails":0,"cols":80,"date":"default","diffonly":0,"disablemail":0,"editfont":"default","editondblclick":0,"editsectiononrightclick":0,"enotifminoredits":0,"enotifrevealaddr":0,"enotifusertalkpages":1,"enotifwatchlistpages":1,"extendwatchlist":0,"fancysig":0,"forceeditsummary":0,"gender":"unknown","hideminor":0,"hidepatrolled":0,"imagesize":2,"math":1,"minordefault":0,"newpageshidepatrolled":0,"nickname":"","norollbackdiff":0,"numberheadings":0,"previewonfirst":0,"previewontop":1,"rcdays":7,"rclimit":50,"rows":25,"showhiddencats":0,"shownumberswatching":1,"showtoolbar":1,"skin":"igem","stubthreshold":0,"thumbsize":5,"underline":2,"uselivepreview":0,"usenewrc":1,"watchcreations":1,"watchdefault":1,"watchdeletion":0,"watchlistdays":3,"watchlisthideanons":0,"watchlisthidebots":0,"watchlisthideliu":0,"watchlisthideminor":0,"watchlisthideown":0,"watchlisthidepatrolled":0,"watchmoves":0,"watchrollback":0,
    "wllimit":250,"useeditwarning":1,"prefershttps":1,"language":"en","variant-gan":"gan","variant-iu":"iu","variant-kk":"kk","variant-ku":"ku","variant-shi":"shi","variant-sr":"sr","variant-tg":"tg","variant-uz":"uz","variant-zh":"zh","searchNs0":true,"searchNs1":false,"searchNs2":false,"searchNs3":false,"searchNs4":false,"searchNs5":false,"searchNs6":false,"searchNs7":false,"searchNs8":false,"searchNs9":false,"searchNs10":false,"searchNs11":false,"searchNs12":false,"searchNs13":false,"searchNs14":false,"searchNs15":false});},{},{});mw.loader.implement("user.tokens",function($,jQuery){mw.user.tokens.set({"editToken":"a1b71d0f10115b1cb58a459fa7e2c074+\\","patrolToken":"7d0984459a0f78bf79713e9cea993253+\\","watchToken":"b9e9c56bb50cc118f88111f35cabfd62+\\"});},{},{});
    /* cache key: 2021_igem_org:resourceloader:filter:minify-js:7:ec077ca979229f795ba42533abeeab54 */
  }</script><script>if(window.mw){
    mw.loader.load(["mediawiki.page.startup","mediawiki.legacy.wikibits","mediawiki.legacy.ajax"]);</script>
  `)
  hexo.extend.injector.register('body_begin', `
  <body class="mediawiki ltr sitedir-ltr ns-0 ns-subject page-Team_ skin-igem action-view"><script src="https://2021.igem.org/common/tablesorter/jquery.tablesorter.min.js"></script><link rel="stylesheet" href="https://2021.igem.org/common/tablesorter/themes/groupparts/style.css"><link rel="stylesheet" href="https://2021.igem.org/common/table_styles.css"><script src="https://2021.igem.org/wiki/skins/Igem/resources/2021_skin.js"></script><div id="globalWrapper"><div class="noprint" id="top_menu_under"></div><div class="noprint" id="top_menu_14">Loading menubar.....</div><script>jQuery('#top_menu_14').load('https://2021.igem.org/cgi/top_menu_14/menubar_reply.cgi',
    {   t:"Team%3A",
    a:"View+%2FTeam%3A++Edit+%2Fwiki%2Findex.php%3Ftitle%3DTeam%3A%26action%3Dedit++History+%2Fwiki%2Findex.php%3Ftitle%3DTeam%3A%26action%3Dhistory++Move+%2FSpecial%3AMovePage%2FTeam%3A++Unwatch+%2Fwiki%2Findex.php%3Ftitle%3DTeam%3A%26action%3Dunwatch%26token%3D5658ea45260117e186cb79e934997d76%252B%255C++Page+%2FTeam%3A++Discussion+%2Fwiki%2Findex.php%3Ftitle%3DTalk%3ATeam%3A%26action%3Dedit%26redlink%3D1++" });</script><div class="mw-body" id="content" role="main"><a id="top"></a><div id="top_title"></div><div id="HQ_page"><div id="bodyContent"><div class="mw-content-ltr" id="mw-content-text" lang="en" dir="ltr"><p style="margin: 0 0 6.5px 0">
  `)
  hexo.extend.injector.register('body_end', `
  </p></div><div class="visualClear"></div></div></div></div></div></body>
  `)
}

hexo.extend.filter.register('before_exit', async function() {
  if (!isWiki() || getMode() !== 'generate') {
    return
  }
  const templatePath = this.public_dir + 'template/'
  try {
    await fs.mkdir(templatePath)
  } catch (e) { }
  const promises = templates.map(src => (async () => {
    const view = await hexo.theme.getView(src).render({
      config: this.config,
      theme: this.config.theme_config
    })
    await writeTemplate(templatePath + src + '.html', view)
    console.log(`written template: ${src}`)
  })())
  await Promise.all(promises)
})
