// ============================================================
// 战斗类型渲染策略注册表
// 以 combatType 字符串为 key，每种类型包含 drawSoldier / drawEnemy
// ============================================================

const COMBAT_RENDERERS = {
    /**
     * 近战型渲染
     */
    melee: {
        /**
         * 近战士兵：剑盾战士矢量图标
         * 圆头 + 梯形躯干 + 右手持剑 + 左手持盾，朝右
         */
        drawSoldier(ctx, soldier) {
            const x = soldier.x;
            const y = soldier.y;
            const s = soldier.size;
            const color = soldier.type.color;

            ctx.save();
            ctx.fillStyle = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;

            // Head (circle at top center)
            const headR = s * 0.18;
            const headY = y - s + headR + s * 0.02;
            ctx.beginPath();
            ctx.arc(x, headY, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Torso (trapezoid, wider at bottom, slight rightward lean)
            const torsoTop = headY + headR + 1;
            const torsoBot = y - s * 0.15;
            const topHalf = s * 0.18;
            const botHalf = s * 0.25;
            ctx.beginPath();
            ctx.moveTo(x - topHalf, torsoTop);
            ctx.lineTo(x + topHalf, torsoTop);
            ctx.lineTo(x + botHalf, torsoBot);
            ctx.lineTo(x - botHalf, torsoBot);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Legs (two short lines down from torso bottom)
            const legLen = s * 0.15;
            ctx.beginPath();
            ctx.moveTo(x - botHalf * 0.4, torsoBot);
            ctx.lineTo(x - botHalf * 0.4, torsoBot + legLen);
            ctx.moveTo(x + botHalf * 0.4, torsoBot);
            ctx.lineTo(x + botHalf * 0.4, torsoBot + legLen);
            ctx.stroke();

            // Shield (left hand — small rounded rect on left side)
            const shX = x - botHalf - s * 0.08;
            const shY = torsoTop + (torsoBot - torsoTop) * 0.2;
            const shW = s * 0.14;
            const shH = s * 0.28;
            ctx.beginPath();
            ctx.moveTo(shX, shY + shH * 0.15);
            ctx.arcTo(shX, shY, shX + shW, shY, shH * 0.15);
            ctx.arcTo(shX + shW, shY, shX + shW, shY + shH, shH * 0.15);
            ctx.arcTo(shX + shW, shY + shH, shX, shY + shH, shH * 0.15);
            ctx.arcTo(shX, shY + shH, shX, shY, shH * 0.15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Sword (right hand — thin triangle pointing right-up)
            const swordBaseX = x + botHalf * 0.6;
            const swordBaseY = torsoTop + (torsoBot - torsoTop) * 0.35;
            const swordLen = s * 0.48;
            const swordW = s * 0.06;
            ctx.beginPath();
            ctx.moveTo(swordBaseX, swordBaseY - swordW);
            ctx.lineTo(swordBaseX + swordLen, swordBaseY - swordW * 0.3);
            ctx.lineTo(swordBaseX, swordBaseY + swordW);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Sword hilt (small crossbar)
            ctx.beginPath();
            ctx.moveTo(swordBaseX - s * 0.04, swordBaseY - swordW * 1.5);
            ctx.lineTo(swordBaseX + s * 0.04, swordBaseY + swordW * 1.5);
            ctx.stroke();

            ctx.restore();
        },

        /**
         * 近战敌人（步兵）：持斧蛮兵矢量图标
         * 圆头 + 宽肩躯干 + 双手举起战斧，朝左
         */
        drawEnemy(ctx, enemy) {
            const x = enemy.x;
            const y = enemy.y;
            const s = enemy.size;
            const color = enemy.enemyType.color;

            ctx.save();
            ctx.fillStyle = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;

            // Head
            const headR = s * 0.19;
            const headY = y - s + headR + s * 0.02;
            ctx.beginPath();
            ctx.arc(x, headY, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Torso (wider shoulders for brute look)
            const torsoTop = headY + headR + 1;
            const torsoBot = y - s * 0.15;
            const topHalf = s * 0.24;
            const botHalf = s * 0.22;
            ctx.beginPath();
            ctx.moveTo(x - topHalf, torsoTop);
            ctx.lineTo(x + topHalf, torsoTop);
            ctx.lineTo(x + botHalf, torsoBot);
            ctx.lineTo(x - botHalf, torsoBot);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Legs
            const legLen = s * 0.15;
            ctx.beginPath();
            ctx.moveTo(x - botHalf * 0.4, torsoBot);
            ctx.lineTo(x - botHalf * 0.4, torsoBot + legLen);
            ctx.moveTo(x + botHalf * 0.4, torsoBot);
            ctx.lineTo(x + botHalf * 0.4, torsoBot + legLen);
            ctx.stroke();

            // Axe handle (raised above head, angled to the left)
            const handleBaseX = x + topHalf * 0.3;
            const handleBaseY = torsoTop;
            const handleTopX = x - s * 0.2;
            const handleTopY = headY - headR - s * 0.15;
            ctx.beginPath();
            ctx.moveTo(handleBaseX, handleBaseY);
            ctx.lineTo(handleTopX, handleTopY);
            ctx.stroke();

            // Axe blade (arc at top of handle, facing left)
            const bladeR = s * 0.16;
            ctx.beginPath();
            ctx.arc(handleTopX - bladeR * 0.3, handleTopY, bladeR, -Math.PI * 0.7, Math.PI * 0.3);
            ctx.fill();
            ctx.stroke();

            // Second hand reaching to handle
            ctx.beginPath();
            ctx.moveTo(x - topHalf * 0.5, torsoTop + (torsoBot - torsoTop) * 0.3);
            ctx.lineTo(handleBaseX - (handleBaseX - handleTopX) * 0.5, handleBaseY - (handleBaseY - handleTopY) * 0.5);
            ctx.stroke();

            ctx.restore();
        }
    },

    /**
     * 远程型渲染
     */
    ranged: {
        /**
         * 远程士兵（法师）：法杖法师矢量图标
         * 圆头 + 长袍（三角形裙摆）+ 右手持法杖 + 顶端光球，朝右
         */
        drawSoldier(ctx, soldier) {
            const x = soldier.x;
            const y = soldier.y;
            const s = soldier.size;
            const color = soldier.type.color;

            ctx.save();
            ctx.fillStyle = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;

            // Head
            const headR = s * 0.17;
            const headY = y - s + headR + s * 0.02;
            ctx.beginPath();
            ctx.arc(x, headY, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Robe / body (triangle skirt — wider at bottom for robe look)
            const robeTop = headY + headR + 1;
            const robeBot = y;
            const topHalf = s * 0.14;
            const botHalf = s * 0.32;
            ctx.beginPath();
            ctx.moveTo(x - topHalf, robeTop);
            ctx.lineTo(x + topHalf, robeTop);
            ctx.lineTo(x + botHalf, robeBot);
            ctx.lineTo(x - botHalf, robeBot);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Staff (thin line from right shoulder going up-right, with orb on top)
            const staffBaseX = x + topHalf + s * 0.04;
            const staffBaseY = robeTop + (robeBot - robeTop) * 0.4;
            const staffTopX = x + s * 0.35;
            const staffTopY = headY - headR - s * 0.12;
            ctx.beginPath();
            ctx.moveTo(staffBaseX, staffBaseY);
            ctx.lineTo(staffTopX, staffTopY);
            ctx.stroke();

            // Orb at staff top (small glowing circle)
            const orbR = s * 0.08;
            ctx.beginPath();
            ctx.arc(staffTopX, staffTopY - orbR, orbR, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(staffTopX, staffTopY - orbR, orbR * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        /**
         * 远程敌人（弓箭手）：持弓射手矢量图标
         * 圆头 + 轻甲躯干 + 持弓姿态（弧线弓身 + 弦线 + 箭矢），朝左
         */
        drawEnemy(ctx, enemy) {
            const x = enemy.x;
            const y = enemy.y;
            const s = enemy.size;
            const color = enemy.enemyType.color;

            ctx.save();
            ctx.fillStyle = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;

            // Head
            const headR = s * 0.17;
            const headY = y - s + headR + s * 0.02;
            ctx.beginPath();
            ctx.arc(x, headY, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Light armor torso (slightly narrower than melee)
            const torsoTop = headY + headR + 1;
            const torsoBot = y - s * 0.15;
            const topHalf = s * 0.18;
            const botHalf = s * 0.2;
            ctx.beginPath();
            ctx.moveTo(x - topHalf, torsoTop);
            ctx.lineTo(x + topHalf, torsoTop);
            ctx.lineTo(x + botHalf, torsoBot);
            ctx.lineTo(x - botHalf, torsoBot);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Legs
            const legLen = s * 0.15;
            ctx.beginPath();
            ctx.moveTo(x - botHalf * 0.4, torsoBot);
            ctx.lineTo(x - botHalf * 0.4, torsoBot + legLen);
            ctx.moveTo(x + botHalf * 0.4, torsoBot);
            ctx.lineTo(x + botHalf * 0.4, torsoBot + legLen);
            ctx.stroke();

            // Bow (arc on the left side, facing left)
            const bowCX = x - topHalf - s * 0.14;
            const bowCY = torsoTop + (torsoBot - torsoTop) * 0.45;
            const bowR = s * 0.28;
            ctx.beginPath();
            ctx.arc(bowCX, bowCY, bowR, Math.PI * 0.65, Math.PI * 1.35);
            ctx.stroke();

            // Bowstring (straight line connecting bow endpoints)
            const strTopX = bowCX + bowR * Math.cos(Math.PI * 0.65);
            const strTopY = bowCY + bowR * Math.sin(Math.PI * 0.65);
            const strBotX = bowCX + bowR * Math.cos(Math.PI * 1.35);
            const strBotY = bowCY + bowR * Math.sin(Math.PI * 1.35);
            ctx.beginPath();
            ctx.moveTo(strTopX, strTopY);
            ctx.lineTo(strBotX, strBotY);
            ctx.stroke();

            // Arrow (line from bowstring center pointing left)
            const arrowStartX = (strTopX + strBotX) / 2;
            const arrowStartY = (strTopY + strBotY) / 2;
            const arrowLen = s * 0.38;
            ctx.beginPath();
            ctx.moveTo(arrowStartX, arrowStartY);
            ctx.lineTo(arrowStartX - arrowLen, arrowStartY);
            ctx.stroke();

            // Arrowhead (small triangle at tip)
            const tipX = arrowStartX - arrowLen;
            const tipW = s * 0.06;
            ctx.beginPath();
            ctx.moveTo(tipX, arrowStartY);
            ctx.lineTo(tipX + tipW, arrowStartY - tipW);
            ctx.lineTo(tipX + tipW, arrowStartY + tipW);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }
};
