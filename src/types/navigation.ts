export type RootTabParamList = {
  Notes: undefined;
  Reminder: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Detail: { id: string; title: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}