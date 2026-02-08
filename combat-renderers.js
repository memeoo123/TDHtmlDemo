// ============================================================
// 战斗类型渲染策略注册表
// 以 combatType 字符串为 key，每种类型包含 drawSoldier / drawEnemy
// ============================================================

const COMBAT_RENDERERS = {
    /**
     * 近战型渲染
     */
    melee: {
        /** 近战士兵：方块 */
        drawSoldier(ctx, soldier) {
            const x = soldier.x;
            const y = soldier.y;
            const s = soldier.size;
            const color = soldier.type.color;

            ctx.fillStyle = color;
            ctx.fillRect(x - s / 2, y - s, s, s);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - s / 2, y - s, s, s);
        },

        /** 近战敌人：菱形 */
        drawEnemy(ctx, enemy) {
            const x = enemy.x;
            const y = enemy.y;
            const s = enemy.size;
            const color = enemy.enemyType.color;

            ctx.beginPath();
            ctx.moveTo(x, y - s);
            ctx.lineTo(x + s / 2, y - s / 2);
            ctx.lineTo(x, y);
            ctx.lineTo(x - s / 2, y - s / 2);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    },

    /**
     * 远程型渲染
     */
    ranged: {
        /** 远程士兵：三角 */
        drawSoldier(ctx, soldier) {
            const x = soldier.x;
            const y = soldier.y;
            const s = soldier.size;
            const color = soldier.type.color;

            ctx.beginPath();
            ctx.moveTo(x, y - s);
            ctx.lineTo(x - s / 2, y);
            ctx.lineTo(x + s / 2, y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        },

        /** 远程敌人：倒三角 */
        drawEnemy(ctx, enemy) {
            const x = enemy.x;
            const y = enemy.y;
            const s = enemy.size;
            const color = enemy.enemyType.color;

            ctx.beginPath();
            ctx.moveTo(x - s / 2, y - s);
            ctx.lineTo(x + s / 2, y - s);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
};
