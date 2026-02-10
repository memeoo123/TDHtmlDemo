# 实现计划：策略弹球棋子游戏

## 概述

将策略弹球棋子游戏设计转化为可执行的编码任务。采用纯 HTML5 + Canvas + JavaScript 实现，单个 `index.html` 文件即可运行。

## 已完成任务（摘要）

- [x] 1. 搭建游戏基础框架与弹球台渲染（Canvas、BoardConfig、PinPoint、Renderer）
- [x] 2. 实现物理系统与弹球运动（Ball、Physics、Launcher、碰撞检测）
- [x] 3. 检查点 - 弹球物理系统
- [x] 4. 实现棋子系统（PIECE_TYPES、ChessPiece、放置交互、自动发射）— 子任务 4.1-4.4 已完成
- [x] 6. 实现棋子士兵与弹球落地转化（Soldier、转化逻辑、渲染、更新）— 子任务 6.1-6.4 已完成
- [x] 7. 实现敌人生成与战斗系统（Enemy、Projectile、Combat、生成定时器）
- [x] 8. 集成与完善（UI 控制面板、性能保护、联调优化）
- [x] 9. 最终检查点
- [x] 10. 将棋子和敌人的配置独立为外部文件（piece-config.json、enemy-config.json）
- [x] 11. 将 combatType 战斗类型行为逻辑独立为策略模式（combat-behaviors.js、combat-renderers.js）
- [x] 12. 将弹球台布局与物理参数独立为外部配置（board-config.json）
- [x] 14. 将初始棋子布局独立为外部配置（initial-layout.js）
- [x] 15. 实现波次系统核心逻辑（wave-config.json、WaveManager）
- [x] 16. 实现商店与金币系统（Shop、金币经济）
- [x] 17. 检查点 - 波次和商店核心逻辑
- [x] 18. 实现购买摆放阶段 UI 与交互（商店面板、购买放置、波次信息）
- [x] 19. 集成波次流程到 Game 主循环（阶段感知、波次转换、重置）
- [x] 20. 最终检查点 - 波次商店系统
- [x] 21. 实现兵种自定义矢量图标（melee/ranged 的 Soldier/Enemy 矢量图标）
- [x] 22. 检查点 - 矢量图标渲染
- [x] 23. 实现战斗阶段棋子移动功能（movePiece、交互逻辑、视觉反馈）— 子任务 23.1-23.3 已完成

## 未完成的可选任务（属性测试）

- [ ]* 2.5 编写物理系统属性测试（Property 1-3, 5）
- [ ]* 4.5 编写棋子系统属性测试（Property 6-11）
- [ ]* 6.5 编写棋子士兵属性测试（Property 4, 12-14）
- [ ]* 7.6 编写战斗系统属性测试（Property 15-20）
- [ ]* 15.4 编写波次系统属性测试（Property 21-22）
- [ ]* 16.3 编写商店与金币属性测试（Property 23-24, 27-28）
- [ ]* 18.4 编写放置与阶段门控属性测试（Property 25-26）
- [ ]* 19.5 编写波次转换属性测试（Property 29）
- [ ]* 21.5 编写渲染策略属性测试（Property 30-31）
- [ ]* 25.4 编写升级合并核心属性测试（Property 35-37）
- [ ]* 28.5 编写拖拽交互属性测试（Property 41-45）

## 未完成的必需任务


- [x] 13. 将物理与战斗数值参数独立为外部配置
  - [x] 13.1 创建 `physics-config.json` 物理参数配置文件
    - 提取 `Physics.GRAVITY`（重力加速度，当前 0.15）
    - 提取碰撞衰减系数（点位碰撞 0.92、墙壁碰撞 0.9）
    - 提取弹球半径（当前 5）、点位碰撞半径（当前 8）
  - [x] 13.2 创建 `balance-config.json` 游戏平衡参数配置文件
    - 提取 `Combat.MELEE_RANGE`（近战交战距离，当前 16）
    - 提取 `enemySpawnInterval`（敌人生成间隔，当前 3000ms）
    - 提取实体数量上限：弹球（100）、士兵（50）、敌人（30）
    - 提取投射物半径（当前 3）、单位尺寸（当前 12）
  - [x] 13.3 修改 `index.html` 加载物理与平衡参数
    - 在 `loadConfigs` 中增加两个 JSON 的 fetch 加载
    - 用加载的数据覆盖 `Physics.GRAVITY`、碰撞衰减系数、`Combat.MELEE_RANGE`、Game 中的各项上限参数
    - 加载失败时保留内置默认值





- [x] 25. 实现棋子等级系统与升级合并核心逻辑
  - [x] 25.1 扩展 `ChessPiece` 类，新增 `level` 属性和等级相关方法
    - 在 constructor 中新增 `level` 参数（默认值 1）
    - 实现静态方法 `getLevelMultiplier(level)`，返回等级倍率（1→1.0, 2→1.3, 3→1.6, 4→2.0, 5→2.5）
    - 实现 `getEffectiveStats()` 方法，返回 `{ soldierHP, soldierAttack, soldierSpeed }` 乘以等级倍率后的值
    - 实现 `hasSkill()` 方法（level >= 5 返回 true）
    - _Requirements: 15.3, 15.4_
  - [x] 25.2 修改 `ChessPiece.fire()` 方法，使弹球携带升级后的有效属性
    - fire() 生成 Ball 时，将 type 替换为包含有效属性的对象（合并 type 基础配置与 getEffectiveStats() 的结果）
    - 确保 Soldier 构造时直接使用升级后的 soldierHP/soldierAttack/soldierSpeed
    - _Requirements: 15.5_
  - [x] 25.3 在 `Game` 类中实现 `mergePieces(sourcePin, targetPin)` 方法
    - 验证当前阶段为 shop、两个点位均有棋子、类型相同（`===`）、等级相同、源棋子等级 < 5
    - 合并成功：目标棋子 level += 1，源点位清空（chessPiece = null）
    - 合并失败：返回 false，不改变任何状态
    - _Requirements: 15.1, 15.2, 15.3, 15.7_
  - [ ]* 25.4 编写升级合并核心属性测试
    - **Property 35: 同类型同等级棋子合并升级**
    - **Property 36: 类型或等级不同时拒绝合并**
    - **Property 37: 棋子等级始终在有效范围内**
    - **Validates: Requirements 15.1, 15.2, 15.3**

- [x] 26. 实现升级属性传递与 5 级技能
  - [x] 26.1 在 `piece-config.json` 中为每种棋子类型新增 `skill` 字段
    - FIRE: `{ "name": "烈焰光环", "type": "aura", "damagePerSecond": 0.5, "radius": 40 }`
    - ICE: `{ "name": "冰霜减速", "type": "slow", "slowFactor": 0.5, "duration": 2000 }`
    - THUNDER: `{ "name": "连锁闪电", "type": "chain", "chainCount": 2, "chainDamageRatio": 0.5, "chainRange": 60 }`
    - _Requirements: 15.6_
  - [x] 26.2 在 `combat-behaviors.js` 中集成 5 级技能效果
    - melee 策略的 move/攻击逻辑中检查 `soldier.skill`，若为 aura 类型则对范围内敌人施加持续伤害
    - ranged 策略的攻击逻辑中检查 `soldier.skill`，若为 slow 类型则减缓被击中敌人的速度
    - melee 策略中检查 chain 类型技能，攻击时闪电跳跃到附近敌人
    - _Requirements: 15.6_
  - [x] 26.3 修改 `Soldier` 构造函数，支持技能属性传递
    - 从 Ball 的 type 中读取 skill 字段（仅 5 级棋子的弹球携带 skill）
    - 将 skill 存储在 Soldier 实例上供战斗行为策略使用
    - _Requirements: 15.5, 15.6_
  - [ ]* 26.4 编写属性传递与技能属性测试
    - **Property 38: 升级属性倍率与士兵继承一致性**
    - **Property 39: 5 级棋子具有技能**
    - **Validates: Requirements 15.4, 15.5, 15.6**

- [ ] 27. 检查点 - 确保升级核心逻辑和属性传递正常
  - 确保所有测试通过，如有问题请询问用户。

- [x] 28. 实现拖拽交互系统与卖出机制
  - [x] 28.1 实现 `DragManager` 类
    - 实现 constructor(game)、dragSource、isDragging、dragPreviewPos 属性
    - 实现 startDragFromShop(pieceType)：记录拖拽来源为商店棋子类型
    - 实现 startDragFromPin(pin)：记录拖拽来源为点位棋子
    - 实现 updateDragPosition(x, y)：更新拖拽预览坐标
    - 实现 endDrag(targetPin, isShopArea)：根据来源和目标执行购买/移动/升级/交换/卖出
    - 实现 cancelDrag()：取消拖拽，恢复原状
    - _Requirements: 3.1-3.9_
  - [x] 28.2 实现 `ChessPiece.getSellPrice()` 和 `Game.swapPieces()` 方法
    - 实现静态方法 `ChessPiece.getTotalValue(pieceType, level)`：返回 `2^(level-1) × pieceType.price`
    - 实现静态方法 `ChessPiece.getSellPrice(pieceType, level)`：返回 `floor(getTotalValue / 2)`
    - 实现 `Game.swapPieces(pinA, pinB)`：交换两个点位上的棋子
    - 修改 `Shop` 类新增 `sellPiece(pieceType, level)` 方法，增加 getSellPrice 计算的金币
    - _Requirements: 3.5, 3.6, 3.9_
  - [x] 28.3 替换现有点击交互为拖拽交互
    - 替换 canvas click 事件为 mousedown/mousemove/mouseup 事件组合
    - mousedown 在商店棋子上 → startDragFromShop
    - mousedown 在点位棋子上 → startDragFromPin
    - mousemove → updateDragPosition
    - mouseup → endDrag（判断目标是点位还是商店区域）
    - 移除旧的 selectionPanel 和 movingPiece 逻辑
    - _Requirements: 3.1-3.8_
  - [x] 28.4 在 Renderer 中实现拖拽预览绘制
    - 拖拽过程中在鼠标位置绘制半透明棋子预览
    - 高亮有效的放置目标点位
    - 在 `Renderer.drawPinPoint` 中显示棋子等级标识（"Lv.1" ~ "Lv.5"）
    - _Requirements: 3.8_
  - [ ]* 28.5 编写拖拽交互属性测试
    - **Property 41: 卖出棋子退还总价值一半**
    - **Property 42: 拖拽商店棋子到空点位完成购买**
    - **Property 43: 拖拽点位棋子到已有棋子点位交换位置**
    - **Property 44: 战斗阶段禁止卖出**
    - **Property 45: 金币不足时拒绝购买**
    - **Validates: Requirements 3.1, 3.2, 3.5, 3.6, 3.7, 3.9**

- [ ] 29. 最终检查点 - 确保棋子升级系统和拖拽交互完整运行
  - 确保所有测试通过，如有问题请询问用户。
  - 验证完整流程：从商店拖拽购买棋子 → 拖拽到点位放置 → 拖拽合并升级 → 拖拽交换位置 → 拖拽到商店卖出 → 战斗阶段禁止卖出但允许移动和升级

- [x] 30. 实现关卡选择系统
  - [x] 30.1 创建 `stages-config.js` 关卡配置文件
    - 定义全局变量 `STAGES_CONFIG_EXTERNAL`，包含至少 2 个关卡
    - 每个关卡包含 `id`（编号）、`name`（名称）、`boardConfig`（弹球台配置）、`waveConfig`（波次配置）
    - 第一关复用现有 board-config.js 和 wave-config.js 的数据
    - 在 `index.html` 中通过 `<script src="stages-config.js">` 引入
    - _Requirements: 16.4, 16.5_
  - [x] 30.2 扩展 `Game` 类，新增关卡选择状态和加载逻辑
    - 新增 `gameScreen` 属性（'level-select' | 'playing'），初始值 'level-select'
    - 新增 `stages` 数组和 `currentStageIndex` 属性
    - 在 `loadConfigs()` 中加载 `STAGES_CONFIG_EXTERNAL`，加载失败或为空时用现有 `BOARD_CONFIG_EXTERNAL` + `WAVE_CONFIG_EXTERNAL` 构造默认单关卡
    - _Requirements: 16.1, 16.5, 16.6_
  - [x] 30.3 实现 `selectStage(stageIndex)` 方法
    - 用关卡的 `boardConfig` 覆盖 `BoardConfig`
    - 用关卡的 `waveConfig` 初始化波次管理器
    - 重新初始化弹球台（点位网格依赖 BoardConfig）
    - 设置 `gameScreen = 'playing'`，进入整备阶段
    - _Requirements: 16.3, 16.4_
  - [x] 30.4 实现关卡选择界面渲染和交互
    - 在 `Renderer` 中新增 `drawLevelSelectScreen(stages, canvas)` 方法，绘制关卡卡片列表（显示编号和名称）
    - 修改 `render()` 方法，根据 `gameScreen` 状态决定绘制选关界面还是游戏画面
    - 修改 Canvas 事件处理，`level-select` 状态下检测关卡卡片点击并调用 `selectStage()`
    - _Requirements: 16.1, 16.2, 16.3_
  - [x] 30.5 实现返回关卡选择界面功能
    - 实现 `returnToLevelSelect()` 方法：设置 `gameScreen = 'level-select'`，重置游戏状态（清空弹球、士兵、敌人等）
    - 所有波次完成后显示"返回选关"按钮
    - 游戏 UI 区域添加"返回选关"按钮入口
    - _Requirements: 16.7_
  - [ ]* 30.6 编写关卡选择系统属性测试
    - **Property 46: 选择关卡后使用该关卡配置初始化游戏**
    - **Property 47: 返回关卡选择界面重置游戏状态**
    - **Validates: Requirements 16.3, 16.4, 16.7**

- [ ] 31. 检查点 - 确保关卡选择系统完整运行
  - 确保所有测试通过，如有问题请询问用户。
  - 验证完整流程：启动显示选关界面 → 选择关卡 → 使用关卡配置进入游戏 → 完成波次后返回选关界面 → 选择另一关卡

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号以便追溯
- 检查点用于阶段性验证，确保增量开发的正确性
