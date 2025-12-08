import React, { useState, useEffect } from 'react';
import ConfirmationButtons from './ConfirmationButtons';
import type { OnsenPreferences } from '../services';
import { useLanguage } from '../contexts/LanguageContext';
import type { SupportedLanguage } from '../contexts/LanguageContext';

interface InfoBoxProps {
  isGeneratingImage: boolean;
  generatedImageUrls: string[] | null;
  onConceptSelect: (url: string) => void;
  isConceptSelected: boolean;
  generatedVideoUrl: string | null;
  isGeneratingVideo: boolean;
  onsenDescription: string | null;
  showConfirmation: boolean;
  onConfirm: () => void;
  onReject: () => void;
  userPreferences: OnsenPreferences | null;
}

// Translations for InfoBox UI
const translations: Record<SupportedLanguage, {
  sessionInfo: string;
  yourOnsenProfile: string;
  wellbeingProfile: string;
  aestheticProfile: string;
  skinType: string;
  muscleSoreness: string;
  stressLevel: string;
  waterTemperature: string;
  healthGoals: string;
  atmosphere: string;
  colorPalette: string;
  timeOfDay: string;
  craftingOnsen: string;
  pleaseWait: string;
  creatingExperience: string;
  preparingSanctuary: string;
  experienceReady: string;
  finalizingExperience: string;
  profileWillAppear: string;
}> = {
  en: {
    sessionInfo: 'SESSION INFO',
    yourOnsenProfile: 'Your Onsen Profile',
    wellbeingProfile: 'Well-being Profile',
    aestheticProfile: 'Aesthetic Profile',
    skinType: 'Skin Type',
    muscleSoreness: 'Muscle Soreness',
    stressLevel: 'Stress Level',
    waterTemperature: 'Water Temperature',
    healthGoals: 'Health Goals',
    atmosphere: 'Atmosphere',
    colorPalette: 'Color Palette',
    timeOfDay: 'Time of Day',
    craftingOnsen: 'Crafting your onsen...',
    pleaseWait: 'Please wait a moment.',
    creatingExperience: 'Creating Your Experience...',
    preparingSanctuary: 'Preparing your personalized onsen sanctuary...',
    experienceReady: 'Your unique onsen experience is ready. Enjoy the moment.',
    finalizingExperience: 'Finalizing your onsen experience...',
    profileWillAppear: 'Your onsen profile will appear here once created.',
  },
  es: {
    sessionInfo: 'INFO DE SESIÓN',
    yourOnsenProfile: 'Tu Perfil de Onsen',
    wellbeingProfile: 'Perfil de Bienestar',
    aestheticProfile: 'Perfil Estético',
    skinType: 'Tipo de Piel',
    muscleSoreness: 'Dolor Muscular',
    stressLevel: 'Nivel de Estrés',
    waterTemperature: 'Temperatura del Agua',
    healthGoals: 'Objetivos de Salud',
    atmosphere: 'Atmósfera',
    colorPalette: 'Paleta de Colores',
    timeOfDay: 'Momento del Día',
    craftingOnsen: 'Creando tu onsen...',
    pleaseWait: 'Por favor espera un momento.',
    creatingExperience: 'Creando Tu Experiencia...',
    preparingSanctuary: 'Preparando tu santuario onsen personalizado...',
    experienceReady: 'Tu experiencia onsen única está lista. Disfruta el momento.',
    finalizingExperience: 'Finalizando tu experiencia onsen...',
    profileWillAppear: 'Tu perfil de onsen aparecerá aquí una vez creado.',
  },
  ja: {
    sessionInfo: 'セッション情報',
    yourOnsenProfile: 'あなたの温泉プロフィール',
    wellbeingProfile: 'ウェルビーイングプロフィール',
    aestheticProfile: '美的プロフィール',
    skinType: '肌タイプ',
    muscleSoreness: '筋肉痛',
    stressLevel: 'ストレスレベル',
    waterTemperature: '水温',
    healthGoals: '健康目標',
    atmosphere: '雰囲気',
    colorPalette: 'カラーパレット',
    timeOfDay: '時間帯',
    craftingOnsen: '温泉を作成中...',
    pleaseWait: '少々お待ちください。',
    creatingExperience: '体験を作成中...',
    preparingSanctuary: 'あなた専用の温泉を準備中...',
    experienceReady: 'あなた専用の温泉体験の準備が整いました。お楽しみください。',
    finalizingExperience: '温泉体験を仕上げ中...',
    profileWillAppear: '温泉プロフィールは作成後にここに表示されます。',
  },
  ko: {
    sessionInfo: '세션 정보',
    yourOnsenProfile: '당신의 온천 프로필',
    wellbeingProfile: '웰빙 프로필',
    aestheticProfile: '미적 프로필',
    skinType: '피부 타입',
    muscleSoreness: '근육통',
    stressLevel: '스트레스 수준',
    waterTemperature: '수온',
    healthGoals: '건강 목표',
    atmosphere: '분위기',
    colorPalette: '색상 팔레트',
    timeOfDay: '시간대',
    craftingOnsen: '온천 제작 중...',
    pleaseWait: '잠시만 기다려 주세요.',
    creatingExperience: '경험 생성 중...',
    preparingSanctuary: '맞춤형 온천을 준비하는 중...',
    experienceReady: '당신만의 온천 경험이 준비되었습니다. 즐기세요.',
    finalizingExperience: '온천 경험을 마무리하는 중...',
    profileWillAppear: '온천 프로필은 생성 후 여기에 표시됩니다.',
  },
  zh: {
    sessionInfo: '会话信息',
    yourOnsenProfile: '您的温泉档案',
    wellbeingProfile: '健康档案',
    aestheticProfile: '美学档案',
    skinType: '皮肤类型',
    muscleSoreness: '肌肉酸痛',
    stressLevel: '压力水平',
    waterTemperature: '水温',
    healthGoals: '健康目标',
    atmosphere: '氛围',
    colorPalette: '色彩搭配',
    timeOfDay: '时间段',
    craftingOnsen: '正在打造您的温泉...',
    pleaseWait: '请稍候。',
    creatingExperience: '正在创建您的体验...',
    preparingSanctuary: '正在准备您的专属温泉...',
    experienceReady: '您的专属温泉体验已准备就绪。尽情享受吧。',
    finalizingExperience: '正在完成您的温泉体验...',
    profileWillAppear: '温泉档案创建后将显示在此处。',
  },
};

const InfoBox: React.FC<InfoBoxProps> = ({
  isGeneratingImage,
  generatedImageUrls,
  onConceptSelect,
  isConceptSelected,
  generatedVideoUrl,
  isGeneratingVideo,
  onsenDescription,
  showConfirmation,
  onConfirm,
  onReject,
  userPreferences
}) => {
  const [time, setTime] = useState(new Date());
  const { selectedLanguage } = useLanguage();

  // Get translations for current language, fallback to English
  const t = translations[selectedLanguage || 'en'];

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Render the title row
  const renderTitle = () => {
    if (isGeneratingImage) {
      return <h2 className="text-2xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2">{t.craftingOnsen}</h2>;
    }
    if (isGeneratingVideo) {
      return <h2 className="text-2xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2 animate-pulse">{t.creatingExperience}</h2>;
    }
    if (showConfirmation && userPreferences) {
      return <h2 className="text-2xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2">{t.yourOnsenProfile}</h2>;
    }
    return <h2 className="text-3xl text-cyan-200 border-b-2 border-cyan-400/50 pb-2">{t.sessionInfo}</h2>;
  };

  // Render the widgets row (time, temperature, buttons, etc.)
  const renderWidgets = () => {
    return (
      <div className="flex justify-between items-end">
        {/* Left side: Confirmation buttons (if waiting for confirmation) */}
        <div className="flex-shrink-0">
          {showConfirmation && (
            <ConfirmationButtons onConfirm={onConfirm} onReject={onReject} compact={true} />
          )}
        </div>

        {/* Right side: Time and Temperature */}
        <div className="text-right">
          <div className="text-5xl md:text-7xl" style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7)' }}>
            {formattedTime}
          </div>
          <div className="text-2xl md:text-3xl text-cyan-200">
            ☀️ 27°
          </div>
        </div>
      </div>
    );
  };

  // Render the middle content row
  const renderContent = () => {
    // Priority 1: Show image generation loading
    if (isGeneratingImage) {
      return (
        <div className="flex-1 flex items-center justify-center text-white animate-pulse">
          <div className="text-lg text-cyan-200">{t.pleaseWait}</div>
        </div>
      );
    }

    // Priority 2: Show video generation loading (NO description)
    if (isGeneratingVideo) {
      return (
        <div className="flex-1 flex items-center justify-center text-white animate-pulse">
          <div className="text-lg text-cyan-200">{t.preparingSanctuary}</div>
        </div>
      );
    }

    // Priority 3: Show image selection (FULL HEIGHT - no three-row structure)
    if (generatedImageUrls && generatedImageUrls.length > 0 && !isConceptSelected) {
      return (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {generatedImageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => onConceptSelect(url)}
              className="relative w-full flex-1 min-h-0 overflow-hidden rounded-lg group focus:outline-none focus:ring-4 focus:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 hover:ring-2 hover:ring-cyan-400/50"
              aria-label={`Select onsen concept variation ${index + 1}`}
            >
              <img
                src={url}
                alt={`Onsen concept variation ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 px-4 py-2 rounded-full">
                  Concept {index + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      );
    }

    // Priority 4: Show user profile if waiting for confirmation
    if (showConfirmation && userPreferences) {
      return (
        <div className="flex-1 flex flex-col text-white overflow-y-auto">
          {/* User Profile Display */}
          <div className="mb-4">
            {/* Well-being Profile */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">{t.wellbeingProfile}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-cyan-200">{t.skinType}:</span> {userPreferences.wellbeingProfile.skinType}</p>
                <p><span className="text-cyan-200">{t.muscleSoreness}:</span> {userPreferences.wellbeingProfile.muscleSoreness}</p>
                <p><span className="text-cyan-200">{t.stressLevel}:</span> {userPreferences.wellbeingProfile.stressLevel}</p>
                <p><span className="text-cyan-200">{t.waterTemperature}:</span> {userPreferences.wellbeingProfile.waterTemperature}</p>
                <p><span className="text-cyan-200">{t.healthGoals}:</span> {userPreferences.wellbeingProfile.healthGoals}</p>
              </div>
            </div>

            {/* Aesthetic Profile */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">{t.aestheticProfile}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-cyan-200">{t.atmosphere}:</span> {userPreferences.aestheticProfile.atmosphere}</p>
                <p><span className="text-cyan-200">{t.colorPalette}:</span> {userPreferences.aestheticProfile.colorPalette}</p>
                <p><span className="text-cyan-200">{t.timeOfDay}:</span> {userPreferences.aestheticProfile.timeOfDay}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Priority 5: Default session info
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <p className="text-lg text-white/80 italic text-center">
          {generatedVideoUrl
            ? t.experienceReady
            : isConceptSelected
            ? t.finalizingExperience
            : t.profileWillAppear
          }
        </p>
      </div>
    );
  };


  // Special case: Image selection takes full height (no three-row structure)
  if (generatedImageUrls && generatedImageUrls.length > 0 && !isConceptSelected) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-sm rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-6 flex flex-col text-white h-full transition-all duration-500">
        <style>{`
          @keyframes fadeInImage {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeInImage {
              animation: fadeInImage 1s ease-in-out forwards;
          }
        `}</style>
        {renderContent()}
      </div>
    );
  }

  // Three-row structure: Title | Content | Widgets
  return (
    <div className="bg-slate-900/30 backdrop-blur-sm rounded-lg border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20 p-6 flex flex-col text-white h-full transition-all duration-500">
      <style>{`
        @keyframes fadeInImage {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInImage {
            animation: fadeInImage 1s ease-in-out forwards;
        }
      `}</style>

      {/* Top Row: Title */}
      <div className="mb-4">
        {renderTitle()}
      </div>

      {/* Middle Row: Content */}
      {renderContent()}

      {/* Bottom Row: Widgets */}
      <div className="mt-auto pt-4">
        {renderWidgets()}
      </div>
    </div>
  );
};

export default InfoBox;