// イベントコンフィグファイル
// 既存のconversationDataの構造を活かして、イベントごとの設定を管理

// SEのキーから実際のファイル名へのマッピング
export const SE_MAPPING = {
    'taiko_2ren': '太鼓2連打.mp3',
    'don': 'don.mp3'
    // 必要に応じて他のSEも追加
};

export const EventConfig = {
    // 三重町エリアのイベント設定
    miemachi: {
        // 俺の事
        'oreno_koto': {
            id: 'oreno_koto',                    // 必要：イベントを識別するためのID
            title: '俺の事',                      // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'orenokoto',             // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['orenokoto', 'mannga_a', 'mannga_b', 'mannga_c', 'mannga_d', 'mannga_e', 'mannga_f', 'mannga_g', 'mannga_h', 'mannga_i', 'mannga_j', 'mannga_k', 'mannga_l'],      // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_g'],  // 必要：character+expressionの組み合わせ
                bgm: ['Fantasy'] ,
                se: ['don', 'wadodon']                  // 必要：BGMファイルの読み込みに必要
            },
            conversationDataKey: 'oreno_koto',   // 必要：conversationDataのキーと一致
            areaName: 'oreno_koto'               // 必要：エリア名の指定
        },
        
        // 志学
        'raizu': {
            id: 'raizu',                         // 必要：イベントを識別するためのID
            title: '志学',                        // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'raizu',                 // 必要：conversationDataのbackgroundと一致
            bgm: 'metoroido',                    // 必要：BGMファイルの読み込みに必要
            required: {
                backgrounds: ['raizu'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_e', 'kanato_c', 'daichi_e', 'koutarou_a', 'koutarou_c', 'naoki_c', 'narrator_a', 'yabajinn_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['metoroido']               // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'raizu',        // 必要：conversationDataのキーと一致
            areaName: 'raizu'                   // 必要：エリア名の指定
        },
        
        // アネックス（ももいろ女学園）
        'momoiro_jyogakuenn': {
            id: 'momoiro_jyogakuenn',            // 必要：イベントを識別するためのID
            title: 'アネックス（ももいろ女学園）',  // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'momoiro',               // 必要：conversationDataのbackgroundと一致
            bgm: 'togetogetarumeiro',            // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['momoiro', 'ookami', 'yuuhiload'],  // 必要：conversationDataで使用される背景画像（yuuhiloadも追加）
                characters: ['narrator_a'],      // 必要：character+expressionの組み合わせ
                bgm: ['togetogetarumeiro']      // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'momoiro_jyogakuenn',   // 必要：conversationDataのキーと一致
            areaName: 'momoiro_jyogakuenn'      // 必要：エリア名の指定
        },
        
        // アンタレス
        'antares': {
            id: 'antares',                       // 必要：イベントを識別するためのID
            title: 'アンタレス',                   // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'Nagisa_Moderato',              // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],         // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_c', 'hirokazu_e', 'hirokazu_f', 'hirokazu_g', 'hirokazu_h', 'daichi_b', 'daichi_d'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Nagisa_Moderato']         // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'antares',      // 必要：conversationDataのキーと一致
            areaName: 'test_1'                  // 必要：エリア名の指定
        },
        
        // ドンキの謎酒"ずつ"
        'drinking_dutu': {
            id: 'drinking_dutu',                 // 必要：イベントを識別するためのID
            title: 'ドンキの謎酒"ずつ"',           // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'dutu',                  // 必要：conversationDataのbackgroundと一致
            bgm: 'africa',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['dutu','omiki','yorumofuketa'],           // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu', 'koutarou_a', 'koutarou_c', 'daichi_b', 'daichi_a', 'dutu'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['africa']  ,
                se: ['don', 'wadodon','outou']               // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため（taiko_2renは1箇所のみ）
            },
            conversationDataKey: 'drinking_dutu',   // 必要：conversationDataのキーと一致
            areaName: 'drinking_dutu'            // 必要：エリア名の指定
        },
        
        // 川で火事
        'Weeds_burn': {
            id: 'Weeds_burn',                    // 必要：イベントを識別するためのID
            title: '川の火事',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'Fire',                  // 必要：conversationDataのbackgroundと一致
            bgm: 'bloody_tears',                    // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['Fire', 'moeru', 'moeato'],           // 必要：背景画像の読み込みに必要
                characters: ['syounenndaichi_1', 'syounennhirokazu_1', 'narrator_1'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['bloody_tears'],              // 必要：BGMファイルの読み込みに必要
                se: ['sei_ge_matti_tukeru01', '焚き火短', 'wind2']  // 必要：conversationDataで使用されるSE
            },
            conversationDataKey: 'Weeds_burn',    // 必要：conversationDataのキーと一致
            areaName: 'Weeds_burn'               // 必要：エリア名の指定
        },
        

        
        // スナック街の夜
        'snack_street_night': {
            id: 'snack_street_night',            // 必要：イベントを識別するためのID
            title: 'スナック街の夜',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'miemachimae',           // 必要：conversationDataのbackgroundと一致
            bgm: 'nightbarth',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['miemachimae', 'jewelry', 'doll', 'secret', 'hanaichiba', 'joelyn', 'sunakku_sa', 'cool', 'seven', 'seven2'],  // 必要：conversationDataで使用される背景画像
                characters: ['hirokazu_d', 'hirokazu_e', 'kanato_c', 'koutarou_a', 'naoki_c', 'daichi_e', 'narrator_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['nightbarth'],             // 必要：BGMファイルの読み込みに必要
                se: ['taiko_2ren', 'don']        // 必要：conversationDataで使用されるSE
            },
            conversationDataKey: 'snack_street_night',  // 必要：conversationDataのキーと一致
            areaName: 'snack_street_night'       // 必要：エリア名の指定
        },
        
        // チーム醤油飲み会
        'souce': {
            id: 'souce',                         // 必要：イベントを識別するためのID
            title: 'チーム醤油飲み会',              // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'souce',                 // 必要：conversationDataのbackgroundと一致
            bgm: 'pokémon_Theme',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['souce'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_e', 'hirokazu_b', 'hirokazu_d', 'hirokazu_l', 'koutarou_a', 'koutarou_e', 'koutarou_g', 'kanato_c', 'kanato_b', 'kanato_d', 'daichi_e', 'daichi_f', 'daichi_b', 'naoki_a', 'naoki_c', 'naoki_b', 'narrator_a', 'line_group_syouyu'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['pokémon_Theme'],              // 必要：BGMファイルの読み込みに必要
                se: ['wadodon']  // 必要：conversationDataで使用されるSE
            },
            conversationDataKey: 'souce',        // 必要：conversationDataのキーと一致
            areaName: 'souce'                   // 必要：エリア名の指定
        },
        
        // コータローとポテト
        'koutaroupoteto': {
            id: 'koutaroupoteto',                // 必要：イベントを識別するためのID
            title: 'コータローとポテト',             // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'koutaroupoteto',        // 必要：conversationDataのbackgroundと一致
            bgm: 'Nagisa_Moderato',              // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['koutaroupoteto'], // 必要：背景画像の読み込みに必要
                characters: ['daichi_g', 'daichi_h', 'hirokazu_n', 'hirokazu_m'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Nagisa_Moderato']         // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'koutaroupoteto',  // 必要：conversationDataのキーと一致
            areaName: 'koutaroupoteto'           // 必要：エリア名の指定
        },
        
        // セブン
        'seven': {
            id: 'seven',                         // 必要：イベントを識別するためのID
            title: 'セブン',                      // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'seven',                 // 必要：conversationDataのbackgroundと一致
            bgm: 'Last_Summer_In_Rio',          // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['seven','seven_1'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_e', 'daichi_e', 'kanato_c', 'naoki_c', 'koutarou_a', 'koutarou_N', 'narrator_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Last_Summer_In_Rio']     // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため（dededonは1箇所のみ）
            },
            conversationDataKey: 'seven',        // 必要：conversationDataのキーと一致
            areaName: 'seven'                   // 必要：エリア名の指定
        },
        
        // だいちとの会話
        'daichi_conversation': {
            id: 'daichi_conversation',           // 必要：イベントを識別するためのID
            title: 'だいちとの会話',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'taiikukann',                // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['taiikukann'],         // 必要：背景画像の読み込みに必要
                characters: ['daichi_i', 'hirokazu_o'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                 // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'daichi_conversation',  // 必要：conversationDataのキーと一致
            areaName: 'mie_high_school'                  // 必要：エリア名の指定
        },
        
        // 大塚先輩
        'otsuka_senpai': {
            id: 'otsuka_senpai',                 // 必要：イベントを識別するためのID
            title: '大塚先輩',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'taiikukann',            // 必要：conversationDataのbackgroundと一致
            bgm: 'megarovania',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['taiikukann'],      // 必要：背景画像の読み込みに必要
                characters: ['ootuka_a', 'hirokazu_o', 'hirokazu'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['megarovania']                   // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'otsuka_senpai', // 必要：conversationDataのキーと一致
            areaName: 'mie_high_school'          // 必要：エリア名の指定
        },
        
        // たつはる
        'tatuharu': {
            id: 'tatuharu',                      // 必要：イベントを識別するためのID
            title: 'たつはる',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'taiikukann',            // 必要：conversationDataのbackgroundと一致
            bgm: 'unオーエン彼女なのか？',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['taiikukann'],      // 必要：背景画像の読み込みに必要
                characters: ['tatuharu_a', 'hirokazu_o'],   // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['unオーエン彼女なのか？']                   // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'tatuharu',      // 必要：conversationDataのキーと一致
            areaName: 'mie_high_school'          // 必要：エリア名の指定
        },
        
        // 七夕イベント
        'tanabata': {
            id: 'tanabata',                       // 必要：イベントを識別するためのID
            title: '七夕',                         // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'bunngoriver',               // 必要：conversationDataのbackgroundと一致
            bgm: 'blinding_lights',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['bunngoriver'],       // 必要：背景画像の読み込みに必要
                characters: ['naoki_c', 'daichi_e', 'kanato_c', 'narrator_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['blinding_lights']                 // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'tanabata',      // 必要：conversationDataのキーと一致
            areaName: 'tanabata'                 // 必要：エリア名の指定
        },
    },

    
    // 竹田エリアのイベント設定
    taketa: {
        // 昼休み鬼ごっこ
        'lunch_tag': {
            id: 'lunch_tag',                     // 必要：イベントを識別するためのID
            title: '昼休み鬼ごっこ',                // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'nichijyou_d',              // 必要：conversationDataのbackgroundと一致
            bgm: 'professor_laytons',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['nichijyou_d'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'hirokazu_a', 
                    'adachi_a',
                    'daichi_a', 
                    'naoki_a', 
                    'kanato_a', 
                    'kanato_c', 
                    'koutarou_b'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['professor_laytons']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'lunch_tag',     // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 銀河の水
        'galaxy_water': {
            id: 'galaxy_water',                  // 必要：イベントを識別するためのID
            title: '銀河の水',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'galaxywater',                // 必要：conversationDataのbackgroundと一致
            bgm: 'vitality',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['galaxywater'],          // 必要：背景画像の読み込みに必要
                characters: ['daichi_a','kanato_a'],         // 必要：character+expressionの組み合わせ
                bgm: ['vitality']               // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'galaxy_water',  // 必要：conversationDataのキーと一致
            areaName: 'galaxy_water'             // 必要：エリア名の指定（マップ上のエリア名と一致）
        },
        
        // 腕振りおじさん
        'udefuriojisann': {
            id: 'udefuriojisann',                // 必要：イベントを識別するためのID
            title: '腕振りおじさん',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'taketamachi',                // 必要：conversationDataのbackgroundと一致
            bgm: '主題_opening_theme',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['taketamachi'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'daichi_a', 'kanato_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['主題_opening_theme']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'udefuriojisann',  // 必要：conversationDataのキーと一致
            areaName: 'udefuriojisann'           // 必要：エリア名の指定（マップ上のエリア名と一致）
        },
        
        // 飲みの帰り
        'working_go_to_home_miemachi': {
            id: 'working_go_to_home_miemachi',   // 必要：イベントを識別するためのID
            title: '仕事帰り',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'street',                // 必要：conversationDataのbackgroundと一致
            bgm: 'dragostea_din_tei',              // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['nomiaruki_1', 'taketamachi', 'nomiaruki_4', 'nomiaruki_3', 'nomiaruki_5'],         // 必要：背景画像の読み込みに必要
                characters: [
                    'kanato_b', 
                    'kanato_c', 
                    'hirokazu_a',
                    'hirokazu_b', 
                    'hirokazu_c', 
                    'hirokazu_d', 
                    'hirokazu_i', 
                    'hirokazu_k', 
                    'daichi_b', 
                    'daichi_d', 
                    'koutarou_a', 
                    'naoki_b'
                ],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['dragostea_din_tei']          // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'working_go_to_home_miemachi',  // 必要：conversationDataのキーと一致
            areaName: 'working_go_to_home_miemachi'  // 必要：エリア名の指定（マップ上のエリア名と一致）
        },
        
        // ゴスペラーズの歌
        'gospellers_song': {
            id: 'gospellers_song',               // 必要：イベントを識別するためのID
            title: 'ゴスペラーズの歌',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'nichijyou_b',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['nichijyou_b'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'daichi_a', 'kanato_a','koutarou_b'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため（hitoriは1箇所のみ）
            },
            conversationDataKey: 'gospellers_song',  // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // クライミング指怪我事件
        'climbing_injury': {
            id: 'climbing_injury',               // 必要：イベントを識別するためのID
            title: 'クライミング指怪我事件',          // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'craimming_a',              // 必要：conversationDataのbackgroundと一致
            bgm: 'blinding_lights',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['craimming_a'],       // 必要：背景画像の読み込みに必要
                characters: ['kanato_a', 'hirokazu_j'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['blinding_lights']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'climbing_injury',  // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 教室の入り口鍵かけ事件
        'classroom_lock_incident': {
            id: 'classroom_lock_incident',        // 必要：イベントを識別するためのID
            title: '教室の入り口鍵かけ事件',          // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'kyoushitu_b',         // 必要：conversationDataのbackgroundと一致
            bgm: 'Jounetsu_Tairiku',             // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kyoushitu_b'],   // 必要：背景画像の読み込みに必要
                characters: [
                    'hirokazu_a',
                    'kudou_b',
                    'anndou_a'
                    
                ],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Jounetsu_Tairiku']         // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'classroom_lock_incident',  // 必要：conversationDataのキーと一致
            areaName: 'classroom'                 // 必要：エリア名の指定
        },
        
        // こうたろうのおしっこ事件
        'koutarou_toilet': {
            id: 'koutarou_toilet',               // 必要：イベントを識別するためのID
            title: 'こうたろうのおしっこ事件',        // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'kyoushitu_b',              // 必要：conversationDataのbackgroundと一致
            bgm: 'metoroido',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kyoushitu_b'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'koutarou_b',
                    'hirokazu_a',
                    'daichi_a'
                ],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['metoroido']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'koutarou_toilet',  // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 文化祭後の謝罪
        'culture_festival_apology': {
            id: 'culture_festival_apology',      // 必要：イベントを識別するためのID
            title: '文化祭後の謝罪',                // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'kyoushitu_a',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Spain',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kyoushitu_a'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'mamicchi_a',
                    'hirokazu_a',
                    'daichi_a',
                    'kanato_a',
                    'koutarou_b',
                    'naoki_a' 
                ],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Spain']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'culture_festival_apology',  // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 電車ないうんこおじさん事件
        'train_no_poop_man': {
            id: 'train_no_poop_man',             // 必要：イベントを識別するためのID
            title: '電車ないうんこおじさん事件',      // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'taketaeki',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['taketaeki'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'hirokazu_a',
                    'daichi_a',
                    'koutarou_b'
                ],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'train_no_poop_man',  // 必要：conversationDataのキーと一致
            areaName: 'train_no_poop_man'                  // 必要：エリア名の指定
        },
        
        // かなとのビデオカメラを落として壊す
        'videocamera_broken': {
            id: 'videocamera_broken',            // 必要：イベントを識別するためのID
            title: 'かなとのビデオカメラを落として壊す',  // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'nichijyou_d',              // 必要：conversationDataのbackgroundと一致
            bgm: 'ON_THE_BEACH',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['nichijyou_d'],       // 必要：背景画像の読み込みに必要
                characters: ['kanato_a', 'hirokazu_a', 'kanato_c', 'narrator_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['ON_THE_BEACH']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'videocamera_broken',  // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 昼休みドラマ撮影クラブ（ゴスペラーズ等々）
        'drama_filming': {
            id: 'drama_filming',                 // 必要：イベントを識別するためのID
            title: '昼休みドラマ撮影クラブ（ゴスペラーズ等々）',  // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'nichijyou_b',              // 必要：conversationDataのbackgroundと一致
            bgm: 'nightbarth',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['nichijyou_b'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'hirokazu_a', 
                    'kanato_a', 
                    'kanato_c', 
                    'daichi_a','daichi_c',
                    'koutarou_b',
                    'adachi_a',
                    'masato_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['nightbarth']               // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'drama_filming', // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 電車の工藤くん
        'kannnamu_kudou': {
            id: 'kannnamu_kudou',                // 必要：イベントを識別するためのID
            title: '電車の工藤くん',                // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'kannnamu',              // 必要：conversationDataのbackgroundと一致
            bgm: 'papa_dont_preach',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kannnamu'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'kudou_a', 'naoki_a', 'kanato_b', 'daichi_c'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['papa_dont_preach']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'kannnamu_kudou',  // 必要：conversationDataのキーと一致
            areaName: 'kannnamu_kudou'                // 必要：エリア名の指定
        },
        
        // 黒い服着てこない
        'black_clothes': {
            id: 'black_clothes',                 // 必要：イベントを識別するためのID
            title: '黒い服着てこない',              // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'kyoushitu_a',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Nagisa_Moderato',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kyoushitu_a'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'mamicchi_a',
                    'classmate_a', 
                    'narrator_a', 
                    'daichi_a', 
                    'hirokazu_a', 
                    'koutarou_b', 
                    'kanato_a', 
                    'adachi_a'
                ],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Nagisa_Moderato']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'black_clothes', // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 放送
        'broadcast': {
            id: 'broadcast',                     // 必要：イベントを識別するためのID
            title: '放送',                        // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'kyoushitu_a',              // 必要：conversationDataのbackgroundと一致
            bgm: 'unオーエン彼女なのか？',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kyoushitu_a'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'narrator_a', 
                    'broadcast_a', 
                    'hirokazu_a', 
                    'kanato_a', 
                    'adachi_a', 
                    'far_class_a', 
                    'daichi_a', 
                    'near_class_a', 
                    'koutarou_a',
                    'koutarou_b', 
                    'next_class_a', 
                    'class1_a',
                    'doragon_a',
                    'doragon_b',
                    'kannda_a',
                    'turuturu_a',
                    'washio_a',
                    'gotoujyunnji_a',
                    'anndou_a',
                    'yamazaki_a',
                    'honngou_a',
                    'sciencemother_a'
                ],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['unオーエン彼女なのか？'],                  // 必要：BGMファイルの読み込みに必要
                se: ['don']                  // 必要：SEファイルの読み込みに必要
            },
            conversationDataKey: 'broadcast',     // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // ワックスつける
        'wax_on': {
            id: 'wax_on',                        // 必要：イベントを識別するためのID
            title: 'ワックスつける',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'taketakukou',              // 必要：conversationDataのbackgroundと一致
            bgm: 'vitality',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['taketakukou'],       // 必要：背景画像の読み込みに必要
                characters: ['ooya_a', 'naoki_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['vitality']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'wax_on',        // 必要：conversationDataのキーと一致
            areaName: 'taketa_high_school'       // 必要：エリア名の指定
        },
        
        // バレンタイン
        'valentine': {
            id: 'valentine',                     // 必要：イベントを識別するためのID
            title: 'バレンタイン',                 // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'nichijyou_d',              // 必要：conversationDataのbackgroundと一致
            bgm: 'rainbow_Seeker_II',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['nichijyou_d'],       // 必要：背景画像の読み込みに必要
                characters: [
                    'narrator_a', 
                    'kanato_a', 
                    'letter_a', 
                    'hirokazu_a',
                    'koutarou_b'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['rainbow_Seeker_II']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'valentine',     // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        }
    },
    
    // 日本エリアのイベント設定
    japan: {
        // コンピュータ
        'computer': {
            id: 'computer',                      // 必要：イベントを識別するためのID
            title: 'コンピュータ',                 // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'asokonnroom',            // 必要：conversationDataのbackgroundと一致
            bgm: 'togetogetarumeiro',            // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['asokonnroom'],  // 必要：背景画像の読み込みに必要
                characters: ['narrator_a', 'hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'hirokazu_d', 'hirokazu_e', 'hirokazu_g', 'hirokazu_i', 'hirokazu_k', 'hirokazu_l', 'daichi_a', 'daichi_b', 'daichi_c', 'daichi_d', 'daichi_e', 'takumi_a'],  // 必要：character+expressionの組み合わせ
                bgm: ['togetogetarumeiro'],       // 必要：BGMファイルの読み込みに必要
                se: ['don', 'wadodon']            // 必要：SEファイルの読み込みに必要
            },
            conversationDataKey: 'computer',      // 必要：conversationDataのキーと一致
            areaName: 'computer'                 // 必要：エリア名の指定
        },
        
        // 壊れた車
        'breaking_car': {
            id: 'breaking_car',                  // 必要：イベントを識別するためのID
            title: '壊れた車',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'donnki',                // 必要：conversationDataのbackgroundと一致
            bgm: 'rydeen',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['donnki'],          // 必要：背景画像の読み込みに必要
                characters: ['narrator_a', 'hirokazu_b', 'hirokazu_c'],  // 必要：character+expressionの組み合わせ
                bgm: ['rydeen']                   // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'breaking_car',  // 必要：conversationDataのキーと一致
            areaName: 'breaking_car'             // 必要：エリア名の指定
        },
        
        // 特殊詐欺
        'special_scam': {
            id: 'special_scam',                  // 必要：イベントを識別するためのID
            title: '特殊詐欺',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'kouenn',                // 必要：conversationDataのbackgroundと一致
            bgm: 'まどいの水源',            // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kouenn', 'yakitori', 'donnki', 'koubann'],  // 必要：背景画像の読み込みに必要
                characters: [
                    'hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'hirokazu_e', 'hirokazu_g', 'hirokazu_h', 'hirokazu_i', 'hirokazu_k', 'hirokazu_l',
                    'stranger_a',
                    'narrator_a',
                    'owner_a',
                    'police_a',
                    'h_a', 'h_b', 'h_c'
                ],  // 必要：character+expressionの組み合わせ
                bgm: ['まどいの水源'],        // 必要：BGMファイルの読み込みに必要
                se: ['don','pururu', 'garagara']                     // 必要：SEファイルの読み込みに必要
            },
            conversationDataKey: 'special_scam',  // 必要：conversationDataのキーと一致
            areaName: 'special_scam'             // 必要：エリア名の指定
        },
        
        // 路上のペンキ
        'rojyounopenki': {
            id: 'rojyounopenki',                 // 必要：イベントを識別するためのID
            title: '路上のペンキ',                  // 必要：イベントの種類を指定
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'kouenn',                // 必要：conversationDataのbackgroundと一致
            bgm: 'africa',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['kouenn'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_e', 'hirokazu_k', 'police_a'],  // 必要：character+expressionの組み合わせ
                bgm: ['africa']                   // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'rojyounopenki', // 必要：conversationDataのキーと一致
            areaName: 'rojyounopenki'            // 必要：エリア名の指定
        },
        
        // テレアポ
        'tereapo': {
            id: 'tereapo',                       // 必要：イベントを識別するためのID
            title: 'テレアポ',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'tereapobaito',           // 必要：conversationDataのbackgroundと一致
            bgm: 'etude_op40_no3_toccatina',     // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['tereapobaito'],    // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'narrator_a'],  // 必要：character+expressionの組み合わせ
                bgm: ['etude_op40_no3_toccatina'] // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'tereapo',       // 必要：conversationDataのキーと一致
            areaName: 'tereapo'                  // 必要：エリア名の指定
        },
        
        // 初日の出
        'first_rising_sun': {
            id: 'first_rising_sun',              // 必要：イベントを識別するためのID
            title: '初日の出',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：イベントの種類を指定
            background: 'hatuhinode',            // 必要：conversationDataのbackgroundと一致
            bgm: 'Spain',                        // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['hatuhinode'],      // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_c', 'hirokazu_i', 'hirokazu_k', 'koutarou_a', 'koutarou_c', 'kanato_c', 'daichi_d', 'narrator_a'],  // 必要：character+expressionの組み合わせ
                bgm: ['Spain']                    // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'first_rising_sun',  // 必要：conversationDataのキーと一致
            areaName: 'first_rising_sun'         // 必要：エリア名の指定
        },
        
        // 荒地
        'arechi': {
            id: 'arechi',                        // 必要：イベントを識別するためのID
            title: '荒地',                         // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'nichijyou_3',                // 必要：conversationDataのbackgroundと一致
            bgm: 'rainbow_Seeker_II',            // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['nichijyou_3'],          // 必要：背景画像の読み込みに必要
                characters: ['kanato_c', 'kanato_d', 'naoki_c', 'naoki_d', 'naoki_a', 'daichi_e', 'daichi_f', 'daichi_b', 'koutarou_c', 'koutarou_b', 'narrator_a'],  // 必要：character+expressionの組み合わせ
                bgm: ['rainbow_Seeker_II']       // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'arechi',        // 必要：conversationDataのキーと一致
            areaName: 'arechi'                   // 必要：エリア名の指定
        }
    }
};

// ヘルパー関数

// イベントIDからイベント設定を取得
export function getEventConfig(eventId) {

    
    for (const areaKey in EventConfig) {
        const area = EventConfig[areaKey];
        
        if (area[eventId]) {
            return area[eventId];
        }
    }
    
    console.warn(`[EventConfig] イベントID "${eventId}" が見つかりませんでした`);
    return null;
}

// エリアタイプからイベント一覧を取得
export function getEventsByArea(areaType) {
    return EventConfig[areaType] || {};
}

// イベントに必要なリソースの一覧を取得
export function getRequiredResources(eventId) {
    const eventConfig = getEventConfig(eventId);
    if (!eventConfig) return null;
    
    return eventConfig.required;
}

// イベントのオプションリソースの一覧を取得
export function getOptionalResources(eventId) {
    const eventConfig = getEventConfig(eventId);
    if (!eventConfig) return null;
    
    return eventConfig.optional;
}

// エリア名からイベントIDを取得
export function getEventIdByAreaName(areaName) {
    for (const areaKey in EventConfig) {
        const area = EventConfig[areaKey];
        for (const eventId in area) {
            if (area[eventId].areaName === areaName) {
                return eventId;
            }
        }
    }
    return null;
}

// 会話データキーからイベント設定を取得
export function getEventConfigByConversationKey(conversationKey) {
    for (const areaKey in EventConfig) {
        const area = EventConfig[areaKey];
        for (const eventId in area) {
            if (area[eventId].conversationDataKey === conversationKey) {
                return area[eventId];
            }
        }
    }
    return null;
}
