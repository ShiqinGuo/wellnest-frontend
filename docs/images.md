# 前端图片来源

图片仅用于营造运动与健康生活场景，不表示模特使用过本产品或取得某种测评效果。素材下载后随静态资源部署，选择、裁切、替换由 `frontend/src/imagery.ts` 和样式控制；后端不存图片 URL。

| 本地素材 | 摄影者与来源 | 使用位置 |
|---|---|---|
| `public/images/pilates-stretch.jpg` | [Ahmet Kurt / Unsplash](https://unsplash.com/photos/a-woman-is-doing-exercises-on-a-pilates-xtR4JjZeogY) | 首页、女性测评解锁卡与弹窗 |
| `public/images/yoga-stretch.jpg` | [wee lee / Unsplash](https://unsplash.com/photos/man-stretching-on-black-mat-TTqSzjAXqaA) | 男性测评解锁卡与弹窗 |

2026-09-21 核对：两个来源页面均标注 Free to use under the [Unsplash License](https://unsplash.com/license)，允许下载和商业/非商业使用。素材做了适合网页的尺寸与质量压缩。页面采用 BetterMe 调研中的奶油色、深棕文字、大按钮与单题节奏；没有复制其品牌、用户评价或效果承诺。

## 桌面实拍选择卡（2026-09-21）

已移除代码绘制的人物插画。新增素材经逐张查看后按场景、人物位置与桌面裁切挑选；照片不代表运动频率与具体运动种类之间存在必然对应。

| 本地素材 | 摄影者与来源 | 场景 |
|---|---|---|
| `desk.webp` | [RDNE Stock project / Pexels](https://www.pexels.com/photo/woman-sitting-at-her-desk-while-working-on-her-laptop-10375969/) | 办公久坐 |
| `walking.webp` | [Ana Daza / Pexels](https://www.pexels.com/photo/smiling-woman-in-sportswear-walking-on-pavement-17354888/) | 户外散步、轻活动 |
| `stretch.webp` | [Anna Shvets / Pexels](https://www.pexels.com/photo/woman-in-beige-tight-activewear-in-studio-5012079/) | 室内伸展 |
| `strength.webp` | [Anna Shvets / Pexels](https://www.pexels.com/photo/a-woman-using-a-dumbbells-in-the-gym-4587371/) | 哑铃力量训练 |

来源页标注 Free to use，许可见 [Pexels License](https://www.pexels.com/license/)。站内部署 WebP，共约 317 KiB；不依赖图片站点在用户浏览时可用。未采用搜索结果中的男性大头特写，因为与其余场景构图不协调；男性卡片沿用已有的实际伸展照片。

桌面运动选项采用四卡横排，人物与操作按钮同时留在视野中。动效以 CSS 管理：按钮反馈 160ms、选择反馈 240ms、标题与换题 360ms、照片过渡 450–480ms。选中勾选、反馈文字、进度条、换题与弹窗出现各有对应动作。无自动翻题或为播放动效而延迟保存；系统要求减少动态效果时禁用动画与位移。

## 性别与数值页场景（2026-09-21）

| 本地素材 | 摄影者与来源 | 场景 |
|---|---|---|
| `male-desk.webp` | [Thirdman / Pexels](https://www.pexels.com/photo/a-man-using-a-laptop-in-the-office-5060973/) | 男性办公 |
| `male-outdoors.webp` | [Barbara Olsen / Pexels](https://www.pexels.com/photo/anonymous-man-in-sportswear-running-on-path-in-park-7869583/) | 男性户外活动 |
| `male-strength.webp` | [Ivan S / Pexels](https://www.pexels.com/photo/man-exercising-with-dumbbells-4164769/) | 男性力量训练 |

以上来源页均标注 Free to use，适用 Pexels License。男性伸展沿用现有 Unsplash 实拍；女性沿用现有四类场景。选择性别后，运动卡、阶段回应及年龄/体重/目标页使用对应素材。年龄页结合所选活动，体重页结合所选目标；照片仅表达生活场景，不暗示模特的年龄、体重或训练效果。

年龄与体重采用桌面左右布局：生活照片、快捷选择与可调整刻度。数值只出现在输入控制区，不叠在模特照片上。选中时照片轻微放大，数值与反馈更新时短暂淡入；反馈结合性别、活动、目标及体重差值，属于文案变体，不改变服务端计算或设置性别刻板目标。未选择性别时保留入口素材。减少动态效果偏好会关闭动效。本轮新增验收仅针对桌面。

## 生活与饮食场景

- `breakfast.webp`：[Healthy Fruit Bowl / Pexels](https://www.pexels.com/photo/healthy-fruit-bowl-with-strawberries-and-blueberries-6465972/)，旧版饮食素材，当前问卷已替换。
- `rest.webp`：[Cozy bedroom interior / Pexels](https://www.pexels.com/photo/cozy-bedroom-interior-on-sunny-morning-5825712/)，只用于睡眠问题。
- `meal-prep.webp`：[Person Preparing Rice with Vegetables / Pexels](https://www.pexels.com/photo/person-preparing-rice-with-vegetables-16515997/)，用餐和饮食习惯问题，呈现真实备餐而非固定的理想食谱。
- `daylight.webp`：[A Mug on a Windowsill next to a Houseplant / Pexels](https://www.pexels.com/photo/a-mug-on-a-windowsill-next-to-a-houseplant-13284751/)，精力、可用时段和生活看板的休息场景；不再用睡觉照指代白天精力或晚间安排。

来源页标注 Free to use；适用 Pexels License。已查看原始照片并压缩为站内 WebP。场景照片不代表个性化餐单、食物推荐或睡眠效果；人物场景继续按用户所选性别使用原有实拍素材。
