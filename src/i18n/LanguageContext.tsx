import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations } from './types';
import { TRANSLATIONS, ROOM_TRANSLATIONS, CATEGORY_TRANSLATIONS } from './translations';
import { Room, CategoryDefinition } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  getRoomName: (room: Room) => string;
  getRoomDesc: (room: Room) => string;
  getCategoryName: (category: CategoryDefinition | string) => string;
  translateRoom: (room: Room) => Room;
  translateCategory: (category: CategoryDefinition) => CategoryDefinition;
}

const STORAGE_KEY = 'spremljene_stvari_lang';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hr') return saved;
    } catch (e) {
      console.warn('Cannot read language from localStorage:', e);
    }
    return 'hr';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch (e) {
      console.warn('Cannot save language to localStorage:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = TRANSLATIONS[language];

  const getRoomName = (room: Room): string => {
    const translation = ROOM_TRANSLATIONS[room.id];
    if (translation && translation[language]) {
      return translation[language].name;
    }
    return room.name;
  };

  const getRoomDesc = (room: Room): string => {
    const translation = ROOM_TRANSLATIONS[room.id];
    if (translation && translation[language]) {
      return translation[language].desc;
    }
    return room.description;
  };

  const getCategoryName = (category: CategoryDefinition | string): string => {
    const id = typeof category === 'string' ? category : category.id;
    const catName = typeof category === 'string' ? category : category.name;

    // Check by id first
    if (CATEGORY_TRANSLATIONS[id] && CATEGORY_TRANSLATIONS[id][language]) {
      return CATEGORY_TRANSLATIONS[id][language];
    }

    // Check if catName matches any known category HR/EN name
    for (const [key, mapping] of Object.entries(CATEGORY_TRANSLATIONS)) {
      if (mapping.hr.toLowerCase() === catName.toLowerCase() || mapping.en.toLowerCase() === catName.toLowerCase()) {
        return mapping[language];
      }
    }

    return catName;
  };

  const translateRoom = (room: Room): Room => {
    return {
      ...room,
      name: getRoomName(room),
      description: getRoomDesc(room),
    };
  };

  const translateCategory = (cat: CategoryDefinition): CategoryDefinition => {
    return {
      ...cat,
      name: getCategoryName(cat),
    };
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getRoomName,
        getRoomDesc,
        getCategoryName,
        translateRoom,
        translateCategory,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
