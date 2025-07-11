// エリア設定の管理
export const AreaConfig = {
    // 三重町マップ
    miemachi: {
        mapKey: 'bunngo_mie_city',
        tilesetKey: 'bunngooonoshimiemachi',
        mapTitle: '三重町マップ',
        areas: [
            { name: 'mie_high_school', scene: 'MieHighSchoolScene' },
            { name: 'sumiwataru', scene: 'SumiWataruScene' },
            { name: 'shigaku', scene: 'ShigakuScene' },
            { name: 'Banned_kiku', scene: 'BannedKikuScene' },
            { name: 'drinking_hope', scene: 'DrinkingHopeScene' },
            { name: 'Weeds_burn', scene: 'WeedsBurnScene' },
            { name: 'katou_poteto', scene: 'KatouPotetoScene' },
            { name: 'Tanabata_bamboo', scene: 'TanabataBambooScene' },
            { name: 'bookmarket', scene: 'BookMarketScene' },
            { name: 'drink_zutu', scene: 'DrinkZutuScene' },
            { name: 'ドール', scene: 'DollScene' },
            { name: 'momoiro', scene: 'MomoiroScene' },
            { name: 'profile', scene: 'ProfileScene' }
        ]
    },
    
    // 2つ目のマップ（例）
    second_map: {
        mapKey: 'second_map',
        tilesetKey: 'second_tileset',
        mapTitle: '2つ目のマップ',
        areas: [
            { name: 'area_1', scene: 'SecondMap_Area1Scene' },
            { name: 'area_2', scene: 'SecondMap_Area2Scene' }
            // 新しいエリアを追加するだけ
        ]
    },
    
    // 3つ目のマップ（例）
    third_map: {
        mapKey: 'third_map',
        tilesetKey: 'third_tileset',
        mapTitle: '3つ目のマップ',
        areas: [
            { name: 'area_A', scene: 'ThirdMap_AreaAScene' },
            { name: 'area_B', scene: 'ThirdMap_AreaBScene' }
            // 新しいエリアを追加するだけ
        ]
    }
}; 