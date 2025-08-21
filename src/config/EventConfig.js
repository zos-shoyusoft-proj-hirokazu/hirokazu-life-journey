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
                backgrounds: ['orenokoto'],      // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_g', 'mannga_a', 'mannga_b', 'mannga_c', 'mannga_d', 'mannga_e', 'mannga_f'],  // 必要：character+expressionの組み合わせ
                bgm: ['Fantasy']                 // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'oreno_koto',   // 必要：conversationDataのキーと一致
            areaName: 'orenokoto'               // 必要：エリア名の指定
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
            areaName: 'momoiro'                 // 必要：エリア名の指定
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
            bgm: 'nightbarth',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['dutu'],           // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'koutarou_a', 'koutarou_c', 'daichi_b', 'daichi_a', 'dutu'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['nightbarth']              // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため（taiko_2renは1箇所のみ）
            },
            conversationDataKey: 'drinking_dutu',   // 必要：conversationDataのキーと一致
            areaName: 'dutu'                     // 必要：エリア名の指定
        },
        
        // 川で火事
        'Weeds_burn': {
            id: 'Weeds_burn',                    // 必要：イベントを識別するためのID
            title: '川の火事',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'Fire',                  // 必要：conversationDataのbackgroundと一致
            bgm: 'metoroido',                    // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['Fire'],           // 必要：背景画像の読み込みに必要
                characters: ['daichi_young_a', 'daichi_young_c', 'daichi_young_d', 'daichi_young_e', 'hirokazu_young_g', 'hirokazu_young_b', 'narrator_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['metoroido'],              // 必要：BGMファイルの読み込みに必要
                se: ['sei_ge_matti_tukeru01', 'takibi_tan', 'wind2']  // 必要：conversationDataで使用されるSE
            },
            conversationDataKey: 'Weeds_burn',    // 必要：conversationDataのキーと一致
            areaName: 'Fire'                     // 必要：エリア名の指定
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
                backgrounds: ['miemachimae', 'jewelry', 'doll', 'secret', 'hanaichiba', 'joelyn', 'sunakku_sa', 'cool', 'seven'],  // 必要：conversationDataで使用される背景画像
                characters: ['hirokazu_d', 'hirokazu_e', 'hirokazu_a', 'kanato_c', 'koutarou_a', 'naoki_c', 'daichi_e', 'narrator_a', 'yabajinn_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['nightbarth'],             // 必要：BGMファイルの読み込みに必要
                se: ['taiko_2ren', 'don']        // 必要：conversationDataで使用されるSE
            },
            conversationDataKey: 'snack_street_night',  // 必要：conversationDataのキーと一致
            areaName: 'miemachimae'              // 必要：エリア名の指定
        },
        
        // チーム醤油飲み会
        'souce': {
            id: 'souce',                         // 必要：イベントを識別するためのID
            title: 'チーム醤油飲み会',              // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'souce',                 // 必要：conversationDataのbackgroundと一致
            bgm: 'nightbarth',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['souce'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_e', 'hirokazu_b', 'hirokazu_d', 'hirokazu_l', 'koutarou_a', 'koutarou_e', 'koutarou_g', 'kanato_c', 'kanato_b', 'kanato_d', 'daichi_e', 'daichi_f', 'daichi_b', 'naoki_a', 'naoki_c', 'naoki_b', 'narrator_a', 'line_group_syouyu'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['nightbarth']              // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
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
                characters: ['daichi_a', 'hirokazu_a'],  // 必要：character+expressionの組み合わせ（重複除く）
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
                backgrounds: ['seven'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_e', 'daichi_e', 'kanato_c', 'naoki_c', 'koutarou_a', 'koutarou_N', 'narrator_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Last_Summer_In_Rio']     // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため（dededonは1箇所のみ）
            },
            conversationDataKey: 'seven',        // 必要：conversationDataのキーと一致
            areaName: 'seven'                   // 必要：エリア名の指定
        },
        
        // おかがみとの会話
        'okagami_conversation': {
            id: 'okagami_conversation',          // 必要：イベントを識別するためのID
            title: 'おかがみとの会話',              // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],         // 必要：背景画像の読み込みに必要
                characters: ['okagami_c', 'okagami_a', 'player_c'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                 // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'okagami_conversation',  // 必要：conversationDataのキーと一致
            areaName: 'test_1'                  // 必要：エリア名の指定
        },
        
        // だいちとの会話
        'daichi_conversation': {
            id: 'daichi_conversation',           // 必要：イベントを識別するためのID
            title: 'だいちとの会話',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'miemachi',                // 必要：エリアタイプを指定
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],         // 必要：背景画像の読み込みに必要
                characters: ['daichi_c', 'daichi_a', 'hirokazu_b', 'hirokazu_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                 // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'daichi_conversation',  // 必要：conversationDataのキーと一致
            areaName: 'test_1'                  // 必要：エリア名の指定
        }
    },
    
    // 竹田エリアのイベント設定
    taketa: {
        // 昼休み鬼ごっこ
        'lunch_tag': {
            id: 'lunch_tag',                     // 必要：イベントを識別するためのID
            title: '昼休み鬼ごっこ',                // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_c', 'daichi_b', 'naoki_a', 'kanato_a', 'kanato_c', 'kanato_e', 'kanato_f', 'koutarou_d'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'lunch_tag',     // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // 竹田駅
        'taketa_station': {
            id: 'taketa_station',                // 必要：イベントを識別するためのID
            title: '竹田駅',                      // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'station',                // 必要：conversationDataのbackgroundと一致
            bgm: 'nightbarth',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['station'],         // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b'],  // 必要：character+expressionの組み合わせ
                bgm: ['nightbarth']               // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'taketa_station',  // 必要：conversationDataのキーと一致
            areaName: 'station'                   // 必要：エリア名の指定
        },
        
        // 銀河の水
        'ginnga_water': {
            id: 'ginnga_water',                  // 必要：イベントを識別するためのID
            title: '銀河の水',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'galaxy',                // 必要：conversationDataのbackgroundと一致
            bgm: 'nightbarth',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['galaxy'],          // 必要：背景画像の読み込みに必要
                characters: ['daichi_b'],         // 必要：character+expressionの組み合わせ
                bgm: ['nightbarth']               // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'ginnga_water',  // 必要：conversationDataのキーと一致
            areaName: 'galaxy'                   // 必要：エリア名の指定
        },
        
        // 腕振りおじさん
        'arm_swinging_person': {
            id: 'arm_swinging_person',           // 必要：イベントを識別するためのID
            title: '腕振りおじさん',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'street',                // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['street'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'daichi_b', 'kanato_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'arm_swinging_person',  // 必要：conversationDataのキーと一致
            areaName: 'street'                   // 必要：エリア名の指定
        },
        
        // 仕事帰り
        'working_go_to_home_miemachi': {
            id: 'working_go_to_home_miemachi',   // 必要：イベントを識別するためのID
            title: '仕事帰り',                     // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'street',                // 必要：conversationDataのbackgroundと一致
            bgm: 'Nagisa_Moderato',              // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['street'],          // 必要：背景画像の読み込みに必要
                characters: ['kanato_a', 'kanato_c', 'hirokazu_a', 'daichi_b', 'koutarou_b', 'naoki_b'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Nagisa_Moderato']          // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'working_go_to_home_miemachi',  // 必要：conversationDataのキーと一致
            areaName: 'street'                   // 必要：エリア名の指定
        },
        
        // ゴスペラーズの歌
        'gospellers_song': {
            id: 'gospellers_song',               // 必要：イベントを識別するためのID
            title: 'ゴスペラーズの歌',               // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'daichi_a', 'kanato_b'],  // 必要：character+expressionの組み合わせ（重複除く）
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
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['kanato_b', 'hirokazu_d'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
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
            background: 'classroom_door',         // 必要：conversationDataのbackgroundと一致
            bgm: 'Jounetsu_Tairiku',             // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom_door'],   // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'hirokazu_d', 'hirokazu_e', 'hirokazu_f', 'hirokazu_g', 'hirokazu_h', 'hirokazu_i', 'hirokazu_j', 'hirokazu_k', 'hirokazu_l', 'hirokazu_m', 'hirokazu_n', 'hirokazu_o', 'hirokazu_p', 'hirokazu_q', 'hirokazu_r', 'hirokazu_s', 'hirokazu_t', 'hirokazu_u', 'hirokazu_v', 'hirokazu_w', 'hirokazu_x', 'hirokazu_y', 'hirokazu_z'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Jounetsu_Tairiku']         // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'classroom_lock_incident',  // 必要：conversationDataのキーと一致
            areaName: 'classroom_door'            // 必要：エリア名の指定
        },
        
        // こうたろうのおしっこ事件
        'koutarou_toilet': {
            id: 'koutarou_toilet',               // 必要：イベントを識別するためのID
            title: 'こうたろうのおしっこ事件',        // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['koutarou_a', 'koutarou_b', 'koutarou_c', 'koutarou_d', 'koutarou_e', 'koutarou_f', 'koutarou_g', 'koutarou_h', 'koutarou_i', 'koutarou_j', 'koutarou_k', 'koutarou_l', 'koutarou_m', 'koutarou_n', 'koutarou_o', 'koutarou_p', 'koutarou_q', 'koutarou_r', 'koutarou_s', 'koutarou_t', 'koutarou_u', 'koutarou_v', 'koutarou_w', 'koutarou_x', 'koutarou_y', 'koutarou_z'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
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
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'hirokazu_d', 'hirokazu_e', 'hirokazu_f', 'hirokazu_g', 'hirokazu_h', 'hirokazu_i', 'hirokazu_j', 'hirokazu_k', 'hirokazu_l', 'hirokazu_m', 'hirokazu_n', 'hirokazu_o', 'hirokazu_p', 'hirokazu_q', 'hirokazu_r', 'hirokazu_s', 'hirokazu_t', 'hirokazu_u', 'hirokazu_v', 'hirokazu_w', 'hirokazu_x', 'hirokazu_y', 'hirokazu_z'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
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
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'hirokazu_d', 'hirokazu_e', 'hirokazu_f', 'hirokazu_g', 'hirokazu_h', 'hirokazu_i', 'hirokazu_j', 'hirokazu_k', 'hirokazu_l', 'hirokazu_m', 'hirokazu_n', 'hirokazu_o', 'hirokazu_p', 'hirokazu_q', 'hirokazu_r', 'hirokazu_s', 'hirokazu_t', 'hirokazu_u', 'hirokazu_v', 'hirokazu_w', 'hirokazu_x', 'hirokazu_y', 'hirokazu_z'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'train_no_poop_man',  // 必要：conversationDataのキーと一致
            areaName: 'classroom'                // 必要：エリア名の指定
        },
        
        // かなとのビデオカメラを落として壊す
        'videocamera_broken': {
            id: 'videocamera_broken',            // 必要：イベントを識別するためのID
            title: 'かなとのビデオカメラを落として壊す',  // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'taketa',                  // 必要：エリアタイプを指定
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['kanato_a', 'hirokazu_a', 'kanato_c', 'hirokazu_d', 'kanato_c', 'narrator_a'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
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
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'nightbarth',                   // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'kanato_b', 'daichi,koutarou,shuuhei,masato,kanato_b'],  // 必要：character+expressionの組み合わせ（重複除く）
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
            background: 'classroom',              // 必要：conversationDataのbackgroundと一致
            bgm: 'Fantasy',                      // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['classroom'],       // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'hirokazu_d', 'hirokazu_e', 'hirokazu_f', 'hirokazu_g', 'hirokazu_h', 'hirokazu_i', 'hirokazu_j', 'hirokazu_k', 'hirokazu_l', 'hirokazu_m', 'hirokazu_n', 'hirokazu_o', 'hirokazu_p', 'hirokazu_q', 'hirokazu_r', 'hirokazu_s', 'hirokazu_t', 'hirokazu_u', 'hirokazu_v', 'hirokazu_w', 'hirokazu_x', 'hirokazu_y', 'hirokazu_z'],  // 必要：character+expressionの組み合わせ（重複除く）
                bgm: ['Fantasy']                  // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'kannnamu_kudou',  // 必要：conversationDataのキーと一致
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
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'curono',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b'],  // 必要：character+expressionの組み合わせ
                bgm: ['curono']                   // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
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
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'curono',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c'],  // 必要：character+expressionの組み合わせ
                bgm: ['curono']                   // 必要：BGMファイルの読み込みに必要
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
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'togetogetarumeiro',            // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'stranger_a'],  // 必要：character+expressionの組み合わせ
                bgm: ['togetogetarumeiro']        // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'special_scam',  // 必要：conversationDataのキーと一致
            areaName: 'special_scam'             // 必要：エリア名の指定
        },
        
        // 路上のペンキ
        'rojyounopenki': {
            id: 'rojyounopenki',                 // 必要：イベントを識別するためのID
            title: '路上のペンキ',                  // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'curono',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b'],  // 必要：character+expressionの組み合わせ
                bgm: ['curono']                   // 必要：BGMファイルの読み込みに必要
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
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'curono',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b'],  // 必要：character+expressionの組み合わせ
                bgm: ['curono']                   // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'tereapo',       // 必要：conversationDataのキーと一致
            areaName: 'tereapo'                  // 必要：エリア名の指定
        },
        
        // グレイバイツ
        'gray_byte': {
            id: 'gray_bytes',                    // 必要：イベントを識別するためのID
            title: 'グレイバイツ',                  // 必要：イベントのタイトル表示用
            type: 'conversation',                // 必要：イベントの種類を指定
            areaType: 'japan',                   // 必要：エリアタイプを指定
            background: 'test_1',                // 必要：conversationDataのbackgroundと一致
            bgm: 'curono',                       // 必要：conversationDataのbgmと一致
            required: {
                backgrounds: ['test_1'],          // 必要：背景画像の読み込みに必要
                characters: ['hirokazu_a', 'hirokazu_b'],  // 必要：character+expressionの組み合わせ
                bgm: ['curono']                   // 必要：BGMファイルの読み込みに必要
                // seセクションは不要：conversationDataにSEの指定がないため
            },
            conversationDataKey: 'gray_bytes',    // 必要：conversationDataのキーと一致
            areaName: 'gray_bytes'               // 必要：エリア名の指定
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
