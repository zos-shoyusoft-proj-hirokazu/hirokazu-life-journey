// イベントコンフィグファイル
// 既存のconversationDataの構造を活かして、イベントごとの設定を管理

export const EventConfig = {
    // 三重町エリアのイベント設定
    miemachi: {
        // 俺の事
        'oreno_koto': {
            id: 'oreno_koto',
            title: '俺の事',
            type: 'conversation',
            areaType: 'miemachi',
            // 既存のconversationDataとの互換性
            background: 'orenokoto',
            bgm: 'Fantasy',
            // 必要なリソース（既存のAreaConfigから抽出）
            required: {
                backgrounds: ['orenokoto'],
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'hirokazu_d', 'hirokazu_e', 'hirokazu_f', 'hirokazu_g'],
                bgm: ['Fantasy'],
                se: ['touch', 'taiko 2ren', 'don']
            },
            // 会話データの参照
            conversationDataKey: 'oreno_koto',
            // エリア設定との対応
            areaName: 'oreno_koto'
        },
        
        // 志学
        'shigaku': {
            id: 'shigaku',
            title: '志学',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'raizu',
            bgm: 'metoroido',
            required: {
                backgrounds: ['raizu'],
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'kanato_a', 'kanato_b', 'kanato_c', 'daichi_a', 'daichi_b', 'daichi_c', 'koutarou_a', 'koutarou_b', 'koutarou_c', 'naoki_a', 'naoki_b', 'naoki_c', 'yabajinn_a'],
                bgm: ['metoroido'],
                se: ['touch', 'taiko 2ren', 'don']
            },
            conversationDataKey: 'shigaku',
            areaName: 'raizu'
        },
        
        // 桃色女学院
        'momoiro_jyogakuenn': {
            id: 'momoiro_jyogakuenn',
            title: '桃色女学院',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'momoiro',
            bgm: 'Fantasy',
            required: {
                backgrounds: ['momoiro'],
                characters: ['hirokazu_a', 'hirokazu_b', 'hirokazu_c', 'daichi_a', 'daichi_b', 'daichi_c'],
                bgm: ['Fantasy'],
                se: ['touch', 'taiko_2ren']
            },
            conversationDataKey: 'annex_momo',
            areaName: 'momoiro_jyogakuenn'
        },
        
        // 飲み会
        'drinking_dutu': {
            id: 'drinking_dutu',
            title: '飲み会',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'dutu',
            bgm: 'nightbarth',
            required: {
                backgrounds: ['dutu'],
                characters: ['hirokazu_a', 'hirokazu_b', 'daichi_a'],
                bgm: ['nightbarth'],
                se: ['touch', 'takibi_tan']
            },
            conversationDataKey: 'drink_zutsu',
            areaName: 'drinking_dutu'
        },
        
        // 川の火事
        'Weeds_burn': {
            id: 'Weeds_burn',
            title: '川の火事',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'Fire',
            bgm: 'Jounetsu_Tairiku',
            required: {
                backgrounds: ['Fire'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['Jounetsu_Tairiku'],
                se: ['touch', 'wind2']
            },
            conversationDataKey: 'river_fire',
            areaName: 'Weeds_burn'
        },
        
        // スナック街の夜
        'snack_street_night': {
            id: 'snack_street_night',
            title: 'スナック街の夜',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'sunakku_sa',
            bgm: 'ON_THE_BEACH',
            required: {
                backgrounds: ['sunakku_sa'],
                characters: ['hirokazu_a', 'hirokazu_b', 'yabajinn_a'],
                bgm: ['ON_THE_BEACH'],
                se: ['touch', 'wind2']
            },
            conversationDataKey: 'snack_street_night',
            areaName: 'snack_street_night'
        },
        
        // チーム醤油飲み会
        'team_shoyu_drinking': {
            id: 'team_shoyu_drinking',
            title: 'チーム醤油飲み会',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'souce',
            bgm: 'Last_Summer_In_Rio',
            required: {
                backgrounds: ['souce'],
                characters: ['hirokazu_a', 'hirokazu_b', 'daichi_a', 'naoki_a'],
                bgm: ['Last_Summer_In_Rio'],
                se: ['touch', 'takibi_tan']
            },
            conversationDataKey: 'team_shoyu_drinking',
            areaName: 'souce'
        },
        
        // コータローとポテト
        'koutarou_potato': {
            id: 'koutarou_potato',
            title: 'コータローとポテト',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'koutaroupoteto',
            bgm: 'metoroido',
            required: {
                backgrounds: ['koutaroupoteto'],
                characters: ['koutarou_a', 'koutarou_b', 'koutarou_c'],
                bgm: ['metoroido'],
                se: ['touch', 'don']
            },
            conversationDataKey: 'koutarou_potato',
            areaName: 'koutaroupoteto'
        },
        
        // セブン
        'seven': {
            id: 'seven',
            title: 'セブン',
            type: 'conversation',
            areaType: 'miemachi',
            background: 'seven',
            bgm: 'Nagisa_Moderato',
            required: {
                backgrounds: ['seven'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['Nagisa_Moderato'],
                se: ['touch']
            },
            conversationDataKey: 'seven',
            areaName: 'seven'
        }
    },
    
    // 竹田エリアのイベント設定
    taketa: {
        // 竹田駅
        'taketa_station': {
            id: 'taketa_station',
            title: '竹田駅',
            type: 'conversation',
            areaType: 'taketa',
            background: 'street',
            bgm: 'Spain',
            required: {
                backgrounds: ['street'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['Spain'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'taketa_station',
            areaName: 'taketa_station'
        },
        
        // 銀河の水
        'ginnga_water': {
            id: 'ginnga_water',
            title: '銀河の水',
            type: 'conversation',
            areaType: 'taketa',
            background: 'galaxy_water',
            bgm: 'Fantasy',
            required: {
                backgrounds: ['galaxy_water'],
                characters: ['hirokazu_a', 'hirokazu_b', 'kanato_a'],
                bgm: ['Fantasy'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'ginnga_water',
            areaName: 'galaxy_water'
        },
        
        // 腕振りおじさん
        'arm_swinging_person': {
            id: 'arm_swinging_person',
            title: '腕振りおじさん',
            type: 'conversation',
            areaType: 'taketa',
            background: 'street',
            bgm: 'nightbarth',
            required: {
                backgrounds: ['street'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['nightbarth'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'arm_swinging_person',
            areaName: 'udefuriojisann'
        },
        
        // 仕事帰り
        'working_go_to_home_miemachi': {
            id: 'working_go_to_home_miemachi',
            title: '仕事帰り',
            type: 'conversation',
            areaType: 'taketa',
            background: 'street',
            bgm: 'Nagisa_Moderato',
            required: {
                backgrounds: ['street'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['Nagisa_Moderato'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'working_go_to_home_miemachi',
            areaName: 'working_go_to_home_miemachi'
        }
    },
    
    // 日本エリアのイベント設定
    japan: {
        // コンピュータ
        'computer': {
            id: 'computer',
            title: 'コンピュータ',
            type: 'conversation',
            areaType: 'japan',
            background: 'test_1',
            bgm: 'Theme_from_Back_To_The_Future',
            required: {
                backgrounds: ['test_1'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['Theme_from_Back_To_The_Future'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'computer',
            areaName: 'computer'
        },
        
        // 壊れた車
        'breaking_car': {
            id: 'breaking_car',
            title: '壊れた車',
            type: 'conversation',
            areaType: 'japan',
            background: 'test_1',
            bgm: 'curono',
            required: {
                backgrounds: ['test_1'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['curono'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'breaking_car',
            areaName: 'breaking_car'
        },
        
        // 特殊詐欺
        'special_scam': {
            id: 'special_scam',
            title: '特殊詐欺',
            type: 'conversation',
            areaType: 'japan',
            background: 'test_1',
            bgm: 'togetogetarumeiro',
            required: {
                backgrounds: ['test_1'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['togetogetarumeiro'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'special_scam',
            areaName: 'special_scam'
        },
        
        // 路上のペンキ
        'rojyounopenki': {
            id: 'rojyounopenki',
            title: '路上のペンキ',
            type: 'conversation',
            areaType: 'japan',
            background: 'test_1',
            bgm: 'curono',
            required: {
                backgrounds: ['test_1'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['curono'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'rojyounopenki',
            areaName: 'rojyounopenki'
        },
        
        // テレアポ
        'tereapo': {
            id: 'tereapo',
            title: 'テレアポ',
            type: 'conversation',
            areaType: 'japan',
            background: 'test_1',
            bgm: 'togetogetarumeiro',
            required: {
                backgrounds: ['test_1'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['togetogetarumeiro'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'tereapo',
            areaName: 'tereapo'
        },
        
        // グレイバイツ
        'gray_bytes': {
            id: 'gray_bytes',
            title: 'グレイバイツ',
            type: 'conversation',
            areaType: 'japan',
            background: 'test_1',
            bgm: 'curono',
            required: {
                backgrounds: ['test_1'],
                characters: ['hirokazu_a', 'hirokazu_b'],
                bgm: ['curono'],
                se: ['touch', 'map_touch']
            },
            conversationDataKey: 'gray_bytes',
            areaName: 'gray_bytes'
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
