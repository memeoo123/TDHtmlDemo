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

## 错误处理

- 弹球/士兵/敌人超出边界时强制修正或移除
- 每帧清理死亡实体
- 实体数量上限：弹球 100、士兵 50、敌人 30
- 波次配置加载失败时使用内置默认值
- 战斗阶段禁止商店操作，金币不足时阻止购买
- 合并操作前验证：阶段为 shop、两个点位均有棋子、类型相同、等级相同、等级 < 5
- 等级 5 棋子尝试合并时静默拒绝（不报错，不改变状态）
- 技能配置缺失时棋子正常运作但无技能效果

## 测试策略

- 属性测试库：fast-check
- 测试框架：vitest
- 标签格式：**Feature: pinball-chess-game, Property {number}: {property_text}**
- 每个正确性属性由一个独立的属性测试实现，最少 100 次迭代
