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
    
    // 通常ステージ設定
    stages: {
        stage1: {
            bgm: {
                map: 'assets/audio/bgm/nightbarth.mp3'
            }
        },
        stage2: {
            bgm: {
                map: 'assets/audio/bgm/stage2/Pollyanna.mp3'
            }
        },
        stage3: {
            bgm: {
                map: 'assets/audio/bgm/stage3.mp3' // 必要に応じて設定
            }
        }
    },
    
    // 三重町マップ
    miemachistage: {
        mapKey: 'miemachi',
        tilesetKey: 'miemachi',
        mapTitle: '三重町マップ',
        folderName: 'miemachi',
        mapFileName: 'miemachi',
        tilesetFileName: 'miemachi',
        bgm: {
            // エリア固有のBGM（マップ表示時のBGM）
            map: 'assets/audio/bgm/kessen_diaruga.mp3' // 三重町マップのBGM
        },
        se: {
            // UI操作用のSE（エリア固有）
            se_touch: 'assets/audio/se/touch_7.mp3',        // ダイアログ用タッチSE
            se_map_touch: 'assets/audio/se/touch_2.mp3'     // マップ専用タッチSE
        },
        areas: [
            { name: 'oreno_koto', scene: null, conversationId: 'oreno_koto' },
            { name: 'momoiro_jyogakuenn', scene: null, conversationId: 'momoiro_jyogakuenn' },
            { name: 'drinking_dutu', scene: null, conversationId: 'drinking_dutu' },
            { name: 'Weeds_burn', scene: null, conversationId: 'Weeds_burn' },
            { name: 'mie_high_school', scene: 'startPhaserGame', sceneParam: 'mie_high_school', conversationId: null },
            { name: 'raizu', scene: null, conversationId: 'raizu' },
            { name: 'snack_street_night', scene: null, conversationId: 'snack_street_night' },
            { name: 'souce', scene: null, conversationId: 'souce' },
            { name: 'koutaroupoteto', scene: null, conversationId: 'koutaroupoteto' },
            { name: 'seven', scene: null, conversationId: 'seven' }
        ]
    },
    
            // 竹田ステージ
    taketastage: {
        mapKey: 'taketa',             // シンプルにtaketaに統一
        tilesetKey: 'taketa',         // シンプルにtaketaに統一
        mapTitle: '竹田ステージ',
        folderName: 'taketa',         // フォルダ名を明示
        mapFileName: 'taketa',        // 実際のファイル名
        tilesetFileName: 'taketa',    // 実際のファイル名
        bgm: {
            // エリア固有のBGM（マップ表示時のBGM）
            map: 'assets/audio/bgm/Spain.mp3' // 竹田マップのBGM
        },
        se: {
            se_touch: 'assets/audio/se/touch_7.mp3', // ダイアログ用タッチSE
            se_map_touch: 'assets/audio/se/touch_2.mp3' // マップ専用タッチSE
        },
        areas: [
            { name: 'taketa_station', scene: null, conversationId: 'taketa_station' },
            { name: 'taketa_high_school', scene: 'startPhaserGame', sceneParam: 'taketa_highschool', conversationId: null },
            { name: 'galaxy_water', scene: null, conversationId: 'galaxy_water' },
            { name: 'udefuriojisann', scene: null, conversationId: 'udefuriojisann' },
            { name: 'working_go_to_home_miemachi', scene: null, conversationId: 'working_go_to_home_miemachi' },
            { name: 'kannnamu_kudou', scene: null, conversationId: 'kannnamu_kudou' }
        ]
    },
    
    // 日本ステージ
    japanstage: {
        mapKey: 'japan',              // そのまま
        tilesetKey: 'japan',          // zennkokuからjapanに統一
        mapTitle: '日本マップ',
        folderName: 'japan',          // フォルダ名を明示
        mapFileName: 'japan',         // マップファイル名を明示
        tilesetFileName: 'japan',     // タイルセットファイル名を明示（zennkokuから変更）
        bgm: {
            // エリア固有のBGM（マップ表示時のBGM）
            map: 'assets/audio/bgm/Theme_from_Back_To_The_Future.mp3' // 日本マップのBGM
        },
        se: {
            // UI操作用のSE（エリア固有）
            se_touch: 'assets/audio/se/touch_7.mp3',        // ダイアログ用タッチSE
            se_map_touch: 'assets/audio/se/touch_2.mp3'     // マップ専用タッチSE
        },
        areas: [
            { name: 'computer', scene: null, conversationId: 'computer' },
            { name: 'breaking_car', scene: null, conversationId: 'breaking_car' },
            { name: 'special_scam', scene: null, conversationId: 'special_scam' },
            { name: 'rojyounopenki', scene: null, conversationId: 'rojyounopenki' },
            { name: 'tereapo', scene: null, conversationId: 'tereapo' },
            { name: 'first_rising_sun', scene: null, conversationId: 'first_rising_sun' },
            { name: 'arechi', scene: null, conversationId: 'arechi' }
        ]
    }
}; 