// 棋子类型配置 - 修改此文件后刷新页面即可生效
const PIECE_CONFIG_EXTERNAL = {
    FIRE: {
        name: '火战士',
        color: '#FF4444',
        fireInterval: 2000,
        ballSpeed: 3,
        combatType: 'melee',
        soldierHP: 5,
        soldierAttack: 2,
        soldierSpeed: 1.5,
        price: 10,
        skill: {
            name: '烈焰光环',
            type: 'aura',
            damagePerSecond: 0.5,
            radius: 40
        }
    },
    ICE: {
        name: '冰法师',
        color: '#44AAFF',
        fireInterval: 3000,
        ballSpeed: 2,
        combatType: 'ranged',
        soldierHP: 3,
        soldierAttack: 1.5,
        soldierSpeed: 1,
        attackRange: 150,
        projectileSpeed: 4,
        attackInterval: 1000,
        price: 15,
        skill: {
            name: '冰霜减速',
            type: 'slow',
            slowFactor: 0.5,
            duration: 2000
        }
    },
    THUNDER: {
        name: '雷战士',
        color: '#FFDD44',
        fireInterval: 1500,
        ballSpeed: 4,
        combatType: 'melee',
        soldierHP: 3,
        soldierAttack: 3,
        soldierSpeed: 2,
        price: 12,
        skill: {
            name: '连锁闪电',
            type: 'chain',
            chainCount: 2,
            chainDamageRatio: 0.5,
            chainRange: 60
        }
    }
};
