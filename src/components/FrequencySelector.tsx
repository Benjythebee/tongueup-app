
import RollPicker from "./RollPicker";
import { useTranslation } from "react-i18next";

export const FrequencyToi18n = {
  "Every 15 minutes": "general.label.every15Minutes",
  "Every 30 minutes": "general.label.every30Minutes",
  "Every hour": "general.label.everyHour",
  "Every 2 hours": "general.label.every2Hours",
  "Every 4 hours": "general.label.every4Hours",
  "Every 6 hours": "general.label.every6Hours",
  "Every 12 hours": "general.label.every12Hours",
  Daily: "general.label.daily"
} as const

/**
 * Frequencies in seconds
 */
export const frequencies = {
  "Every 15 minutes": 15 * 60,
  "Every 30 minutes": 30 * 60,
  "Every hour": 60 * 60,
  "Every 2 hours": 2 * 60 * 60,
  "Every 4 hours": 4 * 60 * 60,
  "Every 6 hours": 6 * 60 * 60,
  "Every 12 hours": 12 * 60 * 60,
  Daily: 24 * 60 * 60
};
export const frequencyHoursLimits = {
  "Every 15 minutes": 37, // 37 hours
  "Every 30 minutes": 50, // 50 hours
  "Every hour": 100, // 100 hours
  "Every 2 hours": 200, // 200 hours
  "Every 4 hours": 400,  // 400 hours
  "Every 6 hours": 600, // 600 hours
  "Every 12 hours": 1200, // 1200 hours
  "Daily": 24 * 30, // 30 days (in hours)
};

interface FrequencySelectorProps {
  defaultValue?: number;
  onChange?: (value: number) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = (props) => {
  const { defaultValue, onChange } = props;
  const {t} = useTranslation();

  const data = Object.keys(frequencies).map((key) => {
    return t(FrequencyToi18n[key as keyof typeof FrequencyToi18n])
  })

  return (
    <RollPicker
      data={data}
      onSelectionChange={(_, index) => {
        onChange && onChange(index);
      }}
      initialSelectedIndex={defaultValue ?? 0}
      itemHeight={40}
      visibleItems={3}
    />
  );
};

export default FrequencySelector;
