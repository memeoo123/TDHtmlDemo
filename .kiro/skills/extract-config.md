---
inclusion: manual
---

# Skill: 配置外置提取 (Extract Config to External File)

## 触发场景

当需要将 `index.html` 中的硬编码参数提取为外部配置文件时激活此 skill。
用户会提供要提取的配置名称和参数列表。

## 输入

向用户确认以下信息：
- **配置名称**（如 "physics"、"balance"），用于文件命名和变量命名
- **要提取的参数列表**及其当前默认值
- **配置文件格式**：
  - `json` — 通过 `fetch` 异步加载（默认，适合纯数据配置）
  - `js` — 通过 `<script src>` 同步加载（适合需要引用其他变量的配置）

## 命名规范

| 用途 | 格式 | 示例 |
|------|------|------|
| JSON 配置文件 | `{name}-config.json` | `physics-config.json` |
| JS 配置文件 | `{name}-config.js` | `board-config.js` |
| 内置默认配置对象 | `{Name}Config`（PascalCase） | `PhysicsConfig` |
| 外部 JS 变量 | `{NAME}_CONFIG_EXTERNAL`（UPPER_SNAKE_CASE） | `BOARD_CONFIG_EXTERNAL` |

## 执行步骤

### 步骤 1：创建外部配置文件

**JSON 格式**（`{name}-config.json`）：
- 扁平 key-value 结构
- 保留当前硬编码的默认值
- 示例：
```json
{
    "gravity": 0.15,
    "pinCollisionDampening": 0.92,
    "wallCollisionDampening": 0.9
}
```

**JS 格式**（`{name}-config.js`）：
- 导出为全局变量 `{NAME}_CONFIG_EXTERNAL`
- 示例：
```javascript
const BOARD_CONFIG_EXTERNAL = {
    width: 600,
    height: 700
};
```

### 步骤 2：在 index.html 中定义内置默认配置对象

在 `index.html` 顶部 `<script>` 区域创建配置对象，填入所有参数的默认值：

```javascript
const {Name}Config = {
    param1: defaultValue1,
    param2: defaultValue2
};
```

这确保外部文件加载失败时游戏仍可正常运行。

### 步骤 3：添加加载逻辑

**JSON 格式** — 在 `loadConfigs()` 异步函数中新增 try-catch 块：

```javascript
try {
    const res = await fetch('{name}-config.json');
    if (res.ok) {
        const data = await res.json();
        Object.assign({Name}Config, data);
        console.log('已加载外部{描述}配置');
    }
} catch (e) {
    console.warn('加载 {name}-config.json 失败，使用内置默认配置', e);
}
```

**JS 格式** — 在 HTML `<head>` 区域用 `<script src>` 引入，然后在内联 script 中覆盖：

```javascript
if (typeof {NAME}_CONFIG_EXTERNAL !== 'undefined') {
    Object.assign({Name}Config, {NAME}_CONFIG_EXTERNAL);
}
```

### 步骤 4：替换代码中的硬编码引用

- 将所有使用硬编码值的地方改为引用 `{Name}Config.{paramName}`
- 搜索范围：`index.html`、`combat-behaviors.js`、`combat-renderers.js`
- 使用 grepSearch 确保不遗漏任何引用点

### 步骤 5：同步更新约定文件

在 `.kiro/steering/game-conventions.md` 的 **架构约定 → 配置外置** 部分登记新配置文件：
- 文件名和加载方式
- 包含的参数概要

## 约束

- 外部配置加载失败时 **必须** 回退到内置默认值，不能导致游戏崩溃
- JSON 配置用 `Object.assign` 浅合并，不做深合并
- 不改变任何参数的实际数值，只改变引用方式
- 新配置文件放在项目根目录（与现有配置文件同级）

## 现有配置文件参考

| 文件 | 格式 | 加载方式 | 内容 |
|------|------|----------|------|
| `physics-config.json` | JSON | fetch | 重力、碰撞衰减、弹球/点位半径 |
| `balance-config.json` | JSON | fetch | 近战距离、生成间隔、实体上限、投射物半径、单位尺寸 |
| `piece-config.json` | JSON | fetch | 棋子类型定义（FIRE/ICE/THUNDER） |
| `enemy-config.json` | JSON | fetch | 敌人类型定义（GRUNT/ARCHER） |
| `wave-config.json` | JSON | fetch | 波次敌人配置 |
| `board-config.js` | JS | script src | 弹球台尺寸和布局参数 |
| `initial-layout.js` | JS | script src | 初始棋子布局 |
