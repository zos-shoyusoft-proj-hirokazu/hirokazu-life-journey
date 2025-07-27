// エリア設定の管理
export const AreaConfig = {
    // 三重町マップ
    miemachi: {
        mapKey: 'bunngo_mie_city',
        tilesetKey: 'bunngooonoshimiemachi',
        mapTitle: '三重町マップ',
        bgm: {
            map: 'assets/audio/bgm/stage1/kessen_diaruga.mp3', // 通常マップBGM
            battle: 'assets/audio/bgm/stage1/battle.mp3',      // バトルBGM
            event: 'assets/audio/bgm/stage1/event.mp3'          // イベントBGM
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        // eventBgm: {
        //     // エリア固有のイベントBGM
        //     'mie_high_school': 'assets/audio/bgm/events/school_event.mp3',
        //     'sumiwataru': 'assets/audio/bgm/events/romantic_event.mp3',
        //     'shigaku': 'assets/audio/bgm/events/school_event.mp3',
        //     'Banned_kiku': 'assets/audio/bgm/events/default_event.mp3',
        //     'drinking_hope': 'assets/audio/bgm/events/default_event.mp3',
        //     'Weeds_burn': 'assets/audio/bgm/events/default_event.mp3',
        //     'katou_poteto': 'assets/audio/bgm/events/default_event.mp3',
        //     'Tanabata_bamboo': 'assets/audio/bgm/events/romantic_event.mp3',
        //     'bookmarket': 'assets/audio/bgm/events/default_event.mp3',
        //     'drink_zutu': 'assets/audio/bgm/events/default_event.mp3',
        //     'ドール': 'assets/audio/bgm/events/default_event.mp3',
        //     'momoiro': 'assets/audio/bgm/events/romantic_event.mp3',
        //     'profile': 'assets/audio/bgm/events/default_event.mp3'
        // },
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
    
    // 竹田ステージ
    taketastage: {
        mapKey: 'taketa',
        tilesetKey: 'taketa_map',
        mapTitle: '竹田ステージ',
        bgm: {
            map: 'assets/audio/bgm/stage1/kessen_diaruga.mp3', // 通常マップBGM
            battle: 'assets/audio/bgm/stage1/battle.mp3',      // バトルBGM
            event: 'assets/audio/bgm/stage1/event.mp3'          // イベントBGM
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        areas: [
            { name: 'taketa_station', scene: 'TaketaStationScene' },
            { name: 'taketa_high school', scene: 'TaketaHighSchoolScene' },
            { name: 'ginnga_water', scene: 'GinngaWaterScene' },
            { name: 'udefuriojisann', scene: 'UdefuriojisannScene' }
        ]
    },
    
    // 2つ目のマップ（例）
    second_map: {
        mapKey: 'second_map',
        tilesetKey: 'second_tileset',
        mapTitle: '2つ目のマップ',
        bgm: 'assets/audio/bgm/stage1/kessen_diaruga.mp3',
        eventBgm: {
            'area_1': 'assets/audio/bgm/events/school_event.mp3',
            'area_2': 'assets/audio/bgm/events/romantic_event.mp3'
        },
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
        bgm: 'assets/audio/bgm/stage1/kessen_diaruga.mp3',
        eventBgm: {
            'area_A': 'assets/audio/bgm/events/school_event.mp3',
            'area_B': 'assets/audio/bgm/events/romantic_event.mp3'
        },
        areas: [
            { name: 'area_A', scene: 'ThirdMap_AreaAScene' },
            { name: 'area_B', scene: 'ThirdMap_AreaBScene' }
            // 新しいエリアを追加するだけ
        ]
    }
}; 