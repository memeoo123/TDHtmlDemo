// 敌人类型配置 - 修改此文件后刷新页面即可生效
const ENEMY_CONFIG_EXTERNAL = {
    GRUNT: {
        name: '步兵',
        color: '#AA3333',
        combatType: 'melee',
        hp: 10,
        attack: 2,
        speed: 1.2,
        score: 5
    },
    ARCHER: {
        name: '弓箭手',
        color: '#33AA33',
        combatType: 'ranged',
        hp: 6,
        attack: 1.8,
        speed: 0.9,
        attackRange: 120,
        projectileSpeed: 3,
        attackInterval: 1100,
        score: 7
    },
    BRUTE: {
        name: '狂战士',
        color: '#CC5500',
        combatType: 'melee',
        hp: 22,
        attack: 4,
        speed: 0.7,
        score: 12
    },
    ASSASSIN: {
        name: '暗杀者',
        color: '#7733AA',
        combatType: 'melee',
        hp: 8,
        attack: 5,
        speed: 2.5,
        score: 10
    },
    MAGE: {
        name: '法师',
        color: '#3366CC',
        combatType: 'ranged',
        hp: 8,
        attack: 3.5,
        speed: 0.8,
        attackRange: 160,
        projectileSpeed: 3.5,
        attackInterval: 1300,
        score: 14
    },
    SHIELDBEARER: {
        name: '盾卫',
        color: '#888888',
        combatType: 'melee',
        hp: 35,
        attack: 1.2,
        speed: 0.5,
        score: 10
    },
    CROSSBOW: {
        name: '弩手',
        color: '#CC9933',
        combatType: 'ranged',
        hp: 5,
        attack: 3.5,
        speed: 1.0,
        attackRange: 140,
        projectileSpeed: 5,
        attackInterval: 750,
        score: 12
    }
};
