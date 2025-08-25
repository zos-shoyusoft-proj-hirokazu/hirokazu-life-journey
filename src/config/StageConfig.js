// src/config/StageConfig.js
export const StageConfig = {
    // 竹田高校ステージ
    taketa_highschool: {
        stageKey: 'taketa_highschool',
        stageTitle: '竹田高校',
        folderName: 'taketa/taketa_highschool',
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
            // 2階と3階は後で実装予定
            /*
            {
                number: 2,
                mapKey: 'taketa_highschool_2',
                mapFileName: 'taketa_highschool_2.tmj',
                title: '竹田高校 2階',
                implemented: false,
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
                    'pika_nos_in_tiles02_E'
                ]
            },
            {
                number: 3,
                mapKey: 'taketa_highschool_3',
                mapFileName: 'taketa_highschool_3.tmj',
                title: '竹田高校 3階',
                implemented: false,
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
                    'pika_nos_in_tiles02_E'
                ]
            }
            */
        ]
    }
};
