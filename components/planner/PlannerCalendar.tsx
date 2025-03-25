import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { format, addDays, isSameDay } from "date-fns"
import { it } from "date-fns/locale"

interface PlannerCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

const { width } = Dimensions.get("window")
const DAY_WIDTH = Math.min(68, width / 6)

export const PlannerCalendar = ({ selectedDate, onDateSelect }: PlannerCalendarProps) => {
  const next14Days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {next14Days.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate)
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayItem, isSelected && styles.selectedDay]}
              onPress={() => onDateSelect(date)}
            >
              <ThemedText style={[styles.weekday, isSelected && styles.selectedText]}>
                {format(date, "EEE", { locale: it }).toUpperCase()}
              </ThemedText>
              <View style={[styles.dateCircle, isSelected && styles.selectedCircle]}>
                <ThemedText style={[styles.date, isSelected && styles.selectedText]}>{format(date, "d")}</ThemedText>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayItem: {
    width: DAY_WIDTH,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekday: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  date: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f1f1f",
  },
  selectedDay: {
    transform: [{ scale: 1.05 }],
  },
  selectedCircle: {
    backgroundColor: "#4CAF50",
  },
  selectedText: {
    color: "#fff",
  },
})

