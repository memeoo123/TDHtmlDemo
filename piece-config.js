// 棋子类型配置 - 修改此文件后刷新页面即可生效
const PIECE_CONFIG_EXTERNAL = {
    FIRE: {
        name: '火战士',
        color: '#FF4444',
        fireInterval: 12000,
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
        fireInterval: 18000,
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
        fireInterval: 8800,
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
    },
    EARTH: {
        name: '岩卫士',
        color: '#AA7744',
        fireInterval: 20800,
        ballSpeed: 2,
        combatType: 'melee',
        soldierHP: 10,
        soldierAttack: 1,
        soldierSpeed: 0.8,
        price: 12,
        skill: {
            name: '岩石壁垒',
            type: 'aura',
            damagePerSecond: 0.3,
            radius: 30
        }
    },
    WIND: {
        name: '风行者',
        color: '#88DDAA',
        fireInterval: 7200,
        ballSpeed: 5,
        combatType: 'ranged',
        soldierHP: 2,
        soldierAttack: 1,
        soldierSpeed: 2.5,
        attackRange: 180,
        projectileSpeed: 6,
        attackInterval: 700,
        price: 14,
        skill: {
            name: '疾风连射',
            type: 'slow',
            slowFactor: 0.6,
            duration: 1500
        }
    },
    DARK: {
        name: '暗影刺客',
        color: '#9944CC',
        fireInterval: 14800,
        ballSpeed: 3.5,
        combatType: 'melee',
        soldierHP: 3,
        soldierAttack: 4,
        soldierSpeed: 2.2,
        price: 16,
        skill: {
            name: '暗影突袭',
            type: 'chain',
            chainCount: 3,
            chainDamageRatio: 0.6,
            chainRange: 50
        }
    },
    HOLY: {
        name: '圣光牧师',
        color: '#FFEEAA',
        fireInterval: 19200,
        ballSpeed: 2.5,
        combatType: 'ranged',
        soldierHP: 4,
        soldierAttack: 1.2,
        soldierSpeed: 1,
        attackRange: 160,
        projectileSpeed: 3.5,
        attackInterval: 1200,
        price: 18,
        skill: {
            name: '圣光审判',
            type: 'slow',
            slowFactor: 0.4,
            duration: 2500
        }
    },
    POISON: {
        name: '毒蛇术士',
        color: '#66CC44',
        fireInterval: 16800,
        ballSpeed: 2.8,
        combatType: 'ranged',
        soldierHP: 3,
        soldierAttack: 1.8,
        soldierSpeed: 1.2,
        attackRange: 130,
        projectileSpeed: 3,
        attackInterval: 900,
        price: 13,
        skill: {
            name: '剧毒弥漫',
            type: 'aura',
            damagePerSecond: 0.8,
            radius: 50
        }
    }
};
