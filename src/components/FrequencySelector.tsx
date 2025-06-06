
import { View, Text, StyleSheet} from "react-native";
import RollPicker from "./RollPicker";
import { useTheme } from "../context/ThemeContext";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const FrequencyToi18n = {
  "Every 1 minute": "general.label.every1Minutes",
  "Every 2 minutes": "general.label.every2Minutes",
  "Every 15 minutes": "general.label.every15Minutes",
  "Every 30 minutes": "general.label.every30Minutes",
  "Every hour": "general.label.everyHour",
  "Every 2 hours": "general.label.every2Hours",
  "Every 4 hours": "general.label.every4Hours",
  "Every 6 hours": "general.label.every6Hours",
  "Every 12 hours": "general.label.every12Hours",
  Daily: "general.label.daily",
  Weekly: "general.label.weekly",
  Monthly: "general.label.monthly",
} as const

export const frequencies = {
  "Every 1 minute": 1 * 60,
  "Every 2 minutes": 2 * 60,
  "Every 15 minutes": 15 * 60,
  "Every 30 minutes": 30 * 60,
  "Every hour": 60 * 60,
  "Every 2 hours": 2 * 60 * 60,
  "Every 4 hours": 4 * 60 * 60,
  "Every 6 hours": 6 * 60 * 60,
  "Every 12 hours": 12 * 60 * 60,
  Daily: 24 * 60 * 60,
  Weekly: 7 * 24 * 60 * 60,
  Monthly: 30 * 24 * 60 * 60,
};
export const frequencyHoursLimits = {
  "Every 1 minute": 37, // 37 hours
  "Every 2 minutes": 37, // 37 hours
  "Every 15 minutes": 37, // 37 hours
  "Every 30 minutes": 50, // 50 hours
  "Every hour": 100, // 100 hours
  "Every 2 hours": 200, // 200 hours
  "Every 4 hours": 400,  // 400 hours
  "Every 6 hours": 600, // 600 hours
  "Every 12 hours": 1200, // 1200 hours
  "Daily": 24 * 30, // 30 days (in hours)
  "Weekly": 7 * 24 * 6, // 6 weeks (in hours)
  "Monthly": 24 * 30 * 3, //  3 months (in hours)
};

interface FrequencySelectorProps {
  defaultValue?: number;
  onChange?: (value: number) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = (props) => {
  const { defaultValue, onChange } = props;
  const {t} = useTranslation();
  const {colors} = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const data = Object.keys(frequencies).map((key) => {
    return t(FrequencyToi18n[key as keyof typeof FrequencyToi18n])
  })

  return (
    <View style={styles.container}>

       <View style={{gap:2, flex:1, flexDirection:'row', alignContent:'center', alignItems:'center'}}>
          <Text style={styles.text} >{t("general.label.RemindMe")}:</Text> 
          <RollPicker
            data={data}
            onSelectionChange={(_, index) => {
              onChange && onChange(index);
            }}
            initialSelectedIndex={defaultValue ?? 0}
            itemHeight={30}
            visibleItems={5}
            style={styles.picker}
            // textStyle={styles.pickerText}
            selectedTextStyle={styles.selectedPickerText}
          />
       </View>
    </View>
  );
};

const createStyles =(colors:any)=> StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
      text: {
      color: colors.text,
      fontSize: 18,
    },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  selectedText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  picker: {
    // backgroundColor: 'white',
    borderRadius: 10,
    width: 200,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 1,
  },
  pickerText: {
    fontSize: 16,
    color: '#666',
  },
  selectedPickerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default FrequencySelector;