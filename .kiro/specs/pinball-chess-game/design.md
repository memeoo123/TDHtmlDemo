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

## 未完成设计：战斗阶段棋子移动机制

在战斗阶段，玩家可将已放置的棋子从一个点位移动到另一个空点位。

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

- 仅战斗阶段允许移动
- 源点位必须有棋子，目标点位必须为空
- 不消耗金币，不重置发射计时器，类型不变

### 交互流程

```
空闲 → 点击已放置棋子 → 已选中（高亮）
已选中 → 点击空点位 → 移动成功，回到空闲
已选中 → 点击空白区域 → 取消选择
已选中 → 点击另一个棋子 → 切换选择
已选中 → 再次点击同一棋子 → 取消选择
```

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

## 错误处理

- 弹球/士兵/敌人超出边界时强制修正或移除
- 每帧清理死亡实体
- 实体数量上限：弹球 100、士兵 50、敌人 30
- 波次配置加载失败时使用内置默认值
- 战斗阶段禁止商店操作，金币不足时阻止购买

## 测试策略

- 属性测试库：fast-check
- 测试框架：vitest
- 标签格式：**Feature: pinball-chess-game, Property {number}: {property_text}**
- 每个正确性属性由一个独立的属性测试实现，最少 100 次迭代
