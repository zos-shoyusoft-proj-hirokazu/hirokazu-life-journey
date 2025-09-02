// src/config/StageConfig.js
export const StageConfig = {
    // 三重中学校ステージ（別名）
    mie_high_school: {
        stageKey: 'mie_high_school',
        stageTitle: '三重中学校',
        folderName: 'miemachi/mie_junior_highschool',
        mapId: 'miemachi',  // 三重マップに戻るためのID
        bgm: {
            map: 'assets/audio/bgm/Pollyanna.mp3'
        },
        se: {
            se_touch: 'assets/audio/se/touch_7.mp3',
            se_floor_change: 'assets/audio/se/touch_2.mp3'
        },
        floors: [
            {
                number: 1,
                mapKey: 'mie_high_school_1',
                mapFileName: 'mie_highshool_1.tmj',
                title: '三重中学校 1階',
                implemented: true,
                playerStartX: 900,
                playerStartY: 1600,
                // 2階から降りてきた時の開始位置
                fromFloor2StartX: 800,
                fromFloor2StartY: 200,
                // 1階専用のBGM設定
                bgm: {
                    map: 'assets/audio/bgm/enter13.mp3'
                },
                npcs: [
                    { name: 'tatuharu', displayName: 'たつはる', eventId: 'tatuharu', sprite: 'pipo-charachip022a.png' },
                    { name: 'npc_1', displayName: '生徒A', sprite: '制服1夏服_女_01.png' },
                    { name: 'npc_2', displayName: '生徒B', sprite: '制服1夏服_男_01.png' },
                    { name: 'npc_3', displayName: '生徒C', sprite: '制服1夏服_女_04.png' },
                    { name: 'npc_4', displayName: '生徒D', sprite: '制服1夏服_男_04.png' },
                    { name: 'npc_5', displayName: '生徒E', sprite: '制服1夏服_女_12.png' },
                    { name: 'npc_6', displayName: '生徒F', sprite: '制服1夏服_男_06.png' },
                    { name: 'npc_7', displayName: '生徒G', sprite: '制服1夏服_女_13.png' },
                    { name: 'npc_8', displayName: '生徒H', sprite: '制服1夏服_男_10.png' },
                    { name: 'npc_9', displayName: '生徒I', sprite: '制服1夏服_女_17.png' }
                ],
                tilesets: [
                    'pika_nos_tiles03_A2',
                    'pika_nos_tiles03_A3',
                    'pika_nos_tiles03_A5',
                    'pika_nos_tiles03_B',
                    'pika_nos_tiles03_C',
                    'pika_nos_tiles03_D',
                    'pika_nos_in_tiles02_A2',
                    'pika_nos_in_tiles02_A4',
                    'pika_nos_in_tiles02_A5',
                    'pika_nos_in_tiles02_B',
                    'pika_nos_in_tiles02_C',
                    'pika_nos_in_tiles02_D',
                    'pika_nos_in_tiles02_E',
                    'pika_objset_school_01'
                ]
            },
            {
                number: 2,
                mapKey: 'mie_high_school_2',
                mapFileName: 'mie_highshool_2.tmj',
                title: '三重中学校 2階',
                implemented: true,
                playerStartX: 1600,
                playerStartY: 500,
                // 1階から上がってきた時の開始位置
                fromFloor1StartX: 1800,
                fromFloor1StartY: 400,
                // 2階専用のBGM設定
                bgm: {
                    map: 'assets/audio/bgm/テクノトリス.mp3'
                },
                npcs: [
                    { name: 'uchida', displayName: '内田', sprite: 'pipo-charachip022e.png' },
                    { name: 'ootuka', displayName: '大塚', eventId: 'otsuka_senpai', sprite: 'pipo-charachip024d.png' },
                    { name: 'okagami', displayName: '岡上', sprite: 'pipo-charachip026.png' },
                    { name: 'だいち_2', displayName: 'だいち', eventId: 'daichi_conversation', sprite: 'pipo-charachip024d.png' },
                    { name: 'ひろかず_2', displayName: 'ひろかず', sprite: '制服1冬服_男_01.png' },
                    { name: 'npc_1', displayName: '生徒A', sprite: '制服1夏服_男_12.png' },
                    { name: 'npc_2', displayName: '生徒B', sprite: '制服1夏服_女_01.png' },
                    { name: 'npc_3', displayName: '生徒C', sprite: '制服1夏服_男_01.png' },
                    { name: 'npc_4', displayName: '生徒D', sprite: '制服1夏服_女_04.png' },
                    { name: 'npc_5', displayName: '生徒E', sprite: '制服1夏服_男_04.png' },
                    { name: 'npc_6', displayName: '生徒F', sprite: '制服1夏服_女_12.png' },
                    { name: 'npc_7', displayName: '生徒G', sprite: '制服1夏服_男_06.png' },
                    { name: 'npc_8', displayName: '生徒H', sprite: '制服1夏服_女_13.png' },
                    { name: 'npc_9', displayName: '生徒I', sprite: '制服1夏服_男_10.png' },
                    { name: 'npc_10', displayName: '生徒J', sprite: '制服1夏服_女_17.png' },
                    { name: 'npc_11', displayName: '生徒K', sprite: '制服1夏服_男_12.png' },
                    { name: 'npc_12', displayName: '生徒L', sprite: '制服1夏服_女_01.png' },
                    { name: 'npc_13', displayName: '生徒M', sprite: '制服1夏服_男_01.png' },
                    { name: 'npc_14', displayName: '生徒N', sprite: '制服1夏服_女_04.png' },
                    { name: 'npc_15', displayName: '生徒O', sprite: '制服1夏服_男_04.png' },
                    { name: 'npc_16', displayName: '生徒P', sprite: '制服1夏服_女_12.png' },
                    { name: 'npc_17', displayName: '生徒Q', sprite: '制服1夏服_男_06.png' },
                    { name: 'npc_18', displayName: '生徒R', sprite: '制服1夏服_女_13.png' },
                    { name: 'npc_19', displayName: '生徒S', sprite: '制服1夏服_男_10.png' },
                    { name: 'npc_20', displayName: '生徒T', sprite: '制服1夏服_女_17.png' }
                ],
                tilesets: [
                    'pika_nos_tiles03_A2',
                    'pika_nos_tiles03_A3',
                    'pika_nos_tiles03_A5',
                    'pika_nos_tiles03_B',
                    'pika_nos_tiles03_C',
                    'pika_nos_tiles03_D',
                    'pika_nos_in_tiles02_A2',
                    'pika_nos_in_tiles02_A4',
                    'pika_nos_in_tiles02_A5',
                    'pika_nos_in_tiles02_B',
                    'pika_nos_in_tiles02_C',
                    'pika_nos_in_tiles02_D',
                    'pika_nos_in_tiles02_E',
                    'pika_objset_school_01'
                ]
            }
        ]
    },

    // 竹田高校ステージ
    taketa_highschool: {
        stageKey: 'taketa_highschool',
        stageTitle: '竹田高校',
        folderName: 'taketa/taketa_highschool',
        mapId: 'taketa',  // 竹田マップに戻るためのID
        bgm: {
            map: 'assets/audio/bgm/Pollyanna.mp3'
        },
        se: {
            se_touch: 'assets/audio/se/touch_7.mp3',
            se_floor_change: 'assets/audio/se/touch_2.mp3'
        },
        floors: [
            {
                number: 1,
                mapKey: 'taketa_highschool_1',
                mapFileName: 'taketa_highschool_1.tmj',
                title: '竹田高校 1階',
                implemented: true,
                playerStartX: 100,
                playerStartY: 100,
                // 2階から降りてきた時の開始位置
                fromFloor2StartX: 750,
                fromFloor2StartY: 1000,
                // 1階専用のBGM設定
                bgm: {
                    map: 'assets/audio/bgm/はるかなる故郷.mp3'  // 2階・3階と同じBGMを使用
                },
                npcs: [
                    { name: 'ひろかず_1', displayName: 'ひろかず', eventId: 'climbing_injury', sprite: 'pipo-charachip007a.png' },
                    { name: 'おおや_1', displayName: 'おおや', eventId: 'wax_on', sprite: 'pipo-charachip022a.png' },
                    { name: 'npc_e_2', displayName: '生徒A', sprite: '制服2夏服_女_01.png' },
                    { name: 'npc_e_1', displayName: '生徒B', sprite: '制服2夏服_男_01.png' },
                    { name: 'npc_p_2', displayName: '生徒C', sprite: '制服2夏服_女_04.png' },
                    { name: 'npc_p_1', displayName: '生徒D', sprite: '制服2夏服_男_04.png' },
                    { name: 'npc_e_3', displayName: '生徒E', sprite: '制服2夏服_女_12.png' },
                    { name: 'npc_s_3', displayName: '生徒F', sprite: '制服2夏服_男_06.png' },
                    { name: 'npc_s_2', displayName: '生徒G', sprite: '制服2夏服_女_13.png' }
                ],
                tilesets: [
                    'pika_nos_tiles03_A2',
                    'pika_nos_tiles03_A3',
                    'pika_nos_tiles03_A5',
                    'pika_nos_tiles03_B',
                    'pika_nos_tiles03_C',
                    'pika_nos_tiles03_D',
                    'pika_nos_in_tiles02_A2',
                    'pika_nos_in_tiles02_A4',
                    'pika_nos_in_tiles02_A5',
                    'pika_nos_in_tiles02_B',
                    'pika_nos_in_tiles02_C',
                    'pika_nos_in_tiles02_D',
                    'pika_nos_in_tiles02_E',
                    'pika_objset_school_01'
                ]
            },
            {
                number: 2,
                mapKey: 'taketa_highschool_2',
                mapFileName: 'taketa_highschool_2.tmj',
                title: '竹田高校 2階',
                implemented: true,
                playerStartX: 1650,
                playerStartY: 800,
                // 1階から上がってきた時の開始位置
                fromFloor1StartX: 1680,
                fromFloor1StartY: 730,
                // 3階から降りてきた時の開始位置
                fromFloor3StartX: 1750,
                fromFloor3StartY: 800,
                // 2階専用のBGM設定
                bgm: {
                    map: 'assets/audio/bgm/field_of_hopes_and_dreams.mp3'  // 1階と同じBGMを使用
                },
                npcs: [
                    { name: 'anndou', displayName: '安藤', eventId: 'classroom_lock_incident', sprite: 'pipo-charachip022a.png' },
                    { name: 'こうたろう_2', displayName: 'こうたろう', eventId: 'koutarou_toilet', sprite: 'pipo-charachip007a.png' },
                    { name: 'だいち_2', displayName: 'だいち', eventId: 'culture_festival_apology', sprite: 'pipo-charachip024d.png' },
                    { name: 'まみっち', displayName: 'まみっち', eventId: 'black_clothes', sprite: 'pipo-charachip022e.png' },
                    { name: 'ひろかず_2', displayName: 'ひろかず', eventId: 'broadcast', sprite: '制服1冬服_男_01.png' },
                    { name: 'かなと_2', displayName: 'かなと', eventId: 'valentine', sprite: 'pipo-charachip026.png' },
                    { name: 'あべ', displayName: 'あべ', sprite: 'pipo-charachip022a.png' },
                    { name: 's-2', displayName: '生徒A', sprite: '制服2夏服_女_17.png' },
                    { name: 's-3', displayName: '生徒B', sprite: '制服2夏服_男_10.png' },
                    { name: 's-8', displayName: '生徒C', sprite: '制服2夏服_女_01.png' },
                    { name: 's-9', displayName: '生徒D', sprite: '制服2夏服_男_12.png' },
                    { name: 's-11', displayName: '生徒E', sprite: '制服2夏服_女_04.png' },
                    { name: 's-12', displayName: '生徒F', sprite: '制服2夏服_男_01.png' },
                    { name: 's-13', displayName: '生徒G', sprite: '制服2夏服_女_12.png' },
                    { name: 'あめかわ', displayName: 'あめかわ', sprite: 'pipo-charachip007a.png' },
                    { name: 'みやざー', displayName: 'みやざー', sprite: 'pipo-charachip022a.png' }
                ],
                tilesets: [
                    'pika_nos_tiles03_A2',
                    'pika_nos_tiles03_A3',
                    'pika_nos_tiles03_A5',
                    'pika_nos_tiles03_B',
                    'pika_nos_tiles03_C',
                    'pika_nos_tiles03_D',
                    'pika_nos_in_tiles02_A2',
                    'pika_nos_in_tiles02_A4',
                    'pika_nos_in_tiles02_A5',
                    'pika_nos_in_tiles02_B',
                    'pika_nos_in_tiles02_C',
                    'pika_nos_in_tiles02_D',
                    'pika_nos_in_tiles02_E',
                    'pika_objset_school_01'
                ]
            },
            {
                number: 3,
                mapKey: 'taketa_highschool_3',
                mapFileName: 'taketa_highschool_3.tmj',
                title: '竹田高校 3階',
                implemented: true,
                playerStartX: 1200,
                playerStartY: 1400,
                // 2階から上がってきた時の開始位置
                fromFloor2StartX: 1200,
                fromFloor2StartY: 1400,
                // 3階専用のBGM設定
                bgm: {
                    map: 'assets/audio/bgm/Pollyanna.mp3'  // 1階と同じBGMを使用
                },
                npcs: [
                    { name: 'かなと_3', displayName: 'かなと', eventId: 'drama_filming', sprite: 'pipo-charachip026.png' },
                    { name: 'ひろかず_3', displayName: 'ひろかず', eventId: 'videocamera_broken', sprite: 'pipo-charachip007a.png' },
                    { name: 'だいち_3', displayName: 'だいち', eventId: 'gospellers_song', sprite: 'pipo-charachip024d.png' },
                    { name: 'こうたろう_3', displayName: 'こうたろう', eventId: 'lunch_tag', sprite: 'pipo-charachip007a.png' },
                    { name: 'あきざわ', displayName: 'あきざわ', sprite: '制服2冬服_男_01.png' },
                    { name: 'しゅうへい', displayName: 'しゅうへい', sprite: '制服2冬服_男_04.png' },
                    { name: 'なおき', displayName: 'なおき', sprite: '制服2冬服_男_06.png' },
                    { name: 'まさと', displayName: 'まさと', sprite: '制服2冬服_男_10.png' }
                ],
                tilesets: [
                    'pika_nos_tiles03_A2',
                    'pika_nos_tiles03_A3',
                    'pika_nos_tiles03_A5',
                    'pika_nos_tiles03_B',
                    'pika_nos_tiles03_C',
                    'pika_nos_tiles03_D',
                    'pika_nos_in_tiles02_A2',
                    'pika_nos_in_tiles02_A4',
                    'pika_nos_in_tiles02_A5',
                    'pika_nos_in_tiles02_B',
                    'pika_nos_in_tiles02_C',
                    'pika_nos_in_tiles02_D',
                    'pika_nos_in_tiles02_E',
                    'pika_objset_school_01'
                ]
            }
        ]
    }
};
