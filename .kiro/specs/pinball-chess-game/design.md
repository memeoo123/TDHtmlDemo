# 设计文档：策略弹球棋子游戏

## 概述

基于 HTML5 Canvas 的策略弹球游戏 Demo，纯 HTML + Canvas + JavaScript 实现。上方弹球区域（点位、棋子、弹球），下方地面战斗区域（士兵 vs 敌人）。波次制推进，每波分购买摆放阶段和战斗阶段。

> 术语表和核心约定见 `.kiro/steering/game-conventions.md`
> 已实现的类接口可直接从代码中读取（index.html、combat-behaviors.js、combat-renderers.js）

## 架构概要

```
index.html              — 所有游戏核心类和逻辑
combat-behaviors.js     — COMBAT_BEHAVIORS 策略注册表（move/findTarget/canEngage）
combat-renderers.js     — COMBAT_RENDERERS 渲染注册表（drawSoldier/drawEnemy）
board-config.js         — 弹球台外部配置覆盖
initial-layout.js       — 初始棋子布局覆盖
stages-config.js        — 关卡配置（每关包含独立的 boardConfig + waveConfig）
*.json                  — piece-config / enemy-config / board-config / wave-config
```

游戏循环：requestAnimationFrame → update(dt) → render()
- 购买摆放阶段：仅商店交互和棋子放置，不执行物理和战斗
- 战斗阶段：物理运动、碰撞检测、棋子发射、战斗判定、波次完成检测

## 未完成设计：拖拽交互系统

### 概述

游戏的核心交互从点击模式改为拖拽模式。所有棋子操作（购买、放置、移动、升级、卖出）统一通过拖拽完成。

### 拖拽来源与目标

| 拖拽来源 | 拖拽目标 | 整备阶段行为 | 战斗阶段行为 |
|----------|----------|-------------|-------------|
| 商店棋子 | 空点位 | 购买并放置（扣金币） | 禁止 |
| 商店棋子 | 已有棋子点位 | 同类型同等级→升级（扣金币），否则→取消 | 禁止 |
| 点位棋子 | 空点位 | 移动 | 移动 |
| 点位棋子 | 已有棋子点位 | 同类型同等级→升级，否则→交换位置 | 同类型同等级→升级，否则→交换位置 |
| 点位棋子 | 商店区域 | 卖出（退还半价） | 禁止（棋子回原位） |

### 拖拽状态机

```
空闲 → mousedown 在商店棋子上 → 拖拽商店棋子状态
空闲 → mousedown 在点位棋子上 → 拖拽点位棋子状态
拖拽中 → mousemove → 更新预览位置
拖拽中 → mouseup 在有效目标上 → 执行操作，回到空闲
拖拽中 → mouseup 在无效区域 → 取消，回到空闲
```

### DragManager 类

```javascript
class DragManager {
    constructor(game)
    dragSource       // 拖拽来源：{ type: 'shop'|'pin', pieceType?, pin? }
    isDragging       // 是否正在拖拽
    dragPreviewPos   // 拖拽预览位置 { x, y }

    startDragFromShop(pieceType)  // 从商店开始拖拽
    startDragFromPin(pin)         // 从点位开始拖拽
    updateDragPosition(x, y)     // 更新拖拽位置
    endDrag(targetPin, isShopArea) // 结束拖拽，执行对应操作
    cancelDrag()                  // 取消拖拽
}
```

### 卖出价格计算

棋子卖出价格 = 生成该等级棋子所需的基础棋子总数 × 单价 / 2

```javascript
// 计算棋子总价值（合成所需的基础棋子数量 × 单价）
static getTotalValue(pieceType, level) {
    const baseCount = Math.pow(2, level - 1); // Lv.1=1, Lv.2=2, Lv.3=4, Lv.4=8, Lv.5=16
    return baseCount * pieceType.price;
}

// 卖出价格 = 总价值 / 2
static getSellPrice(pieceType, level) {
    return Math.floor(ChessPiece.getTotalValue(pieceType, level) / 2);
}
```

| 等级 | 基础棋子数 | 总价值 | 卖出价格 |
|------|-----------|--------|---------|
| 1 | 1 | 1×price | 0.5×price |
| 2 | 2 | 2×price | 1×price |
| 3 | 4 | 4×price | 2×price |
| 4 | 8 | 8×price | 4×price |
| 5 | 16 | 16×price | 8×price |

### 交换位置逻辑

```javascript
swapPieces(pinA, pinB) {
    const pieceA = pinA.chessPiece;
    const pieceB = pinB.chessPiece;
    pinA.chessPiece = pieceB;
    pinB.chessPiece = pieceA;
    if (pieceA) pieceA.pinPoint = pinB;
    if (pieceB) pieceB.pinPoint = pinA;
}
```

## 未完成设计：战斗阶段棋子移动机制

> 注意：战斗阶段的棋子移动现在通过拖拽系统实现（见上方拖拽交互系统设计）。以下保留原有的 movePiece 方法作为底层实现。

### 移动逻辑

```javascript
// Game 类方法（已实现）
movePiece(sourcePin, targetPin) {
    if (sourcePin.isEmpty() || !targetPin.isEmpty()) return false;
    const piece = sourcePin.chessPiece;
    sourcePin.chessPiece = null;
    targetPin.chessPiece = piece;
    piece.pinPoint = targetPin;
    return true;
}
```

### 移动约束

- 两个阶段均允许移动和交换
- 源点位必须有棋子
- 目标为空点位时移动，目标有棋子时判断升级或交换
- 不消耗金币，不重置发射计时器，类型不变

## 未完成设计：棋子升级系统

### 概述

在整备阶段，玩家可将两个相同类型且相同等级的棋子合并升级为更高等级的棋子。等级范围 1-5，升级后属性按倍率提升，5 级解锁专属技能。

### 数据模型变更

#### ChessPiece 类扩展

```javascript
class ChessPiece {
    constructor(type, pinPoint, level = 1) {
        this.type = type;          // 基础类型配置（来自 PIECE_TYPES）
        this.pinPoint = pinPoint;
        this.lastFireTime = 0;
        this.level = level;        // 新增：等级 1-5
    }

    // 新增：获取等级倍率
    static getLevelMultiplier(level) {
        // 等级倍率表：1→1.0, 2→1.3, 3→1.6, 4→2.0, 5→2.5
        const multipliers = [1.0, 1.0, 1.3, 1.6, 2.0, 2.5];
        return multipliers[level] || 1.0;
    }

    // 新增：获取升级后的有效属性
    getEffectiveStats() {
        const mult = ChessPiece.getLevelMultiplier(this.level);
        return {
            soldierHP: this.type.soldierHP * mult,
            soldierAttack: this.type.soldierAttack * mult,
            soldierSpeed: this.type.soldierSpeed * mult,
            // 其他属性（fireInterval, ballSpeed 等）不随等级变化
        };
    }

    // 新增：是否有技能（5级）
    hasSkill() {
        return this.level >= 5;
    }

    // 新增：获取技能定义
    getSkill() {
        if (!this.hasSkill()) return null;
        return PIECE_SKILLS[this.type.name] || null;
    }
}
```

#### 升级后属性传递链

```
ChessPiece(level=N) → fire() → Ball(type=升级后有效属性) → 落地 → Soldier(hp/attack/speed=升级后值)
```

Ball 的 `type` 字段改为携带有效属性而非原始类型配置，确保 Soldier 构造时直接使用升级后的数值。

#### 等级倍率表

| 等级 | 倍率 | 说明 |
|------|------|------|
| 1 | 1.0× | 基础属性 |
| 2 | 1.3× | 首次升级 |
| 3 | 1.6× | |
| 4 | 2.0× | |
| 5 | 2.5× | 解锁专属技能 |

倍率作用于：soldierHP、soldierAttack、soldierSpeed。
不作用于：fireInterval、ballSpeed、price、attackRange、projectileSpeed、attackInterval。

### 5 级专属技能设计

在 `piece-config.json` 中为每种棋子类型新增 `skill` 字段：

```json
{
  "FIRE": {
    "skill": {
      "name": "烈焰光环",
      "type": "aura",
      "description": "火战士的士兵对周围敌人造成持续灼烧伤害",
      "damagePerSecond": 0.5,
      "radius": 40
    }
  },
  "ICE": {
    "skill": {
      "name": "冰霜减速",
      "type": "slow",
      "description": "冰法师的士兵攻击时减缓敌人移动速度",
      "slowFactor": 0.5,
      "duration": 2000
    }
  },
  "THUNDER": {
    "skill": {
      "name": "连锁闪电",
      "type": "chain",
      "description": "雷战士的士兵攻击时闪电跳跃到附近敌人",
      "chainCount": 2,
      "chainDamageRatio": 0.5,
      "chainRange": 60
    }
  }
}
```

技能通过 `COMBAT_BEHAVIORS` 策略模式集成，在对应战斗类型的 `move` 或攻击逻辑中检查 `soldier.skill` 并执行技能效果。

### 升级合并逻辑

```javascript
// Game 类新增方法
mergePieces(sourcePin, targetPin) {
    if (this.waveManager.phase !== 'shop') return false;
    if (sourcePin.isEmpty() || targetPin.isEmpty()) return false;

    const sourcePiece = sourcePin.chessPiece;
    const targetPiece = targetPin.chessPiece;

    // 类型和等级必须相同
    if (sourcePiece.type !== targetPiece.type) return false;
    if (sourcePiece.level !== targetPiece.level) return false;

    // 等级上限检查
    if (sourcePiece.level >= 5) return false;

    // 执行合并：目标点位棋子升级，源点位清空
    targetPiece.level += 1;
    sourcePin.chessPiece = null;

    return true;
}
```

### 交互流程（整备阶段）

```
空闲 → 点击已放置棋子 → 进入拖拽/选中状态
选中状态 → 拖拽到另一个已放置棋子点位：
  ├─ 同类型同等级 → 合并升级，源点位清空
  └─ 不同类型或不同等级 → 拒绝，保持原状
选中状态 → 拖拽到空点位 → 移动棋子（复用现有移动逻辑）
选中状态 → 点击空白区域 → 取消选择
```

### 退还价格规则

卖出棋子时退还该棋子总价值的一半。总价值 = 合成该等级所需的基础棋子数量 × 单价。

```javascript
// Lv.1 卖出 = 0.5×price, Lv.2 = 1×price, Lv.3 = 2×price, Lv.4 = 4×price, Lv.5 = 8×price
static getSellPrice(pieceType, level) {
    const baseCount = Math.pow(2, level - 1);
    return Math.floor(baseCount * pieceType.price / 2);
}
```

此方法替代原有的 `Shop.refundPiece(pieceType)` 逻辑，改为 `Shop.sellPiece(pieceType, level)`。

### 视觉表现

- 在棋子点位上方显示等级数字（1-5）
- 等级越高，棋子光环/描边越亮
- 5 级棋子额外显示技能图标或特殊光效

## 未完成设计：关卡选择系统

### 概述

游戏启动时不再直接进入游戏，而是先显示关卡选择界面。每个关卡拥有独立的弹球台配置（board-config）和波次配置（wave-config），玩家选择关卡后使用对应配置初始化游戏。

### 游戏状态扩展

在现有游戏状态基础上新增 `level-select` 状态：

```
level-select → 选择关卡 → shop（整备阶段）→ combat（战斗阶段）→ ... → 所有波次完成 → level-select
```

Game 类新增 `gameScreen` 属性：

```javascript
// Game 类扩展
class Game {
    constructor() {
        // ... 现有属性
        this.gameScreen = 'level-select'; // 'level-select' | 'playing'
        this.stages = [];                  // 所有关卡配置
        this.currentStageIndex = -1;       // 当前选中的关卡索引
    }
}
```

### 关卡配置数据模型

#### Stage_Config 结构

```javascript
// stages-config.js 定义全局变量
const STAGES_CONFIG_EXTERNAL = [
    {
        id: 1,
        name: "新手试炼",
        boardConfig: {
            width: 600,
            height: 700,
            pinballAreaHeight: 500,
            groundAreaHeight: 200,
            groundY: 500,
            pinRows: 9,
            pinCols: 8,
            pinSpacingX: 75,
            pinSpacingY: 35,
            pinStartX: 45,
            pinStartY: 60,
            wallThickness: 10
        },
        waveConfig: [
            { wave: 1, enemies: [{ type: 'GRUNT', count: 5 }], spawnInterval: 3000 },
            { wave: 2, enemies: [{ type: 'GRUNT', count: 5 }, { type: 'ARCHER', count: 3 }], spawnInterval: 2500 }
        ]
    },
    {
        id: 2,
        name: "进阶挑战",
        boardConfig: { /* 不同的弹球台配置 */ },
        waveConfig: [ /* 不同的波次配置 */ ]
    }
];
```

每个 Stage_Config 必须包含：
- `id`：关卡编号（正整数）
- `name`：关卡名称（字符串）
- `boardConfig`：该关卡的弹球台配置，结构与 `BOARD_CONFIG_EXTERNAL` 一致
- `waveConfig`：该关卡的波次配置，结构与 `WAVE_CONFIG_EXTERNAL` 一致

### 配置加载与回退

在 `loadConfigs()` 中新增 stages-config.js 的加载逻辑：

```javascript
loadConfigs() {
    // ... 现有配置加载

    // 加载关卡配置
    if (typeof STAGES_CONFIG_EXTERNAL !== 'undefined' && Array.isArray(STAGES_CONFIG_EXTERNAL) && STAGES_CONFIG_EXTERNAL.length > 0) {
        this.stages = STAGES_CONFIG_EXTERNAL;
    } else {
        // 回退：用现有的 BOARD_CONFIG_EXTERNAL + WAVE_CONFIG_EXTERNAL 构造默认单关卡
        this.stages = [{
            id: 1,
            name: "默认关卡",
            boardConfig: typeof BOARD_CONFIG_EXTERNAL !== 'undefined' ? BOARD_CONFIG_EXTERNAL : {},
            waveConfig: typeof WAVE_CONFIG_EXTERNAL !== 'undefined' ? WAVE_CONFIG_EXTERNAL : []
        }];
    }
}
```

### 关卡选择与初始化流程

```javascript
// 选择关卡并初始化
selectStage(stageIndex) {
    const stage = this.stages[stageIndex];
    if (!stage) return;

    this.currentStageIndex = stageIndex;

    // 用关卡的 boardConfig 覆盖当前弹球台配置
    Object.assign(BoardConfig, stage.boardConfig);

    // 用关卡的 waveConfig 初始化波次管理器
    this.waveManager.loadWaves(stage.waveConfig);

    // 重新初始化弹球台（点位网格等依赖 BoardConfig）
    this.initBoard();

    // 切换到游戏画面，进入整备阶段
    this.gameScreen = 'playing';
    this.waveManager.startShopPhase();
}
```

### 关卡选择界面渲染

在 Renderer 中新增关卡选择界面的绘制：

```javascript
// Renderer 扩展
drawLevelSelectScreen(stages, canvas) {
    // 清空画布，绘制标题
    // 遍历 stages 数组，为每个关卡绘制一个可点击的卡片/按钮
    // 每个卡片显示：关卡编号（id）和关卡名称（name）
    // 布局：居中网格排列
}
```

### 返回关卡选择界面

两个入口：
1. 所有波次完成后，显示"返回选关"按钮
2. 游戏中提供"返回选关"按钮（在暂停/UI 区域）

```javascript
returnToLevelSelect() {
    this.gameScreen = 'level-select';
    this.currentStageIndex = -1;
    // 重置游戏状态（清空弹球、士兵、敌人等）
    this.reset();
}
```

### 事件处理扩展

Canvas 的点击/拖拽事件需根据 `gameScreen` 状态分派：

```javascript
handleMouseDown(e) {
    if (this.gameScreen === 'level-select') {
        // 检测点击了哪个关卡卡片
        const stageIndex = this.getClickedStageIndex(e.x, e.y);
        if (stageIndex >= 0) this.selectStage(stageIndex);
    } else {
        // 现有的拖拽交互逻辑
        this.dragManager.handleMouseDown(e);
    }
}
```

### 对现有配置文件的影响

引入 stages-config.js 后：
- `board-config.js` 和 `wave-config.js` 仍保留作为回退默认值
- 当 `STAGES_CONFIG_EXTERNAL` 存在且非空时，游戏优先使用关卡配置
- 每个关卡的 `boardConfig` 和 `waveConfig` 完全独立，互不影响

## 未完成设计：玩家血量与游戏失败机制

### 概述

引入玩家血量（Player_HP）系统，当敌人突破防线走出屏幕左侧时扣除对应的泄漏伤害，血量归零则游戏失败。为玩家提供紧迫感和策略压力。

### 数据模型变更

#### Game 类扩展

```javascript
class Game {
    constructor() {
        // ... 现有属性
        this.playerHP = 20;        // 当前玩家血量
        this.maxPlayerHP = 20;     // 最大血量（用于血条显示）
        this.isGameOver = false;   // 游戏失败标志
    }
}
```

#### Enemy_Config 扩展

在 `enemy-config.js` 中为每种敌人类型新增 `leakDamage` 字段：

```javascript
const ENEMY_CONFIG_EXTERNAL = {
    GRUNT:       { ..., leakDamage: 1 },
    ARCHER:      { ..., leakDamage: 1 },
    BRUTE:       { ..., leakDamage: 2 },
    ASSASSIN:    { ..., leakDamage: 1 },
    MAGE:        { ..., leakDamage: 2 },
    SHIELDBEARER:{ ..., leakDamage: 3 },
    CROSSBOW:    { ..., leakDamage: 1 }
};
```

泄漏伤害设计原则：高 HP 的肉盾型敌人（BRUTE、SHIELDBEARER、MAGE）突破时扣血更多，普通敌人扣 1 点。

#### Stage_Config 扩展

在关卡配置中新增可选的 `playerHP` 字段：

```javascript
{
    id: 1,
    name: "新手试炼",
    playerHP: 25,       // 可选，未配置时使用默认值 20
    initialGold: 50,
    boardConfig: { ... },
    waveConfig: [ ... ]
}
```

### 血量初始化流程

在 `selectStage()` 中初始化血量：

```javascript
selectStage(stageIndex) {
    const stage = this.stages[stageIndex];
    // ... 现有逻辑

    // 初始化血量
    const hp = stage.playerHP || 20;
    this.playerHP = hp;
    this.maxPlayerHP = hp;
    this.isGameOver = false;
}
```

### 敌人泄漏检测

在 `Game.update()` 的敌人更新循环中检测敌人是否走出左边界：

```javascript
// 在 enemies 更新循环中
for (const enemy of this.enemies) {
    enemy.update(dt);

    // 泄漏检测：敌人完全走出屏幕左侧
    if (enemy.alive && enemy.x + 6 < 0) {  // 6 = 单位半径，完全走出
        const leakDamage = enemy.type.leakDamage || 1;
        this.playerHP -= leakDamage;
        enemy.alive = false;  // 移除该敌人

        // 检查游戏失败
        if (this.playerHP <= 0) {
            this.playerHP = 0;
            this.isGameOver = true;
        }
    }
}
```

### 游戏失败状态处理

```javascript
// Game.update() 开头检查
update(dt) {
    if (this.isGameOver) return;  // 停止战斗循环
    // ... 现有更新逻辑
}
```

### 失败界面渲染

在 Renderer 中新增游戏失败界面绘制：

```javascript
drawGameOverScreen(canvas, ctx) {
    // 半透明黑色遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // "游戏失败" 文字
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('游戏失败', canvas.width / 2, canvas.height / 2 - 30);

    // "返回选关" 按钮
    // ... 绘制可点击按钮
}
```

### 血量 HUD 显示

在战斗区域（地面区域上方）显示血量信息：

```javascript
drawPlayerHP(ctx, playerHP, maxPlayerHP) {
    // 在地面区域左上角绘制血条
    const barX = 10, barY = BoardConfig.groundY + 5;
    const barWidth = 100, barHeight = 12;
    const ratio = playerHP / maxPlayerHP;

    // 背景
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 血量条（绿→黄→红渐变）
    ctx.fillStyle = ratio > 0.5 ? '#44CC44' : ratio > 0.25 ? '#CCCC44' : '#CC4444';
    ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

    // 数字
    ctx.fillStyle = '#FFF';
    ctx.font = '10px sans-serif';
    ctx.fillText(`HP: ${playerHP}/${maxPlayerHP}`, barX + barWidth + 5, barY + 10);
}
```

## 未完成设计：士兵智能追踪行为

### 概述

改变士兵的移动行为：从固定向右移动改为智能追踪。士兵不再走出屏幕右边界，而是在右边界待命；有敌人时自动朝最近敌人方向移动，支持双向移动。

### 行为变更

#### 当前行为（需替换）

- `Soldier.direction` 固定为 1（向右）
- 走出 `BoardConfig.width` 时被移除（`alive = false`）
- `findTarget` 仅搜索面朝方向的目标

#### 新行为

- `Soldier.direction` 动态调整（1 或 -1），根据目标位置决定
- 到达右边界时停下待命，不被移除
- `findTarget` 搜索所有方向的最近敌人
- 无目标时自动向右移动到边界待命

### COMBAT_BEHAVIORS 修改

#### melee 策略修改

```javascript
melee: {
    move(unit, dt, context) {
        // 仅对士兵应用智能追踪（敌人保持原有行为）
        if (unit.isSoldier) {
            if (unit.target && unit.target.alive) {
                // 有目标：朝目标方向移动
                const meleeRange = (typeof Combat !== 'undefined') ? Combat.MELEE_RANGE : 16;
                if (Math.abs(unit.x - unit.target.x) >= meleeRange) {
                    unit.direction = unit.target.x > unit.x ? 1 : -1;
                    unit.x += unit.speed * unit.direction;
                }
                // 在接触距离内则不移动（等待攻击）
            } else {
                // 无目标：向右移动到边界待命
                unit.direction = 1;
                unit.x += unit.speed * unit.direction;
                unit.target = null;
            }

            // 右边界钳制
            if (unit.x > BoardConfig.width - 6) {
                unit.x = BoardConfig.width - 6;
            }
        } else {
            // 敌人：保持原有行为
            if (!unit.target || !unit.target.alive) {
                unit.x += unit.speed * unit.direction;
                unit.target = null;
            } else {
                const meleeRange = (typeof Combat !== 'undefined') ? Combat.MELEE_RANGE : 16;
                if (Math.abs(unit.x - unit.target.x) >= meleeRange) {
                    unit.x += unit.speed * unit.direction;
                }
            }
        }

        // aura 技能逻辑保持不变
        // ...
    },

    findTarget(unit, targets) {
        if (unit.isSoldier) {
            // 士兵：搜索所有方向的最近敌人
            let closest = null;
            let closestDist = Infinity;
            for (const t of targets) {
                if (!t.alive) continue;
                const dist = Math.abs(t.x - unit.x);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = t;
                }
            }
            unit.target = closest;
        } else {
            // 敌人：保持原有行为（仅搜索面朝方向）
            let closest = null;
            let closestDist = Infinity;
            for (const t of targets) {
                if (!t.alive) continue;
                const dist = (t.x - unit.x) * unit.direction;
                if (dist > 0 && dist < closestDist) {
                    closestDist = dist;
                    closest = t;
                }
            }
            unit.target = closest;
        }
    },

    // canEngage 不变
}
```

#### ranged 策略修改

```javascript
ranged: {
    move(unit, dt, context) {
        if (unit.isSoldier) {
            if (unit.target && unit.target.alive) {
                // 有目标且在攻击范围内：停下攻击
                const dist = Math.abs(unit.x - unit.target.x);
                if (dist <= unit.attackRange) {
                    // 停下，面朝目标
                    unit.direction = unit.target.x > unit.x ? 1 : -1;
                } else {
                    // 目标超出范围：朝目标移动
                    unit.direction = unit.target.x > unit.x ? 1 : -1;
                    unit.x += unit.speed * unit.direction;
                }
            } else {
                // 无目标：向右移动到边界待命
                unit.direction = 1;
                unit.x += unit.speed * unit.direction;
                unit.target = null;
            }

            // 右边界钳制
            if (unit.x > BoardConfig.width - 6) {
                unit.x = BoardConfig.width - 6;
            }
        } else {
            // 敌人：保持原有行为
            if (unit.target && unit.target.alive) {
                // 在攻击范围内，停止移动
            } else {
                unit.x += unit.speed * unit.direction;
                unit.target = null;
            }
        }
    },

    findTarget(unit, targets) {
        if (unit.isSoldier) {
            // 士兵：搜索所有方向的最近敌人（在攻击范围内优先）
            let closest = null;
            let closestDist = Infinity;
            for (const t of targets) {
                if (!t.alive) continue;
                const dist = Math.abs(t.x - unit.x);
                if (dist <= unit.attackRange && dist < closestDist) {
                    closestDist = dist;
                    closest = t;
                }
            }
            // 如果范围内没有目标，搜索所有目标
            if (!closest) {
                closestDist = Infinity;
                for (const t of targets) {
                    if (!t.alive) continue;
                    const dist = Math.abs(t.x - unit.x);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closest = t;
                    }
                }
            }
            unit.target = closest;
        } else {
            // 敌人：保持原有行为（仅搜索面朝方向且在攻击范围内）
            let closest = null;
            let closestDist = Infinity;
            for (const t of targets) {
                if (!t.alive) continue;
                const dist = (t.x - unit.x) * unit.direction;
                if (dist > 0 && dist <= unit.attackRange && dist < closestDist) {
                    closestDist = dist;
                    closest = t;
                }
            }
            unit.target = closest;
        }
    },

    // canEngage 修改：士兵使用绝对距离判定
    canEngage(unit, target) {
        if (unit.isSoldier) {
            return Math.abs(unit.x - target.x) <= unit.attackRange;
        }
        const dist = (target.x - unit.x) * unit.direction;
        return dist > 0 && dist <= unit.attackRange;
    },

    // applySlowEffect 不变
}
```

### Soldier 类修改

```javascript
class Soldier {
    constructor(x, y, type) {
        // ... 现有属性
        this.direction = 1;       // 初始向右，但会动态调整
        this.isSoldier = true;    // 新增：标识为士兵（区分敌人）
    }

    update(dt) {
        // 移除原有的 "x > BoardConfig.width 时 alive = false" 逻辑
        // 边界钳制由 COMBAT_BEHAVIORS 的 move 方法处理
    }
}
```

### 对 index.html 的影响

1. `Soldier` 构造函数新增 `isSoldier = true`
2. 移除 `Soldier.update()` 中 `x > BoardConfig.width` 时设置 `alive = false` 的逻辑
3. `Game.update()` 中调用 `COMBAT_BEHAVIORS[].move()` 时传递 `context.enemies` 供技能和追踪使用

### 对 combat-behaviors.js 的影响

1. `melee.move()` 和 `melee.findTarget()` 增加 `unit.isSoldier` 分支
2. `ranged.move()` 和 `ranged.findTarget()` 和 `ranged.canEngage()` 增加 `unit.isSoldier` 分支
3. 敌人行为完全不变，通过 `isSoldier` 标志区分

## 正确性属性（未验证）

> 已验证的属性（Property 1-31）已通过对应的属性测试确认，此处仅列出待验证属性。

### Property 32: 整备阶段不产生弹球和士兵
*对于任意*处于整备阶段的游戏状态和任意数量的已放置棋子，执行游戏更新后，弹球列表和士兵列表的长度应保持不变。
**Validates: Requirements 14.3**

### Property 33: 战斗阶段棋子移动保持不变量
*对于任意*处于战斗阶段的游戏状态、任意已放置棋子的源点位和任意空的目标点位，执行移动操作后：源点位应为空，目标点位应持有棋子，目标点位棋子的类型应与移动前源点位棋子的类型一致，且弹球台上棋子总数保持不变。
**Validates: Requirements 14.5**

### Property 34: 战斗阶段棋子移动到非空点位被拒绝
*对于任意*处于战斗阶段的游戏状态和两个均已放置棋子的点位，执行移动操作后，两个点位的棋子状态应保持不变。
**Validates: Requirements 14.5**

### Property 35: 同类型同等级棋子合并升级
*对于任意*棋子类型和任意等级 L（1 ≤ L ≤ 4），在整备阶段将两个相同类型且等级为 L 的棋子执行合并后，目标点位的棋子等级应为 L+1，类型不变，源点位应为空。
**Validates: Requirements 15.1**

### Property 36: 类型或等级不同时拒绝合并
*对于任意*两个棋子，若它们的类型不同或等级不同，执行合并操作后，两个点位的棋子状态（类型、等级）应保持不变。
**Validates: Requirements 15.2**

### Property 37: 棋子等级始终在有效范围内
*对于任意*棋子和任意次数的升级操作序列，棋子的等级应始终满足 1 ≤ level ≤ 5，且对等级为 5 的棋子执行合并应被拒绝。
**Validates: Requirements 15.3**

### Property 38: 升级属性倍率与士兵继承一致性
*对于任意*棋子类型和任意等级 L（1-5），该棋子发射弹球转化的士兵的 HP 应等于 baseHP × multiplier(L)，攻击力应等于 baseAttack × multiplier(L)，移动速度应等于 baseSpeed × multiplier(L)。
**Validates: Requirements 15.4, 15.5**

### Property 39: 5 级棋子具有技能
*对于任意*棋子类型，等级为 5 的棋子应具有非空的技能定义，等级为 1-4 的棋子不应具有技能。
**Validates: Requirements 15.6**

### Property 40: 战斗阶段禁止升级操作
*对于任意*处于战斗阶段的游戏状态和任意两个相同类型相同等级的棋子，执行合并操作应被拒绝，两个棋子的状态保持不变。
**Validates: Requirements 15.7**

### Property 41: 卖出棋子退还总价值一半
*对于任意*棋子类型和任意等级 L（1-5），卖出该棋子后退还的金币应等于 `floor(2^(L-1) × type.price / 2)`。
**Validates: Requirements 3.6, 3.9**

### Property 42: 拖拽商店棋子到空点位完成购买
*对于任意*棋子类型和充足的金币数量，从商店拖拽棋子到空点位后，该点位应持有对应类型的 Lv.1 棋子，金币应减少 type.price。
**Validates: Requirements 3.1**

### Property 43: 拖拽点位棋子到已有棋子点位交换位置
*对于任意*两个不同类型或不同等级的棋子分别在点位 A 和点位 B 上，拖拽 A 到 B 后，A 点位应持有原 B 的棋子，B 点位应持有原 A 的棋子。
**Validates: Requirements 3.5**

### Property 44: 战斗阶段禁止卖出
*对于任意*处于战斗阶段的游戏状态和任意已放置棋子的点位，执行卖出操作后，该点位的棋子状态和金币数量应保持不变。
**Validates: Requirements 3.7**

### Property 45: 金币不足时拒绝购买
*对于任意*棋子类型和不足的金币数量（gold < type.price），从商店拖拽棋子到空点位后，该点位应保持为空，金币数量不变。
**Validates: Requirements 3.2**

### Property 46: 选择关卡后使用该关卡配置初始化游戏
*对于任意*有效的关卡配置（包含 boardConfig 和 waveConfig），选择该关卡后，游戏的弹球台配置应等于该关卡的 boardConfig，波次管理器的波次数据应等于该关卡的 waveConfig，且游戏画面状态应为 playing、波次阶段应为 shop。
**Validates: Requirements 16.3, 16.4**

### Property 47: 返回关卡选择界面重置游戏状态
*对于任意*处于 playing 状态的游戏，执行返回关卡选择操作后，游戏画面状态应为 level-select，弹球列表、士兵列表、敌人列表应为空。
**Validates: Requirements 16.7**

### Property 48: 玩家血量初始化
*对于任意*关卡配置（包含或不包含 `playerHP` 字段），选择该关卡后，玩家血量应等于配置的 `playerHP` 值；未配置时应等于默认值 20。
**Validates: Requirements 17.1, 17.6**

### Property 49: 敌人泄漏扣除血量
*对于任意*处于战斗阶段的游戏状态和任意敌人类型，当该敌人走出屏幕左侧时，玩家血量应减少该敌人的 `leakDamage` 值，且该敌人应被移除（alive = false）。
**Validates: Requirements 17.2**

### Property 50: 血量归零触发游戏失败
*对于任意*玩家血量 > 0 的游戏状态和任意泄漏伤害序列，当累计泄漏伤害使血量降至 0 或以下时，游戏应进入 Game_Over 状态（isGameOver = true），且 playerHP 钳制为 0。
**Validates: Requirements 17.4**

### Property 51: 士兵右边界钳制
*对于任意*士兵位置和任意次数的更新，士兵的 x 坐标应始终不超过 `BoardConfig.width - 单位半径`，到达边界时停下而非被移除。
**Validates: Requirements 18.1**

### Property 52: 士兵双向追踪最近敌人
*对于任意*士兵和任意存活敌人集合（非空），士兵的目标应为距离最近的敌人，且士兵的移动方向应朝向该目标（目标在左则 direction = -1，目标在右则 direction = 1）。
**Validates: Requirements 18.2, 18.4**

### Property 53: 无敌人时士兵向右待命
*对于任意*士兵和空的敌人列表，执行 findTarget 和 move 后，士兵的 direction 应为 1（向右），且 target 应为 null。
**Validates: Requirements 18.3**

### Property 54: 远程士兵攻击范围内停止移动
*对于任意*远程士兵和任意存活目标，当士兵与目标的距离 ≤ attackRange 时，士兵应停止移动（x 坐标不变），面朝目标方向。
**Validates: Requirements 18.5**

## 错误处理

- 弹球/士兵/敌人超出边界时强制修正或移除
- 每帧清理死亡实体
- 实体数量上限：弹球 100、士兵 50、敌人 30
- 波次配置加载失败时使用内置默认值
- 战斗阶段禁止商店操作，金币不足时阻止购买
- 合并操作前验证：阶段为 shop、两个点位均有棋子、类型相同、等级相同、等级 < 5
- 等级 5 棋子尝试合并时静默拒绝（不报错，不改变状态）
- 技能配置缺失时棋子正常运作但无技能效果
- 关卡配置文件（stages-config.js）加载失败或为空时，回退使用现有 BOARD_CONFIG_EXTERNAL 和 WAVE_CONFIG_EXTERNAL 构造默认单关卡
- 关卡 boardConfig 或 waveConfig 字段缺失时使用内置默认值补全
- 敌人类型缺少 `leakDamage` 字段时使用默认值 1
- 关卡配置缺少 `playerHP` 字段时使用默认值 20
- 游戏失败（isGameOver = true）时 `update()` 立即返回，不执行任何更新逻辑
- 玩家血量钳制为 ≥ 0，不会出现负数

## 测试策略

- 属性测试库：fast-check
- 测试框架：vitest
- 标签格式：**Feature: pinball-chess-game, Property {number}: {property_text}**
- 每个正确性属性由一个独立的属性测试实现，最少 100 次迭代
