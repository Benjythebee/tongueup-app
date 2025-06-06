import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


type UseAsyncStorageReturn<T> = [
    T | null,
    (value: T) => Promise<void>,
    () => Promise<void>,
    boolean
];

function useAsyncStorage<T>(key: string, initialValue: T): UseAsyncStorageReturn<T> {
    const [storedValue, setStoredValue] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    const loadValue = useCallback(async () => {
        try {
            const item = await AsyncStorage.getItem(key);
            setStoredValue(item != null ? JSON.parse(item) : initialValue);
        } catch (e) {
            setStoredValue(initialValue);
        } finally {
            setLoading(false);
        }
    },[key])

    useEffect(() => {
        loadValue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue = useCallback(
        async (value: T) => {
            try {
                await AsyncStorage.setItem(key, JSON.stringify(value));
                setStoredValue(value);
            } catch (e) {
                // Handle error if needed
            }
        },
        [key]
    );

    return [storedValue, setValue, loadValue, loading];
}

export default useAsyncStorage;