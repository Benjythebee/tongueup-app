import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Settings } from "../types/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Type definitions
interface TimeSeriesDataPoint {
  t: number; // Timestamp in half-days
  ok: number;
  nok: number;
}

interface TimeSeriesContextType {
  data:TimeSeriesDataPoint[]
  loading: boolean;
    addPoint: (ok?: number, notok?: number) => Promise<void>;
    clearAllData: () => Promise<void>;
    refreshData: () => Promise<void>;
    pointToTimeStamp: (number: number) => Date;
    getDataInRange: (startTime: number, endTime: number) => TimeSeriesDataPoint[];
}

// Default settings
const defaultValues = {
  data:[],
//   data: [{
//     t:40482,
//     ok:5,
//     nok:0
//   },
// {
//     t:40481,
//     ok:2,
//     nok:0
//   },
// {
//     t:40480,
//     ok:5,
//     nok:2
//   },
// {
//     t:40479,
//     ok:1,
//     nok:0
//   }], // Default frequency value
  loading:false
};

// Storage key
const STORAGE_KEY = '@app_tongue_timeseries_data';

// Context
const TimeSeriesContext = createContext<TimeSeriesContextType | undefined>(undefined);

// Provider Props
interface TimeSeriesProviderProps {
  children: ReactNode;
}

// Provider Component
export const SavedDataProvider: React.FC<TimeSeriesProviderProps> = ({ children }) => {
  const [data, setData] = useState<TimeSeriesDataPoint[]>(defaultValues.data);
  const [loading, setLoading] = useState(true);

  const _createBlankPoints = ()=>{
    const now = dateNow();
    const blankPoints: TimeSeriesDataPoint[] = [];
    for (let i = 0; i < 4; i++) { // Create 4 half-day points
      const halfDay = now - i;
      blankPoints.push({ t: halfDay, ok: 0, nok: 0 });
    }
    return blankPoints.sort((a, b) => a.t - b.t)
  }

  const dateNow = ()=>{
    return Math.floor(Date.now() / 1000 / 60 / 60 / 12); // Convert to half-days - one X = one half-day
  }

  const pointToTimeStamp = (number: number): Date => {
    return new Date(number * 1000 * 60 * 60 * 12); // Convert half-days back to milliseconds
  }

  const getDataAt = (halfDay: number): TimeSeriesDataPoint | undefined => {
    return data.find(point => point.t === halfDay);
  }

  const _addEmptyPointsBetween = (dataPoints: TimeSeriesDataPoint[]) => {
    // Say the last point was 2 half days in the past, we need to add 2 empty points
    const now = dateNow();
    const lastPoint = dataPoints[dataPoints.length - 1];
    const emptyPoints: TimeSeriesDataPoint[] = [];
    for (let i = lastPoint.t + 1; i <= now; i++) {
      emptyPoints.push({ t: i, ok: 0, nok: 0 });
    }
    dataPoints.push(...emptyPoints);
    return dataPoints
  }

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        let parsedData: TimeSeriesDataPoint[] = JSON.parse(storedData);
        if(!parsedData || parsedData.length==0){
          parsedData = _createBlankPoints()
        }

        // Add empty points in between if needed
        _addEmptyPointsBetween(parsedData);
        saveData(parsedData)
        setData(parsedData || []);
      }else{
          const parsedData = _createBlankPoints()
          saveData(parsedData)
          setData(parsedData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {

      setLoading(false);
    }
  }, []);

  // Save data to storage
  const saveData = useCallback(async (dataPoints: TimeSeriesDataPoint[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataPoints));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  // Add new data point
  const addPoint = useCallback(async (ok?: number,notok?:number) => {
    const now = dateNow()
    const oldValue = getDataAt(now);
    if(!ok && !notok){
      return
    }

    if(oldValue){
      oldValue!.ok += ok || 0;
      oldValue!.nok += notok || 0;
      const updated = [...data]
      setData(updated);
      await saveData(updated);

    }else{
      const newDataPoint = {
        t: now,
        ok: ok || 0,
        nok: notok || 0,
      };
      const updatedData = [...data, newDataPoint].sort((a, b) => a.t - b.t);
      setData(updatedData);
      await saveData(updatedData);
    }


  }, [data, saveData]);


  // Clear all data
  const clearAllData = useCallback(async () => {
    setData([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get data in time range
  const getDataInRange = useCallback((startTime: number, endTime: number) => {
    return data.filter(point => point.t >= startTime && point.t <= endTime);
  }, [data]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const contextValue: TimeSeriesContextType = {
    data,
    addPoint,
    clearAllData,
    pointToTimeStamp,
    refreshData: loadData, // Alias for loadData
    getDataInRange,
    loading,
  };

  return (
    <TimeSeriesContext.Provider value={contextValue}>
      {children}
    </TimeSeriesContext.Provider>
  );
};

// Custom Hook
export const useSavedTimeseries = (): TimeSeriesContextType => {
  const context = useContext(TimeSeriesContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};
