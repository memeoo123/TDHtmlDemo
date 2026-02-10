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
     * - 支持 aura（烈焰光环）和 chain（连锁闪电）技能
     */
    melee: {
        /**
         * 移动逻辑：无目标或目标不在接触距离内时沿 direction 方向移动
         * 若士兵拥有 aura 技能，对范围内敌人施加持续伤害
         * @param {object} unit - Soldier 或 Enemy 实例
         * @param {number} dt - 帧间隔（毫秒）
         * @param {object} [context] - 可选上下文，包含 enemies 列表供技能使用
         */
        move(unit, dt, context) {
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

            // aura 技能：烈焰光环 — 对范围内敌人施加持续伤害
            if (unit.skill && unit.skill.type === 'aura' && context && context.enemies) {
                const radius = unit.skill.radius || 40;
                const dps = unit.skill.damagePerSecond || 0.5;
                const dmg = dps * (dt / 1000);
                for (const enemy of context.enemies) {
                    if (!enemy.alive) continue;
                    const dx = enemy.x - unit.x;
                    const dy = enemy.y - unit.y;
                    if (dx * dx + dy * dy <= radius * radius) {
                        enemy.takeDamage(dmg);
                    }
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
        },

        /**
         * 连锁闪电技能：攻击时闪电跳跃到附近敌人
         * 由 Combat.processMeleeCombat 在近战伤害后调用
         * @param {object} unit - 拥有 chain 技能的士兵
         * @param {object} target - 当前攻击目标
         * @param {number} damage - 本次攻击伤害
         * @param {Array} enemies - 所有敌人列表
         */
        applyChainLightning(unit, target, damage, enemies) {
            if (!unit.skill || unit.skill.type !== 'chain') return;
            const chainCount = unit.skill.chainCount || 2;
            const chainRatio = unit.skill.chainDamageRatio || 0.5;
            const chainRange = unit.skill.chainRange || 60;

            let currentTarget = target;
            let chainDamage = damage * chainRatio;
            const hit = new Set();
            hit.add(currentTarget);

            for (let i = 0; i < chainCount; i++) {
                let nearest = null;
                let nearestDist = Infinity;
                for (const e of enemies) {
                    if (!e.alive || hit.has(e)) continue;
                    const dx = e.x - currentTarget.x;
                    const dy = e.y - currentTarget.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= chainRange && dist < nearestDist) {
                        nearestDist = dist;
                        nearest = e;
                    }
                }
                if (!nearest) break;
                nearest.takeDamage(chainDamage);
                hit.add(nearest);
                currentTarget = nearest;
                chainDamage *= chainRatio;
            }
        }
    },

    /**
     * 远程策略
     * - 范围内有目标时停止移动
     * - 按间隔发射投射物（由 Combat 系统处理）
     * - 仅搜索攻击范围内的目标
     * - 支持 slow（冰霜减速）技能
     */
    ranged: {
        /**
         * 移动逻辑：范围内有存活目标则停下，否则移动
         */
        move(unit, dt, context) {
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
        },

        /**
         * 冰霜减速技能：投射物命中时减缓敌人速度
         * 由 Combat.processRangedAttacks 在发射投射物时标记，
         * 命中后由 Projectile.checkHit 或 Combat 系统调用
         * @param {object} unit - 拥有 slow 技能的士兵
         * @param {object} target - 被命中的敌人
         */
        applySlowEffect(unit, target) {
            if (!unit.skill || unit.skill.type !== 'slow') return;
            const slowFactor = unit.skill.slowFactor || 0.5;
            const duration = unit.skill.duration || 2000;

            // 标记减速效果（不叠加，刷新持续时间）
            target._slowFactor = slowFactor;
            target._slowExpiry = performance.now() + duration;
            target._originalSpeed = target._originalSpeed || target.speed;
            target.speed = target._originalSpeed * slowFactor;
        }
    }
};
