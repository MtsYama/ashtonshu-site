# ashtonshu-site

Zhengshen Shu 的个人网站原型。纯静态 HTML、CSS、JS,没有框架,也没有构建步骤,用 GitHub Pages 托管。

线上地址:https://mtsyama.github.io/ashtonshu-site/

版式参照 Daikoku Design Institute 的网站(https://daikoku.ndc.co.jp/):首页一屏大图轮播,页头只有左边的名字和右边几个字的导航,作品归档是一格格的图,鼠标移上去才显示名字,项目页是大图加居中的一栏文字。只用 Inter 一种字体,全站常规字重,白底或浅灰底,深色只出现在作品图本身。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 首页:全屏轮播(第一张是 “Ashton is ...” 那句轮换的话,后面 5 张是项目)、一句话介绍、4 个项目 |
| `work/index.html` | 作品归档,分 Projects 和 Personal work 两组 |
| `work/superlinear-academy.html` | Superlinear Academy |
| `work/hack4change.html` | hack4change |
| `work/wine-and-dance.html` | Wine & Dance |
| `work/zsa-moonlander.html` | ZSA Moonlander |
| `work/drink-packaging.html` | Drink Packaging |
| `work/tarot-deck.html` | Tarot Deck |
| `work/campaign-works.html` | Campaign Works |
| `work/greeting-cards.html` | Greeting Cards(Personal work) |
| `work/postcards.html` | Postcards(Personal work) |
| `work/photography.html` | Photography(Personal work) |
| `about.html` | 名字、头像、LinkedIn 上的简介、简历 |
| `contact.html` | 邮箱、LinkedIn、Instagram、联系表单 |

联系表单点“Send”会打开访客自己的邮件程序,内容已经填好,不经过任何第三方表单服务。

`css/style.css` 是全站样式,`js/site.js` 管页头:页头一直在屏幕顶上,压在首页轮播或项目大图上时是透明的,字跟着图换黑白;往下滚过大图后变成一条窄一些的白条,底下一根细线。`img/` 放全部图片。项目文字、标题和标签都照搬作品集,一字没改。页头最右边的月亮/太阳切换明暗(手机上只显示图标),默认跟着访客的系统设置走。页脚和联系页里的 LinkedIn、Instagram 显示成图标加名字。

## 首页轮播

- 每张图停 5 秒,淡入淡出;第一张那句话把四个说法轮一遍(约 11.5 秒)再往下走。点圆点、按左右方向键、手机上左右滑都能换,右下角的小按钮暂停。系统开了“减少动态效果”时不自动播放,那句话也不轮换。
- 一张项目图就是 `index.html` 里一个 `<div class="slide is-fit">`,改这几处:
  - `data-name` 和 `data-href`:左下角显示的项目名和它链到的页面。
  - `data-tone`:图偏暗写 `dark`(页头和圆点用白字),偏亮写 `light`(黑字)。
  - `style` 里的 `--bg`:手机竖屏时整张图完整放在中间,上下空出来的地方用这个颜色,取图片上下边缘的颜色最自然。
  - `--zoom`(电脑上把图放大一点,裁掉边上不想要的部分)和 `--pz`(手机上把图放大一点),不写就是 1。

## 没放进来的内容

- 一个客户项目:只同意放在私下发出的作品集里,公开网站不放。简历里那段合同工作保留,去掉了客户名。
- 电话号码。
- 贺卡的印刷文件,上面有真实姓名。网站只用占位名字的展示图。
- 作品集简历页上的实习时间那一行,只跟 placement 申请有关。
- 所有页面都带 `<meta name="robots" content="noindex">`,搜索引擎不收录。决定公开时再删掉。

## 怎么更新

- 改文字:直接改对应的 `.html`。页头和页脚每个页面各有一份,要改就每页都改,用编辑器的全局替换最快。
- 换图:把新图放进 `img/`,改 `src`,顺手改 `width`、`height` 和 `alt`。网页用的图长边 2000 像素以内的 JPEG 就够。
- 项目页顶部的大图:电脑上裁成 2:1,`style` 里的 `--pos` 决定保留图的哪一部分(例如 `50% 0%` 是保留上沿);页头的字压在图上,所以 `<header class="site-header">` 的 `data-tone` 按图来写:`dark`、`light`,图太花时写 `mixed`(字底下垫白块)。不想裁的图给 `figure` 加 `is-fit`,整张放在浅灰底上。
- 加项目:复制 `work/` 下任意一页改内容;在 `work/index.html` 对应的组(Projects 或 Personal work)里加一张卡片;再改前后两个项目页底部 “More projects” 里的两张卡片(链接、缩略图、名字)。想上首页轮播就照上面加一张 slide,同时把每张的 `aria-label` 里的 “x of 6” 改对。
- 本地预览:在这个文件夹里运行 `python -m http.server`,浏览器打开 http://localhost:8000/ 。直接双击 `index.html` 也能看。
- 发布:`git add -A`,`git commit`,`git push`。GitHub Pages 一两分钟后更新。

## 以后接自己的域名

现在还没加 CNAME。买好域名后(比如 `ashtonshu.com`):

1. 在仓库根目录新建一个叫 `CNAME` 的文件,里面只写一行域名,例如 `ashtonshu.com`,提交并推送。也可以在仓库 Settings → Pages → Custom domain 里填,GitHub 会自动生成这个文件。
2. 在域名商的 DNS 设置里加记录:
   - 根域名 `@`:4 条 A 记录,`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
   - 想支持 IPv6 的话,再加 4 条 AAAA 记录,`2606:50c0:8000::153`、`2606:50c0:8001::153`、`2606:50c0:8002::153`、`2606:50c0:8003::153`
   - `www`:1 条 CNAME 记录,指向 `mtsyama.github.io`
3. DNS 生效后(几分钟到一天),回到 Settings → Pages 勾选 Enforce HTTPS。
4. 最好先在 GitHub 个人 Settings → Pages 里验证这个域名,防止别人把它绑到自己的仓库上。

站内链接全是相对路径,换域名不用改代码。
