// 敌人类型配置 - 修改此文件后刷新页面即可生效
const ENEMY_CONFIG_EXTERNAL = {
    GRUNT: {
        name: '步兵',
        color: '#AA3333',
        combatType: 'melee',
        hp: 6,
        attack: 1.5,
        speed: 1,
        score: 10
    },
    ARCHER: {
        name: '弓箭手',
        color: '#33AA33',
        combatType: 'ranged',
        hp: 3,
        attack: 1,
        speed: 0.8,
        attackRange: 120,
        projectileSpeed: 3,
        attackInterval: 1200,
        score: 15
    }
};
