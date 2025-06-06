
import { View, StyleSheet} from "react-native";
import RollPicker from "./RollPicker";
import { useTranslation } from "react-i18next";

const times = [
    '12am',
    '1am',
    '2am',
    '3am',
    '4am',
    '5am',
    '6am',
    '7am',
    '8am',
    '9am',
    '10am',
    '11am',
    '12pm',
    '1pm',
    '2pm',
    '3pm',
    '4pm',
    '5pm',
    '6pm',
    '7pm',
    '8pm',
    '9pm',
    '10pm',
    '11pm'
] as const

const timeNumberToString = (num: number): typeof times[number] => {
    const hours = num % 12 || 12; // Convert 0 to 12 for 12 AM
    const period = num < 12 ? 'am' : 'pm';
    return `${hours}${period}` as typeof times[number];
}

const stringTo24HourFormat = (time: typeof times[number]): number => {
    const [hour, period] = time.split(/(am|pm)/);
    let hourNumber = parseInt(hour, 10);
    if (period === 'pm' && hourNumber < 12) {
        hourNumber += 12; // Convert PM hours to 24-hour format
    } else if (period === 'am' && hourNumber === 12) {
        hourNumber = 0; // Convert 12 AM to 0 in 24-hour format
    }
    return hourNumber;
}

interface TimeSelectorProps {
    defaultValue?: number // 1-24;
    onTimeChange?: (selectedTime: number) => void;
}


const TimeSelector: React.FC<TimeSelectorProps> = (props:TimeSelectorProps) => {
  const {defaultValue,onTimeChange} = props
  const time = timeNumberToString(defaultValue|| 12);
  const {t} = useTranslation();
  const defaultVal = times.indexOf(time);

  const i18Times = times.map((time) => t(`time.${time}`));

  return (
    <View style={styles.container}>
        <RollPicker
        data={i18Times as any}
        onSelectionChange={(item, index) => {
          onTimeChange && onTimeChange(index);
        }}
        initialSelectedIndex={defaultVal}
        itemHeight={35}
        visibleItems={5}
        style={styles.picker}
        textStyle={styles.pickerText}
        selectedTextStyle={styles.selectedPickerText}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: '#f5f5f5',

    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  picker: {
    // backgroundColor: 'white',
    // borderRadius: 10,
    width: 60,
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

export default TimeSelector;