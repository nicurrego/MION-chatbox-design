
export type LanguageCode = 'en' | 'ja' | 'es' | 'fr';

export interface Translation {
  welcome_title: string;
  welcome_subtitle: string;
  click_start: string;
  voice_on: string;
  voice_off: string;
  skip: string;
  select_language: string;
  
  session_info: string;
  crafting_onsen: string;
  please_wait: string;
  select_concept: string;
  onsen_ready: string;
  finalizing: string;
  profile_pending: string;
  
  chat_placeholder: string;
  thinking: string;
  type_message: string;
  
  btn_chat: string;
  btn_voice: string;
  btn_mute: string;
  btn_unmute: string;
  btn_read_aloud: string;
  btn_stop_audio: string;
  btn_close: string;
  btn_subtitles_hide: string;
  btn_subtitles_show: string;

  voice_listening: string;
  voice_hint: string;

  error_api: string;
  error_video: string;
  
  // The locale code for Web Speech API
  stt_locale: string;
  // The natural name of the language for the AI prompt
  ai_lang_name: string;
}

export const translations: Record<LanguageCode, Translation> = {
  en: {
    welcome_title: "TALK TO MION",
    welcome_subtitle: "a MION experience",
    click_start: "- click to start -",
    voice_on: "VOICE: ON",
    voice_off: "VOICE: OFF",
    skip: "SKIP",
    select_language: "Language / 言語",

    session_info: "SESSION INFO",
    crafting_onsen: "Crafting your onsen...",
    please_wait: "Please wait a moment.",
    select_concept: "Please select a concept:",
    onsen_ready: "Your unique onsen experience is ready. Enjoy the moment.",
    finalizing: "Finalizing your onsen experience...",
    profile_pending: "Your onsen profile will appear here once created.",

    chat_placeholder: "Type your message here...",
    thinking: "Mion is thinking...",
    type_message: "...",

    btn_chat: "CHAT",
    btn_voice: "Send a voice message",
    btn_mute: "Mute",
    btn_unmute: "Unmute",
    btn_read_aloud: "Read aloud",
    btn_stop_audio: "Stop audio",
    btn_close: "Close chat",
    btn_subtitles_hide: "Hide subtitles",
    btn_subtitles_show: "Show subtitles",

    voice_listening: "Listening...",
    voice_hint: "Click here to type, or press the mic again.",

    error_api: "API configuration error: API_KEY is missing.",
    error_video: "Sorry, we couldn't create the video experience. Please try selecting a concept again.",

    stt_locale: 'en-US',
    ai_lang_name: 'English'
  },
  ja: {
    welcome_title: "MIONと話す",
    welcome_subtitle: "MION エクスペリエンス",
    click_start: "- クリックして開始 -",
    voice_on: "音声: ON",
    voice_off: "音声: OFF",
    skip: "スキップ",
    select_language: "言語 / Language",

    session_info: "セッション情報",
    crafting_onsen: "温泉を作成中...",
    please_wait: "少々お待ちください。",
    select_concept: "コンセプトを選択してください:",
    onsen_ready: "あなただけの温泉体験の準備ができました。ごゆっくりどうぞ。",
    finalizing: "温泉体験を仕上げています...",
    profile_pending: "温泉プロフィールは作成後にここに表示されます。",

    chat_placeholder: "メッセージを入力...",
    thinking: "Mionが考え中...",
    type_message: "...",

    btn_chat: "チャット",
    btn_voice: "音声メッセージを送信",
    btn_mute: "ミュート",
    btn_unmute: "ミュート解除",
    btn_read_aloud: "読み上げ",
    btn_stop_audio: "停止",
    btn_close: "閉じる",
    btn_subtitles_hide: "字幕を隠す",
    btn_subtitles_show: "字幕を表示",

    voice_listening: "聞き取り中...",
    voice_hint: "クリックして入力、またはマイクをもう一度押してください。",

    error_api: "API設定エラー: API_KEYが見つかりません。",
    error_video: "申し訳ありません。ビデオ体験を作成できませんでした。もう一度コンセプトを選択してください。",

    stt_locale: 'ja-JP',
    ai_lang_name: 'Japanese'
  },
  es: {
    welcome_title: "HABLA CON MION",
    welcome_subtitle: "una experiencia MION",
    click_start: "- clic para iniciar -",
    voice_on: "VOZ: ON",
    voice_off: "VOZ: OFF",
    skip: "SALTAR",
    select_language: "Idioma",

    session_info: "INFO SESIÓN",
    crafting_onsen: "Diseñando tu onsen...",
    please_wait: "Por favor espera un momento.",
    select_concept: "Por favor selecciona un concepto:",
    onsen_ready: "Tu experiencia onsen única está lista. Disfruta el momento.",
    finalizing: "Finalizando tu experiencia...",
    profile_pending: "Tu perfil onsen aparecerá aquí una vez creado.",

    chat_placeholder: "Escribe tu mensaje aquí...",
    thinking: "Mion está pensando...",
    type_message: "...",

    btn_chat: "CHAT",
    btn_voice: "Enviar mensaje de voz",
    btn_mute: "Silenciar",
    btn_unmute: "Activar sonido",
    btn_read_aloud: "Leer en voz alta",
    btn_stop_audio: "Detener audio",
    btn_close: "Cerrar chat",
    btn_subtitles_hide: "Ocultar subtítulos",
    btn_subtitles_show: "Mostrar subtítulos",

    voice_listening: "Escuchando...",
    voice_hint: "Clic aquí para escribir, o presiona el micro de nuevo.",

    error_api: "Error de configuración API: falta API_KEY.",
    error_video: "Lo siento, no pudimos crear el video. Por favor intenta seleccionar un concepto de nuevo.",

    stt_locale: 'es-ES',
    ai_lang_name: 'Spanish'
  },
  fr: {
    welcome_title: "PARLEZ À MION",
    welcome_subtitle: "une expérience MION",
    click_start: "- cliquer pour commencer -",
    voice_on: "VOIX: ON",
    voice_off: "VOIX: OFF",
    skip: "PASSER",
    select_language: "Langue",

    session_info: "INFO SESSION",
    crafting_onsen: "Création de votre onsen...",
    please_wait: "Veuillez patienter un instant.",
    select_concept: "Veuillez sélectionner un concept :",
    onsen_ready: "Votre expérience onsen unique est prête. Profitez de l'instant.",
    finalizing: "Finalisation de votre expérience...",
    profile_pending: "Votre profil onsen apparaîtra ici une fois créé.",

    chat_placeholder: "Tapez votre message ici...",
    thinking: "Mion réfléchit...",
    type_message: "...",

    btn_chat: "CHAT",
    btn_voice: "Envoyer un message vocal",
    btn_mute: "Muet",
    btn_unmute: "Son",
    btn_read_aloud: "Lire à haute voix",
    btn_stop_audio: "Arrêter l'audio",
    btn_close: "Fermer le chat",
    btn_subtitles_hide: "Masquer sous-titres",
    btn_subtitles_show: "Afficher sous-titres",

    voice_listening: "Écoute...",
    voice_hint: "Cliquez pour écrire ou appuyez à nouveau sur le micro.",

    error_api: "Erreur API : API_KEY manquante.",
    error_video: "Désolé, nous n'avons pas pu créer la vidéo. Veuillez réessayer de sélectionner un concept.",

    stt_locale: 'fr-FR',
    ai_lang_name: 'French'
  }
};
