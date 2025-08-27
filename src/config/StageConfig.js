// src/config/StageConfig.js
export const StageConfig = {
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
                    map: 'assets/audio/bgm/Pollyanna.mp3'  // 2階・3階と同じBGMを使用
                },
                npcs: [
                    { name: 'ひろかず_1', eventId: 'climbing_injury' }
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
                    map: 'assets/audio/bgm/Pollyanna.mp3'  // 1階と同じBGMを使用
                },
                npcs: [
                    { name: 'anndou', eventId: 'classroom_lock_incident' },
                    { name: 'こうたろう_2', eventId: 'koutarou_toilet' },
                    { name: 'だいち_2', eventId: 'culture_festival_apology' }
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
                    { name: 'かなと_3', eventId: 'drama_filming' },
                    { name: 'ひろかず_3', eventId: 'videocamera_broken' },
                    { name: 'だいち_3', eventId: 'gospellers_song' }
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
