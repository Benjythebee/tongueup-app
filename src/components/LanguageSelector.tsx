import { useTranslation } from 'react-i18next';
import SegmentedControl from './SegmentedControl';
import { AppLanguage, setAppLanguage } from '../localization';

const options: { label: string; value: AppLanguage }[] = [
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const value: AppLanguage = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={setAppLanguage}
    />
  );
};

export default LanguageSelector;
