# ashtonshu-site

Zhengshen Shu 的个人网站原型。纯静态 HTML、CSS、JS,没有框架,也没有构建步骤,用 GitHub Pages 托管。

线上地址:https://mtsyama.github.io/ashtonshu-site/

视觉沿用 2026 年 10 月的 placement 作品集 v3:Inter 正文,Poppins 700 做大标题,细体大编号,描边胶囊标签,白底黑字加黑色竖线。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 首页:名字、一句话介绍、前 6 个项目 |
| `work/index.html` | 全部 10 个项目 |
| `work/superlinear-academy.html` | 01 Superlinear Academy |
| `work/hack4change.html` | 02 hack4change |
| `work/wine-and-dance.html` | 03 Wine & Dance |
| `work/zsa-moonlander.html` | 04 ZSA Moonlander |
| `work/drink-packaging.html` | 05 Drink Packaging |
| `work/tarot-deck.html` | 06 Tarot Deck |
| `work/greeting-cards.html` | 07 Greeting Cards |
| `work/postcards.html` | 08 Postcards |
| `work/campaign-works.html` | 09 Campaign Works |
| `work/photography.html` | 10 Photography |
| `about.html` | 头像、三行简介、简历 |
| `contact.html` | 邮箱、Linktree、联系表单 |

联系表单点“Send”会打开访客自己的邮件程序,内容已经填好,不经过任何第三方表单服务。

`css/style.css` 是全站样式,`img/` 放全部图片。项目文字、标题和标签都照搬作品集,一字没改。

## 没放进来的内容

- 一个客户项目:只同意放在私下发出的作品集里,公开网站不放。简历里那段合同工作保留,去掉了客户名。
- 电话号码。
- 贺卡的印刷文件,上面有真实姓名。网站只用占位名字的展示图。
- 作品集简历页上的实习时间那一行,只跟 placement 申请有关。
- 所有页面都带 `<meta name="robots" content="noindex">`,搜索引擎不收录。决定公开时再删掉。

## 怎么更新

- 改文字:直接改对应的 `.html`。页头和页脚每个页面各有一份,要改就每页都改,用编辑器的全局替换最快。
- 换图:把新图放进 `img/`,改 `src`,顺手改 `width`、`height` 和 `alt`。网页用的图长边 2000 像素以内的 JPEG 就够。
- 加项目:复制 `work/` 下任意一页改内容;在 `work/index.html` 加一张卡片(首页只放前 6 个);再改前后两个项目页底部的 Previous / Next 链接,编号顺延。
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
