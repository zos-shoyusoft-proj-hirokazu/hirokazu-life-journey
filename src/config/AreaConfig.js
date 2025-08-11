// エリア設定の管理
export const AreaConfig = {
    // セレクト画面設定
    select_screen: {
        bgm: {
            menu: 'assets/audio/bgm/zelda_menu_select.mp3'
        },
        se: {
            touch: 'assets/audio/se/touch_1.mp3'
        }
    },
    
    // ステージ選択画面設定
    stage_select: {
        bgm: {
            menu: 'assets/audio/bgm/zelda_menu_select.mp3'
        },
        se: {
            touch: 'assets/audio/se/touch_1.mp3'
        }
    },
    
    // 三重町マップ
    miemachi: {
        mapKey: 'bunngo_mie_city',
        tilesetKey: 'miemachi',
        mapTitle: '三重町マップ',
        bgm: {
            map: 'assets/audio/bgm/kessen_diaruga.mp3', // 通常マップBGM
            curono: 'assets/audio/bgm/curono.mp3',
            Fantasy: 'assets/audio/bgm/Fantasy.mp3',
            Jounetsu_Tairiku: 'assets/audio/bgm/Jounetsu_Tairiku.mp3',
            Last_Summer_In_Rio: 'assets/audio/bgm/Last_Summer_In_Rio.mp3',
            metoroido: 'assets/audio/bgm/metoroido.mp3',
            Nagisa_Moderato: 'assets/audio/bgm/Nagisa_Moderato.mp3',
            nightbarth: 'assets/audio/bgm/nightbarth.mp3',
            ON_THE_BEACH: 'assets/audio/bgm/ON_THE_BEACH.mp3',
            togetogetarumeiro: 'assets/audio/bgm/togetogetarumeiro.mp3'
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        characters: {
            // hirokazu: miemachi の会話データで使用している表情のみ
            'hirokazu_a': 'assets/characters/portraits/hirokazu_a.png',
            'hirokazu_b': 'assets/characters/portraits/hirokazu_b.png',
            'hirokazu_c': 'assets/characters/portraits/hirokazu_c.png',
            'hirokazu_d': 'assets/characters/portraits/hirokazu_d.png',
            'hirokazu_e': 'assets/characters/portraits/hirokazu_e.png',
            'hirokazu_f': 'assets/characters/portraits/hirokazu_f.png',
            'hirokazu_g': 'assets/characters/portraits/hirokazu_g.png',
            'hirokazu_h': 'assets/characters/portraits/hirokazu_h.png',
            'hirokazu_i': 'assets/characters/portraits/hirokazu_i.png',
            'hirokazu_j': 'assets/characters/portraits/hirokazu_j.png',
            'hirokazu_k': 'assets/characters/portraits/hirokazu_k.png',
            'hirokazu_l': 'assets/characters/portraits/hirokazu_l.png',
            'daichi_a': 'assets/characters/portraits/daichi_a.png',
            'daichi_b': 'assets/characters/portraits/daichi_b.png',
            'daichi_c': 'assets/characters/portraits/daichi_c.png',
            'daichi_d': 'assets/characters/portraits/daichi_d.png',
            'daichi_e': 'assets/characters/portraits/daichi_e.png',
            'daichi_f': 'assets/characters/portraits/daichi_f.png',
            'naoki_a': 'assets/characters/portraits/naoki_a.png',
            'naoki_b': 'assets/characters/portraits/naoki_b.png',
            'naoki_c': 'assets/characters/portraits/naoki_c.png',
            'kanato_a': 'assets/characters/portraits/kanato_a.png',
            'kanato_b': 'assets/characters/portraits/kanato_b.png',
            'kanato_c': 'assets/characters/portraits/kanato_c.png',
            'koutarou_a': 'assets/characters/portraits/koutarou_a.png',
            'koutarou_b': 'assets/characters/portraits/koutarou_b.png',
            'koutarou_c': 'assets/characters/portraits/koutarou_c.png',
            'yabajin_c': 'assets/characters/portraits/yabajin_a.png'
        },
        backgrounds: {

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
            { name: 'oreno_koto', scene: null, conversationId: 'oreno_koto' },
            { name: 'momoiro_jyogakuenn', scene: null, conversationId: 'annex_momo' },
            { name: 'drinking_dutu', scene: null, conversationId: 'drink_zutsu' },
            { name: 'Weeds_burn', scene: null, conversationId: 'river_fire' },
            { name: 'mie_high_school', scene: 'startPhaserGame', sceneParam: 1, conversationId: null },
            { name: 'raizu', scene: null, conversationId: 'shigaku' },
            { name: 'snack_street_night', scene: null, conversationId: 'snack_street_night' },
            { name: 'souce', scene: null, conversationId: 'team_shoyu_drinking' },
            { name: 'koutaroupoteto', scene: null, conversationId: 'koutarou_potato' },
            { name: 'seven', scene: null, conversationId: 'seven' }
        ]
    },
    
            // 竹田ステージ
    taketastage: {
        mapKey: 'taketa_city',
        tilesetKey: 'taketa_map',
        mapTitle: '竹田ステージ',
        bgm: {
            map: 'assets/audio/bgm/Spain.mp3', // 通常マップBGM
            Fantasy: 'assets/audio/bgm/Fantasy.mp3',
            Nagisa_Moderato: 'assets/audio/bgm/Nagisa_Moderato.mp3',
            nightbarth: 'assets/audio/bgm/nightbarth.mp3',
            The_Terminator: 'assets/audio/bgm/The_Terminator.mp3'
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        characters: {
            'hirokazu_a': 'assets/characters/portraits/hirokazu_a.png',
            'hirokazu_b': 'assets/characters/portraits/hirokazu_b.png',
            'hirokazu_c': 'assets/characters/portraits/hirokazu_c.png',
            'hirokazu_d': 'assets/characters/portraits/hirokazu_d.png',
            'hirokazu_e': 'assets/characters/portraits/hirokazu_e.png',
            'hirokazu_f': 'assets/characters/portraits/hirokazu_f.png',
            'daichi_a': 'assets/characters/portraits/daichi_a.png',
            'naoki_a': 'assets/characters/portraits/naoki_a.png',
            'kanato_a': 'assets/characters/portraits/kanato_a.png',
            'kanato_b': 'assets/characters/portraits/kanato_b.png',
            'kanato_c': 'assets/characters/portraits/kanato_c.png',
            'koutarou_a': 'assets/characters/portraits/koutarou_a.png',
            'koutarou_b': 'assets/characters/portraits/koutarou_b.png'
        },
        backgrounds: {
            'test_1': 'assets/backgrounds/background_test.png',
            'street': 'assets/backgrounds/street.png'
        },
        areas: [
            { name: 'taketa_station', scene: null, conversationId: 'taketa_station' },
            { name: 'taketa_high_school', scene: 'startPhaserGame', sceneParam: 2, conversationId: null },
            { name: 'galaxy_water', scene: null, conversationId: 'ginnga_water' },
            { name: 'udefuriojisann', scene: null, conversationId: 'arm_swinging_person' },
            { name: 'working_go_to_home_miemachi', scene: null, conversationId: 'working_go_to_home_miemachi' }
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
            map: 'assets/audio/bgm/Theme_from_Back_To_The_Future.mp3', // 通常マップBGM
            curono: 'assets/audio/bgm/curono.mp3',
            togetogetarumeiro: 'assets/audio/bgm/togetogetarumeiro.mp3'
        },
        se: {
            touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            map_touch: 'assets/audio/se/touch_2.mp3', // マップ専用タッチSE
        },
        characters: {
            'hirokazu_a': 'assets/characters/portraits/hirokazu_a.png',
            'hirokazu_b': 'assets/characters/portraits/hirokazu_b.png',
            'hirokazu_c': 'assets/characters/portraits/hirokazu_c.png',
            'hirokazu_d': 'assets/characters/portraits/hirokazu_d.png',
            'hirokazu_e': 'assets/characters/portraits/hirokazu_e.png',
            'hirokazu_f': 'assets/characters/portraits/hirokazu_f.png',
            'daichi_a': 'assets/characters/portraits/daichi_a.png',
            'naoki_a': 'assets/characters/portraits/naoki_a.png'
        },
        backgrounds: {

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