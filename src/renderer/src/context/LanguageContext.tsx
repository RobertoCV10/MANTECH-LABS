import { createContext, useContext, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

type Language = 'es' | 'en'

interface LanguageContextType {
  language:       Language
  changeLanguage: (lang: Language) => void
  t:              (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language:       'es',
  changeLanguage: () => {},
  t:              (key) => key
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const language = (i18n.language as Language) ?? 'es'

  const changeLanguage = (lang: Language) => {
    localStorage.setItem('language', lang)
    i18n.changeLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)