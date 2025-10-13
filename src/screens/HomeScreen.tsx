import React, { useMemo, useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ProgressCard } from "../components/cards/ProgressCard";
import { MomentaryNotesCard } from "../components/cards/MomentaryNotesCard";
import { PeriodicThoughtsCard } from "../components/cards/PeriodicThoughtsCard";

import { ScreenWrapper } from "../components/ScreenWrapper";

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  return (
    <ScreenWrapper>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 25 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Notes</Text>
        </View>
        <MomentaryNotesCard />

        <PeriodicThoughtsCard />

        <ProgressCard />
      </ScrollView>
    </ScreenWrapper>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    header: {
      paddingHorizontal: 16,
      paddingVertical: 0,
      paddingTop: 80,
      // borderBottomWidth: 1,
      // borderBottomColor: colors.border,
    },
    title: {
      fontSize: 42,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "400",
    },
    listContainer: {
      paddingVertical: 8,
    },
  });

export default HomeScreen;
