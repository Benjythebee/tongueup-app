import { useTranslation } from 'react-i18next';
import SegmentedControl from './SegmentedControl';

type Language = 'en' | 'fr';

const options: { label: string; value: Language }[] = [
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const value: Language = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={(lang) => i18n.changeLanguage(lang)}
    />
  );
};

export default LanguageSelector;
