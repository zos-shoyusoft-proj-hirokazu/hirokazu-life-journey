// 三重町ステージ会話データの定義
// ResourceManagerは src/managers/ResourceManager.js から読み込み
//
// 使用方法:
// 1. マップ読み込み時（軽量）
//    await conversationManager.loadMap('miemachi');
//
// 2. イベント開始時（重いリソース読み込み）
//    await conversationManager.startEvent('oreno_koto');
//
export const miemachiConversationData = {
    // 出生エピソード
    'oreno_koto': {
        'background': 'orenokoto',
        'bgm': 'Fantasy',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '俺のことについてはなすぜ☆',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '生まれた時間は１９９６年９月２９年日曜日で晴れの日だぜ☆',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '生まれた病院は佐藤産婦人科でうまれたぜ',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '名前の由来は「寛」の字は父親が気に入ってた字で、和は母さんから取ったぜ',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '出産は予定日から１９日前に２６４８gで生まれたぜ☆',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '血液型はAB型だぜ☆',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '安産だったらしいぜ',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '生まれた時髪の毛は比較的多かったぜ',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '生まれたときの第一声が「オギャー」だぜ',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '最後に俺の自信作の漫画を紹介するぜ',
                'expression': 'g'
            },
            {
                'speaker': '自信作の漫画',
                'character': 'mannga',
                'expression': 'a'
            },
            {
                'speaker': '自信作の漫画',
                'character': 'mannga',
                'expression': 'b'
            },
            {
                'speaker': '自信作の漫画',
                'character': 'mannga',
                'expression': 'c'
            },
            {
                'speaker': '自信作の漫画',
                'character': 'mannga',
                'expression': 'd'
            },
            {
                'speaker': '自信作の漫画',
                'character': 'mannga',
                'expression': 'e'
            },
            {
                'speaker': '自信作の漫画',
                'character': 'mannga',
                'expression': 'f'
            },
        ]
    },
    
    // 志学エピソード
    'raizu': {
        'background': 'raizu',
        'bgm': 'metoroido',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '昔さぁ、、、ライズっていうやば人がいた塾あったじゃん、今どんな感じ？',
                'expression': 'e'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'どうもこうも、まだやってるよね？',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'やってるな、その塾はまだやってる、今はライズ１とかいう名前でやってるけど',
                'expression': 'e'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'なついな、、、元気かな？',
                'expression': 'a'
            },
            {
                'speaker': 'かなと',
                'character': 'koutarou',
                'text': 'ああ、一日２箱キメてる、ヘビースモーカーのやば人な',
                'expression': 'c'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'まだ、元気なんだろか',
                'expression': 'c'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'ちょっと、今度確認してくるわ',
                'expression': 'c'
            },
            {
                'character': 'narrator',
                'text': '数日後',
                'expression': 'a'
            },
            {
                'speaker': 'やばじん',
                'character': 'yabajinn',
                'text': 'おらぁぁぁ！！！！！',
                'expression': 'a'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'でたな',
                'expression': 'c'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'でたな',
                'expression': 'c'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'なんか、安心したわ',
                'expression': 'c'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'かわらない、良さというものがあるな',
                'expression': 'c'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'ライズだなー',
                'expression': 'c'
            },
        ]
    },
    
    // チーム醤油飲み会
    'souce': {
        'background': 'souce',
        'bgm': 'pokémon_Theme',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'お盆で暇だな、喜久でちょっと飲もうか',
                'expression': 'e'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'まぁ、ええよ、せっかくそろったしな',
                'expression': 'a'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'えーと、ね、あの、うーん、えっとね',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'どした？？',
                'expression': 'e'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '？？',
                'expression': 'a'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'おれら、実は喜久、出禁になったんよね、、',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず、こうたろう',
                'character': 'hirokazu',
                'text': '！？',
                'expression': 'e'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'ん？どういうこと？',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず、こうたろう',
                'character': 'hirokazu',
                'text': 'まったく、おれら心当たりはないんだが？',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'いや、説明すると、この前、「かなと、俺、なおき」その他のメンバーで飲みに行ったんやけど、',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'その時に来た、日本酒のお酒の中になぜか日本酒と醤油が混ざってたんよ',
                'expression': 'e'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'もちろん、俺らがいれたわけではないよ',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'で、俺らもさすがに飲めないから、何もいわずにテーブルの上において帰ったんだけど',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'それを、俺らがいたずらで入れたって話になって冤罪で出禁になりました。',
                'expression': 'e'
            },            
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': '一応、次の日に謝りにいったけど門前払いを食らいました。',
                'expression': 'c'
            },            
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'ぶっちゃけ、俺ら何も悪いことしてないから何を反省していいのかわからんかったけど',
                'expression': 'b'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '俺とこうたろうはとばっちりすぎん？',
                'expression': 'b'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'いや、、、、まぁ',
                'expression': 'c'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'そう',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'なんでだよ、、',
                'expression': 'd'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '飛び火すぎるわ',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'ｗｗｗｗｗｗｗｗｗｗｗ',
                'expression': 'f'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'どうすんだよ、、、どこでのむよ',
                'expression': 'g'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '「かくれんぼ」、ならいけるとおもうぞ',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'かくれんぼにするか、、、',
                'expression': 'l'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'ちょうど、改装しているから行けるかどうか、、',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'まぁ、あそこはいけるやろ、あそこは、なんか知らんけどいつも空いてるやん',
                'expression': 'l'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'たしかにぃ、、',
                'expression': 'b'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'えっと、どうする？',
                'expression': 'l'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': '何が？',
                'expression': 'd'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'もう、おれらのグループ名しょうゆにするか',
                'expression': 'l'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '、、、するか、、、、醤油に',
                'expression': 'b'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'じゃあ、ＬＩＮＥのグループ名は醤油にしときます',
                'expression': 'd'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '醤油か、、、、、おれは関係ないけど',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '決定だ',
                'expression': 'a'
            },
            {
                'character': 'line_group_syouyu',
                'text': 'こうして、lineグループはしょうゆになった。',
                'expression': 'a'
            }
        ]
    },
    
    // セブンエピソード
    'seven': {
        'background': 'seven',
        'bgm': 'Last_Summer_In_Rio',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '帰るか、、、',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'どうやって帰ります？',
                'expression': 'e'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ん？？そりゃ、タクシーで、、',
                'expression': 'e'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'タクシー？',
                'expression': 'c'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '三重町にそんな便利な物ないぞ',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'se': 'dededon',
                'text': 'あっ！！！',
                'expression': 'e'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '三重町にはそんなものないぞ、こんな時間は',
                'expression': 'a'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '残念だったなｗ',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '歩いて帰るのか、、、',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '三重町だからな、、、',
                'expression': 'e'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '仕方ないつきあってやるか',
                'expression': 'a'
            },
            {
                'speaker': 'かなと,なおき',
                'character': 'kanato',
                'text': 'はじまった、、反対方向なのに、、、',
                'expression': 'c'
            },
            {
                'speaker': 'ナレーション',
                'character': 'narrator',
                'text': '移動中',
                'expression': 'a'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '、、、、、',
                'expression': 'N'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '、、、、、おれ結婚するんだよな、、、',
                'expression': 'N'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ん？？',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'おっと、、、なんか言った？',
                'expression': 'e'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'なんか、聞こえたな',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'おい、やっぱりおっぱいか、おっぱいなんだな、嫁さんおっぱい大きいって言ってたもんな！',
                'expression': 'e'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'ん、、、、、？',
                'expression': 'a'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'そう',
                'expression': 'a'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': 'おらぁぁぁ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'えっと、どうする？処すか？',
                'expression': 'e'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '処します',
                'expression': 'e'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': '拷問して、、、、死刑！！！！！！！！',
                'expression': 'c'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '賛成です',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'ゆるさんぞ！！！',
                'expression': 'e'
            },
            {
                'speaker': 'ナレーション',
                'character': 'narrator',
                'text': 'ー２年後ー',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'おれ、結婚するんだよな、、、',
                'expression': 'e'
            },
            {
                'speaker': 'かなと、なおき',
                'character': 'kanato',
                'text': 'はい、死刑',
                'expression': 'c,c'
            },
        ]
    },
    
    // 川で火をつけたエピソード
    'Weeds_burn': {
        'background': 'Fire',
        'bgm': 'bloody_tears',
        'conversations': [
            {
                'speaker': 'だいち少年',
                'character': 'daichi_young',
                'text': '火遊びしたいな',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'これを使えば、火遊びできるよ',
                'expression': 'g'
            },
            {
                'speaker': 'だいち少年',
                'character': 'daichi_young',
                'text': 'よし！いけ！',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'いや、まてさすがにここでは周りに火が付きそうなものがおおい',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'なので、距離をおいて火をつけよう',
                'expression': 'g'
            },
            {
                'speaker': 'だいち少年',
                'character': 'daichi_young',
                'text': 'ここなら大丈夫だろ、この川の別れて、陸みたいになってるとこ！！！',
                'expression': 'c'
            },
            {
                'speaker': 'だいち少年',
                'character': 'daichi_young',
                'text': '新大陸だ！！！！',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'ここならいける！！！！',
                'expression': 'g'
            },
            {
                'speaker': 'だいち少年',
                'character': 'daichi_young',
                'text': 'よし、やるんだ！！！',
                'expression': 'c'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'se': 'sei_ge_matti_tukeru01',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'パチパチっ、、、',
                'se': 'takibi_tan',
                'expression': 'a'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': '火ついたな、、、',
                'expression': 'd'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'おおっ、、あたたけぇ、、、',
                'expression': 'b'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'ええな、、、、',
                'expression': 'e'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'びゅぅぅぅぅ、、。',
                'se': 'wind2',
                'expression': 'a'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'なんか風が、、、なぁ、、、！？！？！！！！！？！？！？',
                'expression': 'e'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'もえた、物が、、、、、風に飛んで、、',
                'expression': 'e'
            },
            {
                'speaker': 'ダイチ少年、ひろかず少年',
                'character': 'daichi_young',
                'text': 'あっっっ！！！！！！！！！！！！！！！！',
                'se': 'takibi_tan',
                'background': 'moeru',
                'expression': 'g,g'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'えっと、なんかやばくね',
                'expression': 'g'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'やばくね？なんかやばくね？？？？？',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': '、、、、、けせーーーーーーーー！、水かけろ！！！！',
                'expression': 'g'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'まずいまずいまずいまずいまずいまずいまずいまずい！！！！！！！',
                'expression': 'I'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'みっ、、、水をかけるんだ！！！はやく！！！！',
                'expression': 'g'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'ダメだ！！！！！火の勢いが強い',
                'expression': 'K'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'daichi_young',
                'text': 'つっっつち！！！！',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'daichi_young',
                'text': '土をなげろぉーーーーーーーーーー！！！！！',
                'expression': 'g'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': '泥しかないです！！！',
                'expression': 'K'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'なんでもいいから、なげろぉぉおぉ！！！',
                'expression': 'K'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': '火がぁぁぁ！つよい！！！',
                'expression': 'K'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'あきらめるな！！！早くけせーーーーーーーー！！！',
                'expression': 'g'
            },
            {
                'text': '３０分後',
                'expression': 'a'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'やったか？、、、',
                'expression': 'M'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'se': 'sei_ge_matti_tukeru01',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': '早くけせーーーーーーーー！！！',
                'expression': 'g'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '、、、',
                'se': 'sei_ge_matti_tukeru01',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '、、、、、',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '、、、、、、、、、、、、',
                'expression': 'a'
            },
            {
                'speaker': 'ダイチ少年',
                'character': 'daichi_young',
                'text': 'なっ、、、何とかきえたぞ、、、、',
                'background': 'moeato',
                'expression': 'M'
            },
            {
                'speaker': 'ひろかず少年',
                'character': 'hirokazu_young',
                'text': 'やばかった、焦ったわ、、、、、',
                'expression': 'g'
            }
        ]
    },
    
    // こうたろうポテト
    'koutaroupoteto': {
        'background': 'koutaroupoteto',
        'bgm': 'Nagisa_Moderato',
        'conversations': [
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'ここのポテトうまいな、、',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ここは三重町で有名なポテト屋ですよ',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '１００円で、この量はお得でうまいな',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'まぁ、いいけど、一週間ずっと、来てるやん、、、',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'うまいからいいんだよ',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'あっ、、、はい',
                'expression': 'a'
            },
        ]
    },
    
    // アンタレス
    'antares': {
        'background': 'test_1',
        'bgm': 'Nagisa_Moderato',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'バス釣りっておもしろいな、、、リールがほしい、、、',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'やっぱ、釣り道具ってかっちょいいよな',
                'expression': 'b'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'アンタレス欲しいな、、、あと、ルアーも',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'とりあえず、帰りにバス釣り行くぞ！！',
                'expression': 'd'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'おっしゃ、いくんだ！！！',
                'expression': 'e'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'おらぁぁぁ！！！！！',
                'expression': 'f'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ああああああああ、俺のルアーがあああああああ',
                'expression': 'g'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ルアーだけ飛んでったぞ、、、、、、うわぁぁぁ',
                'expression': 'h'
            }
        ]
    },
    
    // ドンキの謎酒"ずつ"
    'drinking_dutu': {
        'background': 'dutu',
        'bgm': 'africa',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '普通の酒飲み飽きたなー',
                'expression': 'a'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'ドンキで探すか',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'あっ！これよくね！？',
                'expression': 'b'
            },
            {
                'character': 'dutu',
                'se': 'taiko_2ren',
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'これもう一気するための大きさじゃん！',
                'expression': 'b'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '一気してくださいって言ってるなあ！',
                'expression': 'a'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'それ御神酒じゃね？',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ドンキには一気する用の酒も売ってるんかあ！',
                'expression': 'b'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'じゃあ1人一本ずつ買うか！',
                'expression': 'a'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'いや1人一本ずつのやつかそれ？',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '1人一本"ずつ"のやつ、いくぞお！',
                'expression': 'b'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '"ずつ"！うおおお！',
                'expression': 'b'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'だから……まあいいか！うおおお！',
                'expression': 'a'
            },
            {
                'text': '、、、夜、、、',
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'ーーさて、夜も更けてきました',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '"ずつ"、いきますか',
                'expression': 'a'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'もうそれの名前"ずつ"なんや',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'よっしゃ3人で同時にいくぞお！',
                'expression': 'b'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'うおおお！',
                'expression': 'b'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'もういいや！いくぞお！',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず・だいち・こうたろう',
                'character': 'all',
                'text': '「「「ゴクゴクゴッ…オロロロロロ✨」」」',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'なんだこれ…',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '体に入らないです',
                'expression': 'c'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '胃に当たってそのまま跳ね返ってくる',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'オロロロロロ✨',
                'expression': 'c'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': 'オロロロロロ…',
                'expression': 'c'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '止まらん…',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': '木の下に吐こオロロロロロ✨',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '大きく成長しろよ',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'オロロロロロ✨',
                'expression': 'c'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '最低の栄養や…',
                'expression': 'c'
            }
        ]
    },
    
    // スナック街の夜
    'snack_street_night': {
        'background': 'miemachimae',
        'bgm': 'nightbarth',
        'conversations': [
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'あー飲んだなー',
                'expression': 'd'
            },
            {
                'speaker': 'かなと',
                'character': 'kanato',
                'text': 'まだ21時か……',
                'expression': 'c'
            },
            {
                'speaker': 'こうたろう',
                'character': 'koutarou',
                'text': '2軒目いくか',
                'expression': 'a'
            },
            {
                'speaker': 'なおき',
                'character': 'naoki',
                'text': '空いてるのスナックしかないよなー',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '三重町はこの時間もう眠ってるからな',
                'expression': 'e'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'よし、じゃあスナック行くぞ！',
                'expression': 'e'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'ここは三重町駅前。推定平均年齢50歳、無数のママたちがひしめく三重町最大の歓楽街。',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '【スナック名鑑 in 三重町】',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'まずはここ！！',
                'expression': 'a',
                'se': 'taiko_2ren'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '『シリウス』',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'クセの強い「よいしょ⤴あそれ⤴」のカラオケ合いの手が名物！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '文字では伝わらないニュアンスだぞ！あともう店は潰れてるぞ！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '次に、『ジュエリー』',
                'expression': 'a',
                'background': 'jewelry',
                'se': 'taiko_2ren'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '鳴物入りでやってきたルーキー！原液9割のレモンサワーで飛べるぞ！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '更に『ドール』',
                'expression': 'a',
                'background': 'doll',
                'se': 'taiko_2ren'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '唯一の同世代・アイドルまゆちゃん！三重町最後の希望だ！でももう引退したぞ！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'でももう引退したぞ！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'あと普通に同級生の親とかも通ってる！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '『シークレット』カラオケが盛り上がりすぎて会話できない！',
                'expression': 'a',
                'background': 'secret',
                'se': 'taiko_2ren'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '最高なフィリピンママによるネイティブ洋楽とフィリピン料理が魅力！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '料金はちょっと不安になるくらい安いぞ！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': 'その他にも',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '『花市場』',
                'expression': 'a',
                'background': 'hanaichiba',
                'se': 'don'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '『じょいりん』！',
                'expression': 'a',
                'background': 'joelyn',
                'se': 'don'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '『さくら』！！',
                'expression': 'a',
                'background': 'sunakku_sa',
                'se': 'don'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '『クール』！！！',
                'expression': 'a',
                'background': 'cool',
                'se': 'taiko_2ren'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '他にも愉快なスナックが勢揃いだ！',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '4時間後',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'やっぱスナックのあとに、コンビニで3次会するのが最高なんだよな〜',
                'background': 'seven',
                'expression': 'a'
            },
            {
                'speaker': 'ナレーター',
                'character': 'narrator',
                'text': '三重町の夜は、まだまだ寝かせてくれない。',
                'expression': 'a'
            }
        ]
    },
    
    // アネックス（ももいろ女学園）
    'momoiro_jyogakuenn': {
        'background': 'momoiro',
        'bgm': 'togetogetarumeiro',
        'conversations': [
            {
                'character': 'narrator',
                'text': 'ここに、二匹の狼がいた。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '賢い狼と、気のいい狼。二匹は共に狩りや水浴びをするほど仲がよかった。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': 'あるとき、賢い狼が言った。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '「獲物を追いかけるより、待ち伏せをしよう。」',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '「そうすれば遠くまで出かけずとも、獲物のほうからやって来るだろう」',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '気のいい狼は二つ返事でうなずいた。だが、二匹には待ち伏せに適した場所の心当たりがなかった。',
                'background': 'ookami',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': 'そこで二匹は、村の物知りな狼に相談することにした。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '物知りな狼は言った。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '「知りたければ、対価を払いなさい」',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '二匹はしぶしぶ、以前に狩った獲物を物知りな狼に分け与えた。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '満足そうにうなずいた物知りな狼は答えた。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '「村の外れに、使われていない洞窟が二か所ある。人目につきにくく、狩りには最適だ」',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '「そこは自然も豊かで、獲物も多く、丸々太ってうまそうに見える」とも。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '物知りな狼は続けた。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '「ただし、そこから帰るには"対価"が必要だ。その対価はわしにも分からん」',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '少しの疑念を抱きながらも、二匹の狼は洞窟へ向かった。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '日が沈み、夜が更けるころ、二つの気配が近づいてきた。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '夜闇にまぎれて獲物の全貌は見えない。それでも二匹は息を潜め、洞窟で待ち伏せを続けた。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': 'やがて、二匹の獲物が洞窟に入る。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': 'その瞬間、二匹の狼は獲物をとらえるため、行動を起こした',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': 'しかし、２匹の狼は行動を停止した。狩りの本能も急止した。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '理由は簡単だった、目の前の獲物が、たいそう好みではなかったのだ。端的に言えば——マズそう、だった。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': 'それでも二匹は引けなかった。ここに至るまでに、物知りな狼に対価を払ってしまっていたからだ。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '何も、しないで帰ることは、二匹のプライドが許さなかった。',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '——狩りは終わった。昇る朝日を背に、肩を落とした帰り道に、ぽつりと気のいい狼が言葉をこぼした。',
                'background': 'yuuhiload',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '「あの日、僕らは大人になった」',
                'expression': 'a'
            },
            {
                'character': 'narrator',
                'text': '賢い狼は、それを苦い顔で聞き流した。',
                'expression': 'a'
            }
        ]
    },
    
    // おかがみとの会話
    'okagami_conversation': {
        'background': 'test_1',
        'bgm': 'Fantasy',
        'conversations': [
            {
                'speaker': 'おかがみ',
                'character': 'okagami',
                'text': 'タバコが切れた...',
                'expression': 'c'
            },
            {
                'speaker': 'おかがみ',
                'character': 'okagami',
                'text': '集合！！',
                'expression': 'a'
            },
            {
                'speaker': 'おかがみ',
                'character': 'okagami',
                'text': '釘宮！お前はまじでダメ！やる気が足りない！サボるな！',
                'expression': 'a'
            },
            {
                'speaker': 'おかがみ',
                'character': 'okagami',
                'text': '河室！なんだその髪の毛は桜木花道じゃねえか！',
                'expression': 'a'
            },
            {
                'speaker': 'おかがみ',
                'character': 'okagami',
                'text': 'ボコっ！ (殴る音)',
                'expression': 'a'
            },
            {
                'speaker': '自分',
                'character': 'player',
                'text': '俺らの時代だからまだ許されてる感あるよな....',
                'expression': 'c'
            },
            {
                'speaker': '自分',
                'character': 'player',
                'text': 'まじで痛えな...',
                'expression': 'c'
            }
        ]
    },
    
    // だいちとの会話
    'daichi_conversation': {
        'background': 'test_1',
        'bgm': 'Fantasy',
        'conversations': [
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': '副リーダーとかいうの嫌すぎるな',
                'expression': 'c'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'どっかでサボろうぜ',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'またおかがみに怒られるだけかもだけど...',
                'expression': 'c'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'だいちはいっつも冷めてるよな',
                'expression': 'b'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'まあ、いいやチョロQ持ってきてるからこれで遊ぶぞ',
                'expression': 'a'
            },
            {
                'speaker': 'ひろかず',
                'character': 'hirokazu',
                'text': 'それか、このバス釣りの雑誌みんなで見ようぜ',
                'expression': 'a'
            },
            {
                'speaker': 'だいち',
                'character': 'daichi',
                'text': 'いつもの流れだけど、これが一番楽しいよな笑',
                'expression': 'a'
            }
        ]
    },
};

// 三重町ステージ会話データを管理するクラス
export class MiemachiConversationManager {
    constructor() {
        this.conversations = miemachiConversationData;
        this.currentEvent = null;
        this.resourceManager = null; // リソース管理クラスの参照
    }
    
    // リソース管理クラスを設定
    setResourceManager(resourceManager) {
        this.resourceManager = resourceManager;
    }
    
    // 会話データを取得
    getConversation(eventId) {
        return this.conversations[eventId] || null;
    }
    
    // 利用可能なイベントリストを取得
    getAvailableEvents() {
        return Object.keys(this.conversations);
    }
    
    // マップ読み込み時の処理（基本データのみ、重いリソースは除外）
    async loadMap(mapName = 'miemachi') {
        if (!this.resourceManager) {
            throw new Error('ResourceManager not set');
        }
        
        try {
            console.log(`三重町マップ「${mapName}」を読み込み中...`);
            
            // 基本データのみ読み込み（重いリソースは除外）
            await this.resourceManager.loadMapResources(mapName);
            
            console.log(`三重町マップ「${mapName}」の読み込み完了`);
            return true;
        } catch (error) {
            console.error('マップ読み込みエラー:', error);
            throw error;
        }
    }
    
    // イベント開始（リソース読み込み付き）
    async startEvent(eventId) {
        if (!this.resourceManager) {
            throw new Error('ResourceManager not set');
        }
        
        try {
            // 必要なリソースを読み込み
            await this.resourceManager.loadEventResources(eventId, this.conversations);
            
            // イベントを開始
            this.currentEvent = eventId;
            return true;
        } catch (error) {
            console.error('Failed to start event:', error);
            throw error;
        }
    }
    
    // イベント終了
    endEvent() {
        if (this.resourceManager) {
            this.resourceManager.unloadResources();
        }
        this.currentEvent = null;
    }
    
    // 新しい会話データを追加
    addConversation(eventId, conversationData) {
        this.conversations[eventId] = conversationData;
    }
    
    // 会話データを更新
    updateConversation(eventId, conversationData) {
        if (this.conversations[eventId]) {
            this.conversations[eventId] = conversationData;
            return true;
        }
        return false;
    }
} 