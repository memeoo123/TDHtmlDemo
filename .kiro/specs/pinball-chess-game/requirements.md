# 需求文档

## 简介

策略弹球游戏 Demo —— 一款融合了弹球物理碰撞与棋子策略放置的 HTML5 Canvas 游戏。玩家在弹球台上的碰撞点位放置不同类型的棋子，棋子会定期发射对应类型的弹球；未放置棋子的点位则作为传统弹球碰撞钉，与弹球产生物理碰撞反弹。

## 术语表

- **弹球台（Pinball_Board）**：游戏的主画布区域，包含所有点位、棋子和弹球
- **点位（Pin_Point）**：弹球台上的碰撞节点，可放置棋子或作为碰撞钉
- **棋子（Chess_Piece）**：放置在点位上的策略单元，具有类型属性，可定期发射弹球
- **棋子弹球（Chess_Ball）**：由棋子发射的弹球，继承棋子的类型属性，具有物理运动特性
- **碰撞钉（Collision_Pin）**：未放置棋子的空点位，作为传统弹球碰撞障碍物
- **发射器（Launcher）**：位于弹球台底部，用于将初始弹球发射到弹球台上
- **棋子类型（Piece_Type）**：棋子的分类属性，决定弹球的外观和行为特征
- **士兵（Soldier）**：棋子弹球落到弹球台底部地面后转化而成的地面单位，继承弹球的类型属性，沿地面向右移动

## 需求

### 需求 1：弹球台渲染与布局

**用户故事：** 作为玩家，我希望看到一个清晰的弹球台界面，以便我能理解游戏区域和各元素的位置。

#### 验收标准

1. WHEN 游戏页面加载完成, THE 弹球台（Pinball_Board） SHALL 在 Canvas 上渲染一个固定尺寸的弹球台区域，包含边界墙壁
2. WHEN 弹球台渲染完成, THE 弹球台（Pinball_Board） SHALL 以网格或预设模式显示所有点位（Pin_Point）的位置
3. WHEN 弹球台渲染完成, THE 弹球台（Pinball_Board） SHALL 在底部显示发射器（Launcher）区域
4. THE 弹球台（Pinball_Board） SHALL 使用不同的视觉样式区分空点位（碰撞钉）和已放置棋子的点位

### 需求 2：物理系统与碰撞机制

**用户故事：** 作为玩家，我希望弹球能受重力影响从上往下运动，并与空点位产生物理碰撞反弹，以获得传统弹球游戏的体验。

#### 验收标准

1. WHILE 棋子弹球（Chess_Ball）在弹球台上运动, THE 弹球台（Pinball_Board） SHALL 对弹球施加向下的重力加速度，使弹球持续受到从上往下的重力影响
2. WHEN 棋子弹球（Chess_Ball）接触到碰撞钉（Collision_Pin）, THE 弹球台（Pinball_Board） SHALL 根据碰撞角度计算反弹方向，使弹球产生物理反弹
3. WHEN 棋子弹球（Chess_Ball）碰撞到弹球台边界墙壁, THE 弹球台（Pinball_Board） SHALL 使弹球沿墙壁法线方向反弹
4. WHEN 棋子弹球（Chess_Ball）到达弹球台底部地面, THE 弹球台（Pinball_Board） SHALL 移除该弹球并在弹球落地位置生成一个士兵（Soldier）
5. WHEN 棋子弹球（Chess_Ball）与棋子（Chess_Piece）所在点位接触, THE 弹球台（Pinball_Board） SHALL 使弹球穿过该点位而不产生碰撞反弹

### 需求 3：棋子放置与管理

**用户故事：** 作为玩家，我希望能在点位上放置和管理棋子，以实施我的策略。

#### 验收标准

1. WHEN 玩家点击一个空点位（碰撞钉）, THE 弹球台（Pinball_Board） SHALL 显示可用棋子类型的选择面板
2. WHEN 玩家从选择面板中选定一个棋子类型, THE 弹球台（Pinball_Board） SHALL 在该点位放置对应类型的棋子（Chess_Piece），并将该点位从碰撞钉转变为棋子点位
3. WHEN 玩家点击一个已放置棋子的点位, THE 弹球台（Pinball_Board） SHALL 显示移除棋子的选项
4. WHEN 玩家确认移除棋子, THE 弹球台（Pinball_Board） SHALL 将该点位恢复为碰撞钉（Collision_Pin）状态

### 需求 4：棋子类型与属性

**用户故事：** 作为玩家，我希望有多种棋子类型可供选择，以丰富我的策略组合。

#### 验收标准

1. THE 弹球台（Pinball_Board） SHALL 提供至少三种不同的棋子类型（Piece_Type），每种类型具有独特的颜色标识
2. THE 弹球台（Pinball_Board） SHALL 为每种棋子类型定义独立的弹球发射间隔时间
3. THE 弹球台（Pinball_Board） SHALL 为每种棋子类型定义独立的弹球初始速度
4. WHEN 棋子（Chess_Piece）发射弹球时, THE 棋子弹球（Chess_Ball） SHALL 继承该棋子的类型颜色标识

### 需求 5：棋子弹球发射机制

**用户故事：** 作为玩家，我希望棋子能自动定期发射弹球，以产生持续的弹球互动效果。

#### 验收标准

1. WHILE 游戏处于运行状态, THE 棋子（Chess_Piece） SHALL 按照其类型定义的发射间隔时间，自动向随机方向发射棋子弹球（Chess_Ball）
2. WHEN 棋子（Chess_Piece）发射弹球, THE 棋子弹球（Chess_Ball） SHALL 从棋子所在点位出发，以该棋子类型定义的初始速度运动
3. WHEN 棋子弹球（Chess_Ball）与另一个棋子弹球发生碰撞, THE 弹球台（Pinball_Board） SHALL 根据两个弹球的运动方向和速度计算碰撞后的反弹轨迹

### 需求 6：弹球发射器

**用户故事：** 作为玩家，我希望能手动发射弹球到弹球台上，以主动参与游戏互动。

#### 验收标准

1. WHEN 玩家点击发射器（Launcher）区域或按下空格键, THE 发射器（Launcher） SHALL 从弹球台底部向上发射一个默认类型的棋子弹球（Chess_Ball）
2. WHEN 发射器发射弹球, THE 棋子弹球（Chess_Ball） SHALL 以固定初始速度向上运动，并受重力和碰撞影响
3. THE 发射器（Launcher） SHALL 在发射后经过冷却时间后才能再次发射，防止连续快速发射

### 需求 7：游戏循环与状态管理

**用户故事：** 作为玩家，我希望游戏能流畅运行并提供基本的控制功能。

#### 验收标准

1. THE 弹球台（Pinball_Board） SHALL 以每秒 60 帧的目标帧率运行游戏循环，持续更新弹球位置和渲染画面
2. WHEN 玩家点击暂停按钮, THE 弹球台（Pinball_Board） SHALL 暂停游戏循环，冻结所有弹球运动和棋子发射
3. WHEN 玩家点击继续按钮, THE 弹球台（Pinball_Board） SHALL 恢复游戏循环，继续所有弹球运动和棋子发射
4. WHEN 玩家点击重置按钮, THE 弹球台（Pinball_Board） SHALL 清除所有弹球、棋子和士兵，将弹球台恢复到初始状态

### 需求 8：士兵机制

**用户故事：** 作为玩家，我希望弹球落地后能转化为士兵在地面移动，以增加游戏的策略深度和视觉趣味。

#### 验收标准

1. WHEN 棋子弹球（Chess_Ball）到达弹球台底部地面, THE 弹球台（Pinball_Board） SHALL 在弹球落地的水平位置生成一个士兵（Soldier）
2. THE 士兵（Soldier） SHALL 继承其来源棋子弹球的类型颜色标识
3. WHILE 士兵（Soldier）存在于弹球台上, THE 士兵（Soldier） SHALL 以固定速度沿地面从左向右持续移动
4. WHEN 士兵（Soldier）移动到弹球台右侧边界之外, THE 弹球台（Pinball_Board） SHALL 移除该士兵并结束其生命周期
5. THE 弹球台（Pinball_Board） SHALL 使用与弹球不同的视觉样式渲染士兵（Soldier），使玩家能清晰区分弹球和士兵
