import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Type definitions
export interface TimeSeriesDataPoint {
  t: number; // Hours since epoch
  ok: number;
  nok: number;
}

interface TimeSeriesContextType {
  /** Hours with at least one check-in, sorted by `t`. Empty hours aren't stored. */
  data:TimeSeriesDataPoint[]
  loading: boolean;
    addPoint: (ok?: number, notok?: number) => Promise<void>;
    clearAllData: () => Promise<void>;
    refreshData: () => Promise<void>;
    pointToTimeStamp: (number: number) => Date;
    getDataInRange: (startTime: number, endTime: number) => TimeSeriesDataPoint[];
}

// Storage key
const STORAGE_KEY = '@app_tongue_timeseries_data';

// The whole history is one AsyncStorage value, and Android's SQLite cursor can't read a value
// over ~2 MB. A point is ~30 bytes of JSON, so this keeps the value around 1.5 MB: years of
// check-ins every hour. The oldest hours are dropped past it.
const MAX_STORED_POINTS = 50_000;

// Context
const TimeSeriesContext = createContext<TimeSeriesContextType | undefined>(undefined);

// Provider Props
interface TimeSeriesProviderProps {
  children: ReactNode;
}

export const HOUR_MS = 60 * 60 * 1000;

const dateNow = ()=>{
  return Math.floor(Date.now() / HOUR_MS); // Convert to hours - one X = one hour
}

const pointToTimeStamp = (number: number): Date => {
  return new Date(number * HOUR_MS); // Convert hours back to milliseconds
}

// Older versions stored a zero point for every hour since install: keep only real check-ins
const compact = (dataPoints: TimeSeriesDataPoint[]) =>
  dataPoints
    .filter(point => point.ok > 0 || point.nok > 0)
    .sort((a, b) => a.t - b.t)
    .slice(-MAX_STORED_POINTS);

// Provider Component
export const SavedDataProvider: React.FC<TimeSeriesProviderProps> = ({ children }) => {
  const [data, setData] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Save data to storage
  const saveData = useCallback(async (dataPoints: TimeSeriesDataPoint[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataPoints));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      const parsedData: TimeSeriesDataPoint[] = (storedData && JSON.parse(storedData)) || [];
      const compacted = compact(parsedData);
      if (compacted.length !== parsedData.length) {
        await saveData(compacted);
      }
      setData(compacted);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [saveData]);

  // Add new data point
  const addPoint = useCallback(async (ok?: number,notok?:number) => {
    if(!ok && !notok){
      return
    }
    const now = dateNow()
    const last = data[data.length - 1];
    const updated = last?.t === now
      ? [...data.slice(0, -1), { t: now, ok: last.ok + (ok || 0), nok: last.nok + (notok || 0) }]
      : compact([...data, { t: now, ok: ok || 0, nok: notok || 0 }]);
    setData(updated);
    await saveData(updated);
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
    throw new Error('useSavedTimeseries must be used within a SavedDataProvider');
  }

  return context;
};
