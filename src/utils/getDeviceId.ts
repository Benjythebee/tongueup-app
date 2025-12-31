import * as Application from 'expo-application';

export const getDeviceId = (): string => {
    return Application.getAndroidId();
}