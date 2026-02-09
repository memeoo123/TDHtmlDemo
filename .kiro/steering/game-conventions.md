---
inclusion: auto
---

# 策略弹球棋子游戏 — 核心约定

## 术语表

| 术语 | 英文标识 | 含义 |
|------|----------|------|
| 弹球台 | Pinball_Board | 游戏主画布区域，包含所有点位、棋子和弹球 |
| 点位 | PinPoint | 弹球台上的碰撞节点，可放置棋子或作为碰撞钉 |
| 棋子 | ChessPiece | 放置在点位上的策略单元，具有类型属性，可定期发射弹球 |
| 棋子弹球 | Ball | 由棋子发射的弹球，继承棋子的类型属性，具有物理运动特性 |
| 碰撞钉 | Collision_Pin | 未放置棋子的空点位，作为传统弹球碰撞障碍物 |
| 发射器 | Launcher | 位于弹球台底部，玩家手动发射弹球的组件 |
| 棋子类型 | PieceType | 棋子的分类属性（FIRE/ICE/THUNDER），决定弹球外观和行为 |
| 士兵 | Soldier | 弹球落到地面后转化的地面单位，继承弹球类型，向右移动 |
| 敌人 | Enemy | 从右侧生成的敌方单位，向左移动，与士兵战斗 |
| 投射物 | Projectile | 远程型单位发射的攻击弹体 |
| 波次 | Wave | 游戏推进的基本单位，每波包含预定义的敌人配置 |
| 整备阶段 | Shop_Phase | 波次开始前的准备阶段，可从商店拖拽购买棋子、拖拽移动/交换/升级棋子、拖拽到商店卖出棋子 |
| 战斗阶段 | Combat_Phase | 波次的战斗阶段，棋子自动发射弹球，敌人涌入，可拖拽移动/交换/升级棋子，禁止购买和卖出 |
| 商店 | Shop | 金币管理和棋子购买系统 |
| 棋子等级 | Piece_Level | 棋子的强化等级，范围 1-5，通过合并同类型同等级棋子升级 |
| 升级/合并 | Upgrade/Merge | 将两个相同类型且相同等级的棋子合并为等级+1的棋子（两个阶段均可通过拖拽触发） |
| 等级倍率 | Level_Multiplier | 等级对士兵属性（HP/攻击/速度）的乘数系数 |
| 技能 | Skill | 5 级棋子解锁的专属能力，在战斗阶段自动生效 |
| 卖出价格 | Sell_Price | 棋子卖出时退还的金币，等于 `floor(2^(level-1) × price / 2)` |
| 拖拽管理器 | DragManager | 管理所有拖拽交互状态（来源、预览位置、目标判定） |

## 架构约定

- **单文件架构**：所有游戏核心逻辑在 `index.html` 的 `<script>` 标签中
- **策略模式外置**：`combat-behaviors.js`（战斗行为）+ `combat-renderers.js`（渲染策略）通过 `<script src>` 引入
- **配置外置**：`piece-config.json`、`enemy-config.json`、`board-config.json`、`wave-config.json`、`physics-config.json`、`balance-config.json`、`initial-layout.js` 通过 fetch 或 script 加载，失败时回退内置默认值
- **全局配置对象**：`PhysicsConfig`（物理参数：重力、碰撞衰减、弹球/点位半径）和 `BalanceConfig`（平衡参数：近战距离、生成间隔、实体上限、投射物半径、单位尺寸）在 `index.html` 中定义内置默认值，外部 JSON 通过 `Object.assign` 覆盖

## 关键设计决策

- 所有点位（无论是否放置棋子）都与弹球产生碰撞反弹
- 类型传递链：棋子类型 → 弹球类型 → 士兵类型，全程保持一致
- 战斗类型通过策略注册表（`COMBAT_BEHAVIORS` / `COMBAT_RENDERERS`）分派，新增类型只需注册，不改核心代码
- 波次分两阶段：shop（可购买放置棋子）→ combat（自动战斗，可移动已放置棋子，禁止购买）
- 所有棋子操作统一通过拖拽完成：商店→点位（购买）、点位→点位（移动/交换/升级）、点位→商店（卖出，仅整备阶段）
- 拖拽到已有棋子的点位时：同类型同等级→升级，否则→交换位置
- 卖出价格 = `floor(2^(level-1) × price / 2)`，即总投入价值的一半
- 战斗阶段禁止从商店购买和向商店卖出，但允许点位间拖拽（移动/交换/升级）
- 击败敌人获得金币（`enemy.score`），金币跨波次保留
- 棋子等级 1-5，两个同类型同等级棋子可在整备阶段合并升级，等级倍率作用于士兵 HP/攻击/速度
- 5 级棋子解锁专属技能，技能定义在 `piece-config.json` 的 `skill` 字段中

## 测试约定

- 属性测试库：fast-check
- 测试框架：vitest
- 属性测试标签格式：`**Feature: pinball-chess-game, Property {number}: {property_text}**`
