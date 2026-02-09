// ============================================================
// 战斗行为策略注册表
// 以 combatType 字符串为 key，每种类型包含 move / findTarget / canEngage
// ============================================================

const COMBAT_BEHAVIORS = {
    /**
     * 近战策略
     * - 无目标时持续移动
     * - 接触距离内交战
     * - 无射程限制的目标搜索
     */
    melee: {
        /**
         * 移动逻辑：无目标或目标不在接触距离内时沿 direction 方向移动
         * @param {object} unit - Soldier 或 Enemy 实例
         * @param {number} dt - 帧间隔（未使用，保留接口一致性）
         */
        move(unit, dt) {
            if (!unit.target || !unit.target.alive) {
                unit.x += unit.speed * unit.direction;
                unit.target = null;
            } else {
                // 有目标但未进入接触距离时继续移动
                const meleeRange = (typeof Combat !== 'undefined') ? Combat.MELEE_RANGE : 16;
                if (Math.abs(unit.x - unit.target.x) >= meleeRange) {
                    unit.x += unit.speed * unit.direction;
                }
            }
        },

        /**
         * 目标搜索：在所有存活目标中找最近的（沿 unit 面朝方向）
         * @param {object} unit - 当前单位
         * @param {Array} targets - 候选目标列表
         */
        findTarget(unit, targets) {
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
        },

        /**
         * 交战判定：接触距离内即可交战（由 Combat 类的 MELEE_RANGE 控制）
         * @param {object} unit - 当前单位
         * @param {object} target - 目标单位
         * @returns {boolean}
         */
        canEngage(unit, target) {
            const meleeRange = (typeof Combat !== 'undefined') ? Combat.MELEE_RANGE : 16;
            return Math.abs(unit.x - target.x) < meleeRange;
        }
    },

    /**
     * 远程策略
     * - 范围内有目标时停止移动
     * - 按间隔发射投射物（由 Combat 系统处理）
     * - 仅搜索攻击范围内的目标
     */
    ranged: {
        /**
         * 移动逻辑：范围内有存活目标则停下，否则移动
         */
        move(unit, dt) {
            if (unit.target && unit.target.alive) {
                // 在攻击范围内，停止移动
            } else {
                unit.x += unit.speed * unit.direction;
                unit.target = null;
            }
        },

        /**
         * 目标搜索：仅搜索攻击范围内的目标
         */
        findTarget(unit, targets) {
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
        },

        /**
         * 交战判定：目标在攻击范围内
         */
        canEngage(unit, target) {
            const dist = (target.x - unit.x) * unit.direction;
            return dist > 0 && dist <= unit.attackRange;
        }
    }
};
