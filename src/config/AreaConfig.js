// エリア設定の管理
export const AreaConfig = {
    // 三重町マップ
    miemachi: {
        mapKey: 'bunngo_mie_city',
        tilesetKey: 'miemachi',
        mapTitle: '三重町マップ',
        bgm: {
            map: 'assets/audio/bgm/stage1/kessen_diaruga.mp3', // 通常マップBGM
            // battle: 'assets/audio/bgm/stage1/battle.mp3',      // バトルBGM - ファイルが存在しないため削除
            // event: 'assets/audio/bgm/stage1/event.mp3'          // イベントBGM - ファイルが存在しないため削除
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        characters: {
            'hirokazu_A': 'assets/characters/portraits/hirokazu_A.png',
            'hirokazu_B': 'assets/characters/portraits/hirokazu_B.png',
            'hirokazu_C': 'assets/characters/portraits/hirokazu_C.png',
            'hirokazu_D': 'assets/characters/portraits/hirokazu_D.png',
            'hirokazu_E': 'assets/characters/portraits/hirokazu_E.png',
            'hirokazu_F': 'assets/characters/portraits/hirokazu_F.png',
            'daichi_A': 'assets/characters/portraits/daichi_A.png',
            'naoki_A': 'assets/characters/portraits/naoki_A.png'
        },
        backgrounds: {
            'bar': 'assets/backgrounds/bar.png',
            'hospital': 'assets/backgrounds/hospital.png',
            'classroom': 'assets/backgrounds/classroom.png',
            'gym': 'assets/backgrounds/gym.png',
            'room': 'assets/backgrounds/room.png',
            'river': 'assets/backgrounds/river.png',
            'test_1': 'assets/backgrounds/background_test.png'
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
            { name: 'Trial', scene: 'TrialScene', conversationId:'trial' },
            { name: 'Flash_land_mie', scene: 'FlashLandMieScene', conversationId:'flash_land_mie' },
            { name: 'oreno_koto', scene: 'OrenoKotoScene', conversationId: 'oreno_koto' },
            { name: 'momoiro_jyogakuenn', scene: 'MomoiroJyogakuennScene', conversationId: 'annex_momo' },
            { name: 'drinking_dutu', scene: 'DrinkingDutuScene', conversationId: 'drink_zutsu' },
            { name: 'Weeds_burn', scene: 'WeedsBurnScene', conversationId: 'river_fire' },
            { name: 'mie_high_school', scene: 'startPhaserGame', sceneParam: 1, conversationId: null },
            { name: 'raizu', scene: 'RaizuScene', conversationId: 'shigaku' },
            { name: 'dole', scene: 'DoleScene', conversationId: 'doll' },
            { name: 'souce', scene: 'SouceScene', conversationId: 'team_shoyu_drinking' },
            { name: 'koutaroupoteto', scene: 'KoutarouPotetoScene', conversationId: 'koutarou_potato' }
        ]
    },
    
    // 竹田ステージ
    taketastage: {
        mapKey: 'taketa_city',
        tilesetKey: 'taketa_map',
        mapTitle: '竹田ステージ',
        bgm: {
            map: 'assets/audio/bgm/stage1/kessen_diaruga.mp3', // 通常マップBGM
            // battle: 'assets/audio/bgm/stage1/battle.mp3',      // バトルBGM - ファイルが存在しないため削除
            // event: 'assets/audio/bgm/stage1/event.mp3'          // イベントBGM - ファイルが存在しないため削除
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        characters: {
            'hirokazu_A': 'assets/characters/portraits/hirokazu_A.png',
            'hirokazu_B': 'assets/characters/portraits/hirokazu_B.png',
            'hirokazu_C': 'assets/characters/portraits/hirokazu_C.png',
            'hirokazu_D': 'assets/characters/portraits/hirokazu_D.png',
            'hirokazu_E': 'assets/characters/portraits/hirokazu_E.png',
            'hirokazu_F': 'assets/characters/portraits/hirokazu_F.png',
            'daichi_A': 'assets/characters/portraits/daichi_A.png',
            'naoki_A': 'assets/characters/portraits/naoki_A.png'
        },
        backgrounds: {
            'bar': 'assets/backgrounds/bar.png',
            'hospital': 'assets/backgrounds/hospital.png',
            'classroom': 'assets/backgrounds/classroom.png',
            'gym': 'assets/backgrounds/gym.png',
            'room': 'assets/backgrounds/room.png',
            'river': 'assets/backgrounds/river.png',
            'test_1': 'assets/backgrounds/background_test.png'
        },
        areas: [
            { name: 'taketa_station', scene: null, conversationId: 'taketa_station' },
            { name: 'taketa_high_school', scene: 'startPhaserGame', sceneParam: 2, conversationId: null },
            { name: 'galaxy_water', scene: null, conversationId: 'ginnga_water' },
            { name: 'udefuriojisann', scene: null, conversationId: 'arm_swinging_person' }
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
    },
    
    // 日本ステージ
    japan: {
        mapKey: 'japan',
        tilesetKey: 'zennkoku',
        mapTitle: '日本マップ',
        bgm: {
            map: 'assets/audio/bgm/stage1/kessen_diaruga.mp3', // 通常マップBGM
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        characters: {
            'hirokazu_A': 'assets/characters/portraits/hirokazu_A.png',
            'hirokazu_B': 'assets/characters/portraits/hirokazu_B.png',
            'hirokazu_C': 'assets/characters/portraits/hirokazu_C.png',
            'hirokazu_D': 'assets/characters/portraits/hirokazu_D.png',
            'hirokazu_E': 'assets/characters/portraits/hirokazu_E.png',
            'hirokazu_F': 'assets/characters/portraits/hirokazu_F.png',
            'daichi_A': 'assets/characters/portraits/daichi_A.png',
            'naoki_A': 'assets/characters/portraits/naoki_A.png'
        },
        backgrounds: {
            'bar': 'assets/backgrounds/bar.png',
            'hospital': 'assets/backgrounds/hospital.png',
            'classroom': 'assets/backgrounds/classroom.png',
            'gym': 'assets/backgrounds/gym.png',
            'room': 'assets/backgrounds/room.png',
            'river': 'assets/backgrounds/river.png',
            'test_1': 'assets/backgrounds/background_test.png'
        },
        areas: [
            { name: 'computer', scene: null, conversationId: 'computer' },
            { name: 'breaking_car', scene: null, conversationId: 'breaking_car' },
            { name: 'special_scam', scene: null, conversationId: 'special_scam' },
            { name: 'rojyounopenki', scene: null, conversationId: 'rojyounopenki' },
            { name: 'tereapo', scene: null, conversationId: 'tereapo' },
            { name: 'gray_bytes', scene: null, conversationId: 'gray_bytes' }
        ]
    }
}; 