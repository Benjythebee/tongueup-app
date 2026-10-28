import React from "react";
import { NotificationCard } from "../components/cards/ReminderCard";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useTranslation } from "react-i18next";

const ReminderScreen: React.FC = () => {
  const {t} = useTranslation();

  return (
    <ScreenWrapper title={t("header.Reminders")} subtitle={t("reminders.subtitle")}>
      <NotificationCard />
    </ScreenWrapper>
  );
};

export default ReminderScreen;
