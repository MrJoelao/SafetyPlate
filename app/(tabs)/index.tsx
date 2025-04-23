"use client"

import { useState } from "react"
import { StyleSheet, View, SafeAreaView, Dimensions, StatusBar, ScrollView } from "react-native"
import { useRouter } from "expo-router" // Importa useRouter
import { ThemedView } from "@/components/common/ThemedView"
import { ThemedText } from "@/components/common/ThemedText"
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader"

const { width, height } = Dimensions.get("window")
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0

// Example data (to be replaced with real data)
const DAILY_STATS = {
  score: 90, // 0-100
  calories: {
    current: 1850,
    target: 2000,
  },
  macros: {
    proteins: { current: 80, target: 120 },
    carbs: { current: 200, target: 250 },
    fats: { current: 55, target: 65 },
  },
}

// Weekly stats data
const WEEKLY_STATS = [
  { day: "Lun", score: 65 },
  { day: "Mar", score: 70 },
  { day: "Mer", score: 85 },
  { day: "Gio", score: 75 },
  { day: "Ven", score: 40 },
  { day: "Sab", score: 90 },
  { day: "Dom", score: 75 },
]

const getScoreColor = (score: number) => {
  if (score <= 40) return "#F44336"
  if (score < 70) return "#FFC107"
  return "#4CAF50"
}

export default function HomeScreen() {
  const router = useRouter() // Inizializza useRouter
  const scoreColor = getScoreColor(DAILY_STATS.score)

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScreenHeader
          title="Home"
          icon={<FontAwesome5 name="apple-alt" size={24} color="#000" />}
          showSearch={true}
          showOptions={true}
          // Naviga alla schermata Impostazioni
          onOptionsPress={() => router.push("/settings")}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Score Card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <ThemedText style={styles.scoreTitle}>Punteggio Nutrizionale</ThemedText>
              <ThemedText style={styles.scoreDate}>Oggi</ThemedText>
            </View>

            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <ThemedText style={[styles.scoreValue, { color: scoreColor }]}>{DAILY_STATS.score}</ThemedText>
                <ThemedText style={styles.scoreLabel}>/ 100</ThemedText>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${DAILY_STATS.score}%`,
                      backgroundColor: scoreColor,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.scoreInsights}>
              <MaterialIcons name={DAILY_STATS.score >= 70 ? "thumb-up" : "info"} size={20} color={scoreColor} />
              <ThemedText style={[styles.insightText, { color: scoreColor }]}>
                {(() => {
                  switch (true) {
                    case DAILY_STATS.score >= 70:
                      return "Ottimo lavoro! Continua così!"
                    case DAILY_STATS.score <= 40:
                      return "Attenzione! Hai bisogno di migliorare!"
                    case DAILY_STATS.score > 40 && DAILY_STATS.score < 70:
                      return "Ci devi ancora lavorare, non mollare!"
                    default:
                      return ""
                  }
                })()}
              </ThemedText>
            </View>
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyCard}>
            <ThemedText style={styles.weeklyTitle}>Andamento Settimanale</ThemedText>
            <View style={styles.chartContainer}>
              {WEEKLY_STATS.map((stat, index) => (
                <View key={index} style={styles.chartColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${stat.score}%`,
                          backgroundColor: getScoreColor(stat.score),
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={styles.dayLabel}>{stat.day}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Meals */}
          <View style={styles.recentMealsCard}>
            <View style={styles.recentMealsHeader}>
              <ThemedText style={styles.recentMealsTitle}>Pasti Recenti</ThemedText>
              <ThemedText style={styles.viewAllText}>Vedi tutti</ThemedText>
            </View>
            {/* Example of a recent meal */}
            <View style={styles.mealItem}>
              <MaterialIcons name="restaurant" size={24} color="#4CAF50" />
              <View style={styles.mealInfo}>
                <ThemedText style={styles.mealName}>Pranzo</ThemedText>
                <ThemedText style={styles.mealDetails}>Pasta integrale, Insalata</ThemedText>
              </View>
              <ThemedText style={styles.mealScore}>85</ThemedText>
            </View>
          </View>
        </ScrollView>

        {/* Rimuovi il rendering dei modali originali */}
        {/* <ImportFoodModal ... /> */}
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 160,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  scoreDate: {
    fontSize: 14,
    color: "#666",
  },
  scoreContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  scoreCircle: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 42,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
    lineHeight: 16,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreInsights: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  insightText: {
    fontSize: 14,
    fontWeight: "500",
  },
  weeklyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 220,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
    marginBottom: 8,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    marginTop: 8,
    paddingBottom: 24,
  },
  chartColumn: {
    alignItems: "center",
    flex: 1,
    minWidth: 32,
    height: "100%",
    justifyContent: "flex-end",
    paddingHorizontal: 4,
  },
  barContainer: {
    height: "100%",
    width: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 5,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 8,
    position: "absolute",
    bottom: -24,
    width: "100%",
    textAlign: "center",
  },
  recentMealsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 150,
  },
  recentMealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recentMealsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f1f1f",
  },
  viewAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    gap: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f1f1f",
  },
  mealDetails: {
    fontSize: 14,
    color: "#666",
  },
  mealScore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
})
