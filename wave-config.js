// 波次配置 - 修改此文件后刷新页面即可生效
const WAVE_CONFIG_EXTERNAL = [
    {
        wave: 1,
        enemies: [
            { type: 'GRUNT', count: 6 }
        ],
        spawnInterval: 3000
    },
    {
        wave: 2,
        enemies: [
            { type: 'GRUNT', count: 8 },
            { type: 'ARCHER', count: 4 }
        ],
        spawnInterval: 2500
    },
    {
        wave: 3,
        enemies: [
            { type: 'GRUNT', count: 8 },
            { type: 'ARCHER', count: 5 },
            { type: 'ASSASSIN', count: 3 }
        ],
        spawnInterval: 2200
    },
    {
        wave: 4,
        enemies: [
            { type: 'BRUTE', count: 3 },
            { type: 'CROSSBOW', count: 4 },
            { type: 'GRUNT', count: 6 }
        ],
        spawnInterval: 2000
    },
    {
        wave: 5,
        enemies: [
            { type: 'SHIELDBEARER', count: 3 },
            { type: 'MAGE', count: 4 },
            { type: 'ASSASSIN', count: 5 }
        ],
        spawnInterval: 1800
    },
    {
        wave: 6,
        enemies: [
            { type: 'BRUTE', count: 5 },
            { type: 'MAGE', count: 5 },
            { type: 'CROSSBOW', count: 4 },
            { type: 'SHIELDBEARER', count: 2 }
        ],
        spawnInterval: 1500
    }
];
