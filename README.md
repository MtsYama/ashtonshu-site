# ashtonshu-site

Zhengshen Shu 的个人网站原型。纯静态 HTML、CSS、JS,没有框架,也没有构建步骤,用 GitHub Pages 托管。

线上地址:https://ashton.is

版式参照 Daikoku Design Institute 的网站(https://daikoku.ndc.co.jp/):首页一屏大图轮播,页头只有左边的名字和右边几个字的导航,作品归档是一格格的图,鼠标移上去才显示名字,项目页是大图加居中的一栏文字。正文和导航只用 Inter 常规字重;首页第一张那句话沿用原来首页的字:“Ashton is” 用 Poppins 800,后面轮换的说法用 Inter 300,靠左对齐页边。白底或浅灰底,深色只出现在作品图本身。

## 页面

网址不带 `.html`:`about.html` 的网址是 ashton.is/about,`work/farms-360.html` 是 ashton.is/work/farms-360,`work/index.html` 是 ashton.is/work/(打 ashton.is/work 会自己跳过去)。GitHub Pages 会把短网址对到同名的 `.html` 文件,所以文件名照旧,旧的 `.html` 网址也照样能打开。站内链接都写短的,而且都是相对路径:根目录的页面里写 `about`、`work/`、`work/farms-360`,回首页写 `./`;`work/` 里的页面写 `farms-360`、`../about`,回作品归档写 `./` 或 `../work/`,回首页写 `../`。

| 网址 | 文件 | 内容 |
|---|---|---|
| `/` | `index.html` | 首页:全屏轮播(第一张是 “Ashton is ...” 那句轮换的话,后面 5 张是项目)、一句话介绍、4 个项目 |
| `/work/` | `work/index.html` | 作品归档,分 Projects、Collections、Personal work 三组 |
| `/work/farms-360` | `work/farms-360.html` | Farms 360(Projects 第一个) |
| `/work/superlinear-academy` | `work/superlinear-academy.html` | Superlinear Academy(末尾有 Process) |
| `/work/hack4change` | `work/hack4change.html` | hack4change(有 Event Teaser 和 Credits) |
| `/work/wine-and-dance` | `work/wine-and-dance.html` | Wine & Dance(Process 里加了早期照片试排) |
| `/work/drink-packaging` | `work/drink-packaging.html` | Drink Packaging(末尾有 Process) |
| `/work/tarot-deck` | `work/tarot-deck.html` | Tarot Deck(末尾有 Process) |
| `/work/zsa-moonlander` | `work/zsa-moonlander.html` | ZSA Moonlander(末尾有 Process) |
| `/work/campaign-works` | `work/campaign-works.html` | Campaign Works(Collections) |
| `/work/photography` | `work/photography.html` | Photography(Collections,只放设计课的摄影作业,含学生生活系列) |
| `/work/greeting-cards` | `work/greeting-cards.html` | Greeting Cards(Personal work) |
| `/work/postcards` | `work/postcards.html` | Postcards(Personal work) |
| `/work/field-notes` | `work/field-notes.html` | Field Notes(Personal work,个人风景和街拍,有 Landscape 和 Street 两节) |
| `/work/digital-art` | `work/digital-art.html` | Digital Art,草稿:带 noindex,作品页和其他页面都不链接它,只能直接输网址打开 |
| `/work/greeting-cards-draft` | `work/greeting-cards-draft.html` | 旧网址,打开就跳到 `/work/greeting-cards` |
| `/about` | `about.html` | 名字、头像、LinkedIn 上的简介、简历 |
| `/contact` | `contact.html` | 邮箱、LinkedIn、Instagram、联系表单 |

联系表单点“Send”会打开访客自己的邮件程序,内容已经填好,不经过任何第三方表单服务。

`css/style.css` 是全站样式,`js/site.js` 管页头:页头一直在屏幕顶上,压在首页轮播或项目大图上时是透明的,字跟着图换黑白;往下滚过大图后变成一条窄一些的白条,底下一根细线。`img/` 放全部图片。项目文字、标题和标签都照搬作品集,一字没改。页头最右边的月亮/太阳切换明暗(手机上只显示图标),默认跟着访客的系统设置走。页脚和联系页里的 LinkedIn、Instagram 显示成图标加名字。

## 首页轮播

- 每张项目图停 3 秒,淡入淡出。第一张那句话每 1.9 秒换一个说法:换到新的身份时从上方落下,同一身份下的分支从侧面展开;最后的 “an electrical engineer.” 是转行前的身份,“is” 换成 “was”,“was” 和这个说法一起变灰。打开首页后的第一轮把全部说法轮一遍;之后每次轮回第一张,每个身份只带一个分支,每轮换一个。第一张停多久按这一轮的说法个数自动算(个数 × 1.9 秒 + 0.5 秒),最后一个说法一直留到换下一张。点圆点、按左右方向键、手机上左右滑都能换,点图打开对应的项目页;鼠标停在左下角的项目名或圆点上、或用键盘聚焦时不换下一张,右下角的小按钮暂停。有名字封面时,封面收起的同时才开始播。系统开了“减少动态效果”时不自动播放,那句话也不轮换。
- 改那句话:`index.html` 里有三处要一起改:`<h1 class="is-line">` 里一开始显示的说法(`class="is-cycle"`,要和 `roles` 的第一个说法一样)、它后面给读屏软件的整句(`class="vh"`),和页面底部脚本里的 `roles` 列表。`roles` 的每一组是一个身份,组里第一个是身份本身,后面跟着它的分支;转行前那个身份还写在 `PAST` 里(显示成 “was” 加灰色),改它时 `PAST` 也要一起改。说法个数变了不用改别的,第一张停多久和给那句话留的高度都是自动算的。
- 名字动画:样式在 `css/name-motion.css`,脚本在 `js/name-motion.js`,源文件和导出的视频在 `_sources/name-motion/`。首页打开时先放一遍名字封面(用加快版 `is-intro`,2.3 秒,连同滑进字标约 3 秒;About 页和导出的视频仍是原速;同一个标签页只放一次,点一下、按任意键或滚动就立刻收起,系统开了“减少动态效果”时不放),放完后 “Ashton” 缩小滑进左上角的字标;About 页标题一直循环。关掉首页封面:删掉 `index.html` `<head>` 里设 `nm-cover-on` 的那一行 `<script>`。页头的字标和右边四项(Work、About、Contact、亮暗切换)鼠标悬停或键盘聚焦时,动画 C 的四个角从字中心张开围住它,移开时收回中心;当前所在页面的那一项不再加下划线,四个角缩短、半透明地停在它周围(不动),悬停时照样完全张开;角由 `js/site.js` 加进去,样式在 `css/style.css` 的 `.hb`,触屏不显示。左上角字标全站都是 “Ashton”(和动画同一字体,链接给读屏软件读 “Ashton Z. Shu”),换回原来的 “Ashton Z. Shu”:各页把 `aria-label="Ashton Z. Shu">Ashton</a>` 换回 `>Ashton Z. Shu</a>`,再把 `css/style.css` 里 `.wordmark` 那条改回 `letter-spacing: .01em;`,首页封面也一起关掉(否则 “Ashton” 会滑进一个对不上的字标)。About 页换回静态标题:把 `<h1 class="a-name">` 整行换回 `<h1>Ashton Z. Shu</h1>`。
- 一张项目图就是 `index.html` 里一个 `<div class="slide is-fit">`,改这几处:
  - `data-name` 和 `data-href`:左下角显示的项目名和它链到的页面。`data-href` 写短网址,例如 `work/tarot-deck`(不带 `.html`)。
  - `data-tone`:图偏暗写 `dark`(页头和圆点用白字),偏亮写 `light`(黑字)。
  - `style` 里的 `--bg`:手机竖屏时整张图完整放在中间,上下空出来的地方用这个颜色,取图片上下边缘的颜色最自然。
  - `--zoom`(电脑上把图放大一点,裁掉边上不想要的部分)和 `--pz`(手机上把图放大一点),不写就是 1。

## 没放进来的内容

- 一个客户项目:只同意放在私下发出的作品集里,公开网站不放。简历里那段合同工作保留,去掉了客户名。
- 电话号码。
- 贺卡的印刷文件,上面有真实姓名。网站只用占位名字的展示图。
- 作品集简历页上的实习时间那一行,只跟 placement 申请有关。
- 页面原先带 `<meta name="robots" content="noindex">`;2026-10-15 起删掉了,ashton.is 允许搜索引擎收录。

## 怎么更新

- 改文字:直接改对应的 `.html`。页头和页脚每个页面各有一份,要改就每页都改,用编辑器的全局替换最快。
- 换图:把新图放进 `img/`,改 `src`,顺手改 `width`、`height` 和 `alt`。网页用的图长边 2000 像素以内的 JPEG 就够。
- 项目页顶部的大图:电脑上裁成 2:1,`style` 里的 `--pos` 决定保留图的哪一部分(例如 `50% 0%` 是保留上沿);页头的字压在图上,所以 `<header class="site-header">` 的 `data-tone` 按图来写:`dark`、`light`,图太花时写 `mixed`(字底下垫白块)。不想裁的图给 `figure` 加 `is-fit`,整张放在浅灰底上。
- 加项目:复制 `work/` 下任意一页改内容;在 `work/index.html` 对应的组(Projects 或 Personal work)里加一张卡片;再改前后两个项目页底部 “More projects” 里的两张卡片(链接、缩略图、名字)。想上首页轮播就照上面加一张 slide,同时把每张的 `aria-label` 里的 “x of 6” 改对。
- 网站图标(favicon):新页面默认用 `img/favicon-draft.png`(黑底白标),草稿、WIP 和以后其他还没定稿的页面都用它;页面做好上线时才换成 `img/favicon-solid.png`(白底黑标)。从做好的页面复制页头时记得改回 draft。两者都是 64×64,由 `img/mark.png` 生成;页面里显示的 logo 照旧用无底色的 `mark.png`。`img/favicon.png` 留着同样是白底版,只为兜底旧链接。
- 本地预览:站内链接是不带 `.html` 的短网址,要像 GitHub Pages 那样把 `/about` 对到 `about.html` 的服务器才能一路点通。在这个文件夹里运行 `python -m http.server`、浏览器打开 http://localhost:8000/ ,首页和作品归档能看,但点进 About、Contact 和各个项目页会 404,要看就在地址栏补上 `.html`(例如 http://localhost:8000/about.html )。直接双击 `index.html` 也只能看首页这一页。
- 发布:`git add -A`,`git commit`,`git push`。GitHub Pages 一两分钟后更新。

## 以后接自己的域名

仓库根目录的 `CNAME` 现在写的是 `ashton.is`。下面是接域名的步骤，留作以后换域名时参考:

1. 在仓库根目录新建一个叫 `CNAME` 的文件,里面只写一行域名,例如 `ashtonshu.com`,提交并推送。也可以在仓库 Settings → Pages → Custom domain 里填,GitHub 会自动生成这个文件。
2. 在域名商的 DNS 设置里加记录:
   - 根域名 `@`:4 条 A 记录,`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
   - 想支持 IPv6 的话,再加 4 条 AAAA 记录,`2606:50c0:8000::153`、`2606:50c0:8001::153`、`2606:50c0:8002::153`、`2606:50c0:8003::153`
   - `www`:1 条 CNAME 记录,指向 `mtsyama.github.io`
3. DNS 生效后(几分钟到一天),回到 Settings → Pages 勾选 Enforce HTTPS。
4. 最好先在 GitHub 个人 Settings → Pages 里验证这个域名,防止别人把它绑到自己的仓库上。

站内链接全是相对路径,换域名不用改代码。
