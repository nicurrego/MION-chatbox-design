/**
 * ============================================================================
 * MION Onsen Concierge - Mock Service (Development Mode)
 * ============================================================================
 *
 * This service provides mock data for development without using the Gemini API:
 * - Pre-scripted conversation responses
 * - Static audio file (duck_sound.mp3)
 * - Pre-generated images (cp_purple_green_bath.png, cp_sunlight.png)
 * - Pre-generated videos (cp_pg_video.mp4, cp_sunlight_video.mp4)
 */

import type { OnsenPreferences } from './geminiService';

// ============================================================================
// MOCK DATA
// ============================================================================

// Store mapping of image base64 to video URL
const imageToVideoMap = new Map<string, string>();

// Mock responses in different languages
const MOCK_RESPONSES_BY_LANGUAGE: Record<string, string[]> = {
  'en-US': [
    "Konnichiwa, welcome. I am MION, your personal onsen concierge. My purpose is to help you create the perfect hot spring experience to soothe your body and mind. Let me ask you a few questions to understand your needs better. First, could you tell me about your skin type and if you have any muscle soreness?",
    "Thank you for sharing. Now, what is your current stress level, and what water temperature do you prefer? Also, do you have any specific health goals like relaxation or improving circulation?",
    "Perfect! Now for the aesthetic preferences. What kind of atmosphere and color palette appeals to you? And what time of day would you prefer for your onsen experience?",
    "Thank you for sharing all that information. Based on your preferences, here is your personalized onsen profile:\n\nWell-being Profile:\n- Skin type: Sensitive\n- Muscle soreness: Shoulders and neck\n- Stress level: Moderate\n- Water temperature: Warm (38-39°C)\n- Health goals: Relaxation and stress relief\n\nAesthetic Profile:\n- Atmosphere: Serene natural outdoor setting\n- Color palette: Warm sunset tones with purple accents\n- Time of day: Golden hour\n\n[PREFERENCES_START]\nskinType: sensitive\nmuscleSoreness: shoulders and neck\nstressLevel: moderate\nwaterTemperature: warm\nhealthGoals: relaxation and stress relief\natmosphere: serene natural outdoor setting\ncolorPalette: warm sunset tones with purple accents\ntimeOfDay: golden hour\n[PREFERENCES_END]\n\nWould you like to proceed with creating your onsen experience based on these preferences?",
    "Perfect! Let me prepare your personalized onsen experience. This will just take a moment..."
  ],
  'es-ES': [
    "Konnichiwa, bienvenido. Soy MION, tu conserje personal de onsen. Mi propósito es ayudarte a crear la experiencia perfecta de aguas termales para calmar tu cuerpo y mente. Déjame hacerte algunas preguntas para entender mejor tus necesidades. Primero, ¿podrías decirme sobre tu tipo de piel y si tienes algún dolor muscular?",
    "Gracias por compartir. Ahora, ¿cuál es tu nivel de estrés actual y qué temperatura de agua prefieres? Además, ¿tienes algún objetivo de salud específico como relajación o mejorar la circulación?",
    "¡Perfecto! Ahora para las preferencias estéticas. ¿Qué tipo de atmósfera y paleta de colores te atrae? ¿Y qué momento del día preferirías para tu experiencia de onsen?",
    "Gracias por compartir toda esa información. Basándome en tus preferencias, aquí está tu perfil personalizado de onsen:\n\nPerfil de Bienestar:\n- Tipo de piel: Sensible\n- Dolor muscular: Hombros y cuello\n- Nivel de estrés: Moderado\n- Temperatura del agua: Tibia (38-39°C)\n- Objetivos de salud: Relajación y alivio del estrés\n\nPerfil Estético:\n- Atmósfera: Entorno natural sereno al aire libre\n- Paleta de colores: Tonos cálidos de atardecer con acentos púrpura\n- Momento del día: Hora dorada\n\n[PREFERENCES_START]\nskinType: sensitive\nmuscleSoreness: shoulders and neck\nstressLevel: moderate\nwaterTemperature: warm\nhealthGoals: relaxation and stress relief\natmosphere: serene natural outdoor setting\ncolorPalette: warm sunset tones with purple accents\ntimeOfDay: golden hour\n[PREFERENCES_END]\n\n¿Te gustaría proceder con la creación de tu experiencia de onsen basada en estas preferencias?",
    "¡Perfecto! Déjame preparar tu experiencia personalizada de onsen. Esto solo tomará un momento..."
  ],
  'ja-JP': [
    "やあ、ニコラス！ あなたがこの2か月間、準備してきたプレゼンテーションの真っ最中ですね！ 順調ですか？",
    "もしよろしければ、あなたにぴったりの温泉をご用意させてください！",
    "スキャンをする間、簡単にアプリを説明しましょうか。",
    `では説明します。画面には4つの要素があります：

🎭 **私、「ミオン」** - あなたの頼もしい仲間です HAHA～

📊 **インフォボックス** - 重要な情報やグラフを表示します

🎛️ **操作ボタン** - 音声ON/OFF、字幕、言語変更や生成画像、動画のダウンロードメニュー、音声入力

💬 **チャット** - 会話用のエリアです

おっと！お待たせしました。スキャンが終了しました！ 
皮膚炎の症状も以前より緩和傾向にあります。

また、現在のあなたの状態に合わせて、皮膚の免疫バランスを整える油分を含んだ温泉を準備します。

**スキャンしたあなたのプロフィール：**

• 肌タイプ：乾燥肌

• 筋肉の痛み：足筋肉痛

• ストレスレベル：高い

• 水温：熱め

• 健康目標：疲労回復

• 雰囲気：コロンビアの山の中

• カラーパレット：緑

• 時間帯：夕暮れ時。

[PREFERENCES_START]
skinType: 乾燥肌
muscleSoreness: 足筋肉痛
stressLevel: 高い
waterTemperature: 熱め
healthGoals: 疲労回復
atmosphere: コロンビアの山
colorPalette: 緑
timeOfDay: 夕暮れ時
[PREFERENCES_END]

この設定で良かったら、温泉のイメージを用意しますのでご確認ください。`,
  ],
  'ko-KR': [
    "안녕하세요, 환영합니다. 저는 MION, 당신의 개인 온천 컨시어지입니다. 몸과 마음을 달래는 완벽한 온천 경험을 만들어 드리는 것이 제 목적입니다. 먼저 몇 가지 질문을 드려 당신의 필요를 더 잘 이해하고 싶습니다. 먼저 피부 타입과 근육통이 있는지 말씀해 주시겠어요?",
    "공유해 주셔서 감사합니다. 이제 현재 스트레스 수준과 선호하는 물 온도는 어떻게 되나요? 또한 이완이나 혈액 순환 개선과 같은 특정 건강 목표가 있으신가요?",
    "완벽합니다! 이제 미적 선호도에 대해 알아볼게요. 어떤 분위기와 색상 팔레트가 마음에 드시나요? 그리고 온천 경험을 위해 어떤 시간대를 선호하시나요?",
    "모든 정보를 공유해 주셔서 감사합니다. 당신의 선호도를 바탕으로 개인화된 온천 프로필은 다음과 같습니다:\n\n웰빙 프로필:\n- 피부 타입: 민감성\n- 근육통: 어깨와 목\n- 스트레스 수준: 중간\n- 물 온도: 따뜻함 (38-39°C)\n- 건강 목표: 이완 및 스트레스 해소\n\n미적 프로필:\n- 분위기: 고요한 자연 야외 환경\n- 색상 팔레트: 보라색 악센트가 있는 따뜻한 석양 톤\n- 시간대: 골든 아워\n\n[PREFERENCES_START]\nskinType: sensitive\nmuscleSoreness: shoulders and neck\nstressLevel: moderate\nwaterTemperature: warm\nhealthGoals: relaxation and stress relief\natmosphere: serene natural outdoor setting\ncolorPalette: warm sunset tones with purple accents\ntimeOfDay: golden hour\n[PREFERENCES_END]\n\n이 설정으로 온천 경험을 만들어도 될까요?",
    "완벽합니다! 개인화된 온천 경험을 준비하겠습니다. 잠시만 기다려 주세요..."
  ],
  'zh-CN': [
    "你好，欢迎。我是MION，您的私人温泉礼宾员。我的目的是帮助您创造完美的温泉体验，以舒缓您的身心。让我问您几个问题，以更好地了解您的需求。首先，您能告诉我您的皮肤类型以及是否有任何肌肉酸痛吗？",
    "感谢您的分享。现在，您目前的压力水平如何，您喜欢什么水温？此外，您是否有任何特定的健康目标，如放松或改善血液循环？",
    "完美！现在来了解美学偏好。您喜欢什么样的氛围和色彩搭配？您希望在一天中的什么时间享受温泉体验？",
    "感谢您分享所有这些信息。根据您的偏好，这是您的个性化温泉档案：\n\n健康档案：\n- 皮肤类型：敏感\n- 肌肉酸痛：肩膀和颈部\n- 压力水平：中等\n- 水温：温暖（38-39°C）\n- 健康目标：放松和缓解压力\n\n美学档案：\n- 氛围：宁静的自然户外环境\n- 色彩搭配：带紫色点缀的温暖日落色调\n- 时间：黄金时刻\n\n[PREFERENCES_START]\nskinType: sensitive\nmuscleSoreness: shoulders and neck\nstressLevel: moderate\nwaterTemperature: warm\nhealthGoals: relaxation and stress relief\natmosphere: serene natural outdoor setting\ncolorPalette: warm sunset tones with purple accents\ntimeOfDay: golden hour\n[PREFERENCES_END]\n\n您想根据这些偏好继续创建温泉体验吗？",
    "完美！让我为您准备个性化的温泉体验。这只需要一会儿..."
  ],
};

// Current language for mock responses
let currentMockLanguage = 'en-US';
let responseIndex = 0;
let lastAudioIndex = -1; // Track which audio was last used

export const setMockLanguage = (languageCode: string) => {
  currentMockLanguage = languageCode;
  responseIndex = 0; // Reset response index when language changes
  lastAudioIndex = -1; // Reset audio index
};

// ============================================================================
// HELPER: Convert file to base64
// ============================================================================

const fileToBase64 = async (filePath: string): Promise<string> => {
  try {
    const response = await fetch(filePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64," or "data:image/png;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting file to base64:', error);
    return '';
  }
};

// ============================================================================
// 1. MOCK CHAT CONVERSATION
// ============================================================================

export const sendMessageToBot = async (message: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const responses = MOCK_RESPONSES_BY_LANGUAGE[currentMockLanguage] || MOCK_RESPONSES_BY_LANGUAGE['en-US'];
  const response = responses[responseIndex];

  // Track the audio index BEFORE incrementing responseIndex
  lastAudioIndex = responseIndex;
  responseIndex = Math.min(responseIndex + 1, responses.length - 1);

  return response;
};

// ============================================================================
// 2. MOCK TEXT-TO-SPEECH
// ============================================================================

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!text.trim()) {
    return null;
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // For Japanese language, use audio0-audio4 based on the last message index
  if (currentMockLanguage === 'ja-JP') {
    // Check if this is the description audio (contains the description text from line 211)
    const isDescriptionAudio = text.includes('天然の油分') || text.includes('豊富温泉');

    let audioIndex = lastAudioIndex;

    // If this is the description audio and we haven't reached audio4 yet, increment to audio4
    if (isDescriptionAudio && lastAudioIndex < 4) {
      audioIndex = 4; // Use audio4 for description
    } else {
      // Otherwise use the current lastAudioIndex, capped at 4
      audioIndex = Math.min(Math.max(lastAudioIndex, 0), 4);
    }

    return `MOCK_MP3:/audio/audio${audioIndex}.mp3`;
  }

  // For other languages, use duck_sound as fallback
  return 'MOCK_MP3:/audio/duck_sound.mp3';
};

// ============================================================================
// 2.5. MOCK ONSEN DESCRIPTION GENERATION
// ============================================================================

export const generateOnsenDescription = async (preferences: OnsenPreferences): Promise<string | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('🦆 [MOCK] Generating onsen description with preferences:', preferences);

  const mockDescriptions: Record<string, string> = {
    'en-US': `Your personalized onsen sanctuary awaits. Nestled in a ${preferences.aestheticProfile.atmosphere} setting, the waters shimmer with ${preferences.aestheticProfile.colorPalette} hues as ${preferences.aestheticProfile.timeOfDay} light dances across the surface.

The mineral-rich waters, heated to ${preferences.wellbeingProfile.waterTemperature} perfection, are specially formulated for ${preferences.wellbeingProfile.skinType} skin. As you immerse yourself, feel the therapeutic minerals working to ease ${preferences.wellbeingProfile.muscleSoreness}, while the tranquil environment melts away your ${preferences.wellbeingProfile.stressLevel} stress.

This sanctuary is designed with your ${preferences.wellbeingProfile.healthGoals} in mind. The gentle steam carries hints of cedar and minerals, while the soft sounds of water create a meditative atmosphere. Every element has been carefully curated to restore your body and calm your mind.

Take a deep breath. Your journey to wellness begins now.`,

    'es-ES': `Tu santuario onsen personalizado te espera. Ubicado en un entorno ${preferences.aestheticProfile.atmosphere}, las aguas brillan con tonos ${preferences.aestheticProfile.colorPalette} mientras la luz de ${preferences.aestheticProfile.timeOfDay} baila sobre la superficie.

Las aguas ricas en minerales, calentadas a la perfección ${preferences.wellbeingProfile.waterTemperature}, están especialmente formuladas para piel ${preferences.wellbeingProfile.skinType}. Al sumergirte, siente cómo los minerales terapéuticos trabajan para aliviar ${preferences.wellbeingProfile.muscleSoreness}, mientras el ambiente tranquilo derrite tu estrés ${preferences.wellbeingProfile.stressLevel}.

Este santuario está diseñado pensando en ${preferences.wellbeingProfile.healthGoals}. El vapor suave lleva toques de cedro y minerales, mientras los sonidos del agua crean una atmósfera meditativa. Cada elemento ha sido cuidadosamente seleccionado para restaurar tu cuerpo y calmar tu mente.

Respira profundo. Tu viaje hacia el bienestar comienza ahora.`,

    'ja-JP': `承知いたしました。
それでは、仕度が整うまでの間、本日のお湯について説明させていただきます。

世界的に見ても珍しい「天然の油分」を含んだお湯を再現しており、北海道の名湯・豊富温泉と同じ成分で、お肌にとても良いのが特徴です。


最新の研究ではアトピーの治療薬に似た効果も期待されており、天然の油分がお肌をやさしくコーティング、バリア機能を高めて気になる炎症を鎮めてしっとりなめらかな肌に整えてくれます。`,

    'ko-KR': `당신만을 위한 온천 성역이 기다리고 있습니다. ${preferences.aestheticProfile.atmosphere} 환경에 자리잡고 있으며, ${preferences.aestheticProfile.timeOfDay} 빛이 수면 위에서 춤추면서 ${preferences.aestheticProfile.colorPalette} 색조로 물이 반짝입니다.

${preferences.wellbeingProfile.waterTemperature}로 완벽하게 데워진 미네랄이 풍부한 물은 ${preferences.wellbeingProfile.skinType} 피부를 위해 특별히 조제되었습니다. 몸을 담그면 치료 미네랄이 ${preferences.wellbeingProfile.muscleSoreness}를 완화하고, 고요한 환경이 ${preferences.wellbeingProfile.stressLevel} 스트레스를 녹여줍니다.

이 성역은 당신의 ${preferences.wellbeingProfile.healthGoals}를 염두에 두고 설계되었습니다. 부드러운 증기는 삼나무와 미네랄의 향을 전하고, 물의 부드러운 소리가 명상적인 분위기를 만듭니다. 모든 요소가 당신의 몸을 회복시키고 마음을 진정시키기 위해 신중하게 선별되었습니다.

깊게 숨을 쉬세요. 웰니스로의 여정이 지금 시작됩니다.`,

    'zh-CN': `您的专属温泉圣地正在等待。坐落在${preferences.aestheticProfile.atmosphere}的环境中，水面闪烁着${preferences.aestheticProfile.colorPalette}的色调，${preferences.aestheticProfile.timeOfDay}的光线在水面上舞动。

富含矿物质的水被加热到${preferences.wellbeingProfile.waterTemperature}的完美温度，专为${preferences.wellbeingProfile.skinType}肌肤配制。当您沉浸其中时，感受治疗性矿物质缓解${preferences.wellbeingProfile.muscleSoreness}，而宁静的环境融化您的${preferences.wellbeingProfile.stressLevel}压力。

这个圣地是为您的${preferences.wellbeingProfile.healthGoals}而设计的。温柔的蒸汽带着雪松和矿物的气息，而水的柔和声音创造出冥想的氛围。每个元素都经过精心策划，以恢复您的身体并平静您的心灵。

深呼吸。您的健康之旅现在开始。`
  };

  const currentLang = currentMockLanguage || 'en-US';
  return mockDescriptions[currentLang] || mockDescriptions['en-US'];
};

// ============================================================================
// 3. MOCK IMAGE GENERATION
// ============================================================================

export const generateOnsenImage = async (preferences: OnsenPreferences, isMobile: boolean = false): Promise<string[] | null> => {
  // Simulate network delay for image generation
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🦆 [MOCK] Generating images with preferences:', preferences, 'isMobile:', isMobile);

  // Convert the two pre-generated images to base64
  const image1Base64 = await fileToBase64('/images/present1.png');
  const image2Base64 = await fileToBase64('/images/present2.png');

  // Map each image to its corresponding video
  imageToVideoMap.set(image1Base64, '/videos/present_v1.mp4');
  imageToVideoMap.set(image2Base64, '/videos/present_v2.mp4');

  console.log('🦆 [MOCK] Generated 2 images and mapped to videos');

  return [image1Base64, image2Base64];
};

// ============================================================================
// 4. MOCK VIDEO GENERATION
// ============================================================================

// Configurable delay for background change (in milliseconds)
const BACKGROUND_CHANGE_DELAY = 27000; // 20 seconds delay before background changes

export const generateLoopingVideo = async (
  base64Image: string,
  mimeType: string,
  aspectRatio: '9:16' | '16:9' = '9:16'
): Promise<string> => {
  // Simulate network delay for video generation
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('🦆 [MOCK] Generating video for selected image with aspect ratio:', aspectRatio);

  // Look up the video URL from our mapping
  const videoUrl = imageToVideoMap.get(base64Image);

  if (videoUrl) {
    console.log('🦆 [MOCK] Found mapped video:', videoUrl);
  } else {
    console.log('🦆 [MOCK] No mapping found, using default video');
  }

  // Apply the background change delay for mock service
  console.log(`🦆 [MOCK] Delaying background change by ${BACKGROUND_CHANGE_DELAY}ms before returning video URL`);
  await new Promise(resolve => setTimeout(resolve, BACKGROUND_CHANGE_DELAY));

  return videoUrl || '/videos/cp_sunlight_video.mp4';
};

