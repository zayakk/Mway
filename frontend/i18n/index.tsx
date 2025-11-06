import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Lang = 'mn' | 'en';

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  mn: {
    'home.title': 'Хотоос хот руу',
    'home.subtitle': 'Автобусны тасалбараа хайж захиалаарай',
    'home.fromCity': 'Эхлэх хот',
    'home.fromStation': 'Эхлэх буудал',
    'home.toCity': 'Очих хот',
    'home.toStation': 'Очих буудал',
    'home.date': 'Огноо (ЖЖЖЖ-СС-ӨӨ)',
    'home.search': 'Хайх',
    'seats.title': 'Суудал сонгох',
    'seats.legend.available': 'Чөлөөтэй',
    'seats.legend.selected': 'Сонгосон',
    'seats.legend.reserved': 'Зарагдсан',
    'seats.continue': 'Үргэлжлүүлэх',
    'seats.limit': 'Та хамгийн ихдээ {n} суудал сонгоно.',
    'seats.pickOne': 'Дор хаяж нэг суудал сонгоно уу.',
  },
  en: {
    'home.title': 'Intercity Bus',
    'home.subtitle': 'Find and book your seat',
    'home.fromCity': 'From city',
    'home.fromStation': 'From station',
    'home.toCity': 'To city',
    'home.toStation': 'To station',
    'home.date': 'Date (YYYY-MM-DD)',
    'home.search': 'Search',
    'seats.title': 'Select seats',
    'seats.legend.available': 'Available',
    'seats.legend.selected': 'Selected',
    'seats.legend.reserved': 'Sold',
    'seats.continue': 'Continue',
    'seats.limit': 'You can select at most {n} seats.',
    'seats.pickOne': 'Please select at least one seat.',
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('mn');
  useEffect(() => {
    AsyncStorage.getItem('lang').then((v) => {
      if (v === 'mn' || v === 'en') setLangState(v);
    });
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem('lang', l).catch(() => {});
  };
  const t = (key: string, vars?: Record<string, string | number>) => {
    const dict = translations[lang] || translations.mn;
    let value = dict[key] || key;
    if (vars) {
      for (const k of Object.keys(vars)) {
        value = value.replace(`{${k}}`, String(vars[k]));
      }
    }
    return value;
  };
  const value = useMemo(() => ({ lang, setLang, t }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


