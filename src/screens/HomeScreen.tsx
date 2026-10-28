import React from "react";
import { useTranslation } from "react-i18next";
import { ProgressCard } from "../components/cards/ProgressCard";
import { MomentaryNotesCard } from "../components/cards/MomentaryNotesCard";
import { PeriodicThoughtsCard } from "../components/cards/PeriodicThoughtsCard";

import { ScreenWrapper } from "../components/ScreenWrapper";

const greetingKey = (hour: number) => {
  if (hour >= 5 && hour < 12) return "home.greetingMorning" as const;
  if (hour >= 12 && hour < 18) return "home.greetingAfternoon" as const;
  return "home.greetingEvening" as const;
};

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const now = new Date();
  const today = now.toLocaleDateString(i18n.language?.startsWith("fr") ? "fr-FR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <ScreenWrapper eyebrow={today} title={t(greetingKey(now.getHours()))} subtitle={t("home.subtitle")}>
      <MomentaryNotesCard />

      <PeriodicThoughtsCard />

      <ProgressCard />
    </ScreenWrapper>
  );
};

export default HomeScreen;
