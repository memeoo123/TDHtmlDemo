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
| 棋子类型 | PieceType | 棋子的分类属性（FIRE/ICE/THUNDER/EARTH/WIND/DARK/HOLY/POISON），决定弹球外观和行为 |
| 士兵 | Soldier | 弹球落到地面后转化的地面单位，继承弹球类型，智能追踪敌人，无敌人时右边界待命 |
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
| 烈焰光环 | Aura_Skill | FIRE 5 级技能，士兵对范围内敌人施加持续灼烧伤害（damagePerSecond × dt） |
| 冰霜减速 | Slow_Skill | ICE 5 级技能，投射物命中时减缓敌人移动速度，持续一定时间后恢复 |
| 连锁闪电 | Chain_Skill | THUNDER 5 级技能，近战攻击时闪电跳跃到附近敌人，伤害逐次衰减 |
| 岩卫士 | EARTH | 近战肉盾型棋子，高HP低攻速，5级技能岩石壁垒（aura） |
| 风行者 | WIND | 远程速射型棋子，高速低血，5级技能疾风连射（slow） |
| 暗影刺客 | DARK | 近战爆发型棋子，高攻高速脆皮，5级技能暗影突袭（chain） |
| 圣光牧师 | HOLY | 远程辅助型棋子，均衡属性，5级技能圣光审判（slow） |
| 毒蛇术士 | POISON | 远程持续伤害型棋子，中等属性，5级技能剧毒弥漫（aura） |
| 狂战士 | BRUTE | 近战重型敌人，高HP高攻击但移动缓慢 |
| 暗杀者 | ASSASSIN | 近战刺客型敌人，高速高攻但血量低 |
| 法师 | MAGE | 远程高伤敌人，射程远攻击间隔长 |
| 盾卫 | SHIELDBEARER | 近战超级肉盾敌人，极高HP但攻击力低 |
| 弩手 | CROSSBOW | 远程速射型敌人，高攻速高弹速 |
| 关卡 | Stage | 游戏的独立关卡单元，每关包含专属的弹球台配置和波次配置 |
| 关卡选择界面 | Level_Select_Screen | 游戏启动时显示的关卡列表界面，玩家点击选择关卡后进入游戏 |
| 关卡配置 | Stage_Config | 单个关卡的完整配置数据，包含 id、name、initialGold、playerHP、boardConfig、waveConfig |
| 初始金币 | Initial_Gold | 关卡开始时玩家拥有的金币数量，定义在 Stage_Config 的 `initialGold` 字段中，`selectStage()` 加载后覆盖 Shop 默认值 |
| 游戏画面状态 | Game_Screen | Game 类的 `gameScreen` 属性，值为 `'level-select'` 或 `'playing'` |
| 玩家血量 | Player_HP | 玩家当前生命值，敌人突破防线时扣除，归零则游戏失败 |
| 泄漏伤害 | Leak_Damage | 敌人走出屏幕左侧时扣除的血量，定义在 Enemy_Config 的 `leakDamage` 字段中 |
| 游戏失败 | Game_Over | 玩家血量归零后的游戏状态，停止战斗循环并显示失败界面 |
| 智能追踪 | Smart_Tracking | 士兵的新移动行为：双向追踪最近敌人，无敌人时右边界待命 |

## 架构约定

- **单文件架构**：所有游戏核心逻辑在 `index.html` 的 `<script>` 标签中
- **策略模式外置**：`combat-behaviors.js`（战斗行为：move/findTarget/canEngage + 技能方法 applyChainLightning/applySlowEffect）+ `combat-renderers.js`（渲染策略）通过 `<script src>` 引入
- **配置外置**：`board-config.js`、`physics-config.js`、`balance-config.js`、`level-config.js`、`piece-config.js`、`enemy-config.js`、`wave-config.js`、`stages-config.js`、`initial-layout.js` 均为外部 JS 文件，通过 `<script src>` 引入，定义全局变量（如 `BOARD_CONFIG_EXTERNAL`、`STAGES_CONFIG_EXTERNAL` 等），在 `loadConfigs()` 中覆盖内置默认值
- **全局配置对象**：`PhysicsConfig`（物理参数：重力、碰撞衰减、弹球/点位半径）、`BalanceConfig`（平衡参数：近战距离、生成间隔、实体上限、投射物半径、单位尺寸）、`LevelConfig`（等级倍率表、最大等级）在 `index.html` 中定义内置默认值，外部 JS 通过 `Object.assign` 或直接赋值覆盖

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
- 5 级棋子解锁专属技能，技能定义在 `piece-config.js` 的 `skill` 字段中
- 技能属性传递链：`piece-config.js` skill 定义 → `ChessPiece.fire()` 仅 5 级时写入 effectiveType.skill → `Ball.type.skill` → `Soldier.skill` → 战斗行为策略读取并执行
- 技能效果通过策略模式集成：melee 的 `move()` 接收 `context.enemies` 处理 aura，`applyChainLightning()` 处理 chain；ranged 的投射物携带 `_sourceSkill`，命中时由 `Combat.processProjectiles` 调用 `applySlowEffect()`
- 减速效果（slow）不叠加，刷新持续时间；过期后在 `Enemy.update()` 中恢复原始速度
- 近战战斗伤害处理：近战士兵 vs 敌人在 `processMeleeCombat` 中互相伤害；近战敌人锁定非近战士兵（如远程法师）时，由敌人视角独立处理伤害，避免远程士兵被近战敌人攻击时无伤害的问题
- 游戏启动流程：启动 → 关卡选择界面（level-select）→ 选择关卡 → 用该关卡的 boardConfig/waveConfig 初始化游戏 → 进入整备阶段 → 战斗 → 所有波次完成后可返回选关界面
- 关卡配置优先级：`STAGES_CONFIG_EXTERNAL` 存在且非空时优先使用关卡配置；加载失败或为空时回退用 `BOARD_CONFIG_EXTERNAL` + `WAVE_CONFIG_EXTERNAL` 构造默认单关卡
- `selectStage()` 会用关卡的 boardConfig 覆盖 `BoardConfig`、用 waveConfig 覆盖 `WAVE_CONFIGS`，然后重新初始化弹球台点位网格
- 敌人走出屏幕左侧时扣除 `leakDamage` 点玩家血量（默认 1），血量归零触发 Game Over；`selectStage()` 从关卡配置读取 `playerHP`（默认 20）初始化血量
- 士兵通过 `isSoldier = true` 标识区分敌人，`COMBAT_BEHAVIORS` 的 move/findTarget/canEngage 根据此标识分支处理：士兵双向追踪最近敌人、右边界钳制（`x ≤ BoardConfig.width - 6`）、无敌人时原地待命（不移动）；敌人行为不变
- `enemy-config.js` 中每种敌人类型包含 `leakDamage` 字段，定义突破时扣除的血量

## 测试约定

- 属性测试库：fast-check
- 测试框架：vitest
- 属性测试标签格式：`**Feature: pinball-chess-game, Property {number}: {property_text}**`
