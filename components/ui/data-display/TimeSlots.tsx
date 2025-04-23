import type React from "react"
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { MaterialIcons } from "@expo/vector-icons"

interface TimeSlot {
  time: string
  activities?: {
    id: string
    title: string
    type: "meal" | "activity" | "note"
    duration?: number
    color?: string
  }[]
}

const { width } = Dimensions.get("window")
const HOUR_HEIGHT = 64
const TIME_WIDTH = 50

const timeSlots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, "0")}:00`,
}))

interface TimeSlotsProps {
  textColor?: string
  onSlotPress?: (time: string) => void
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({ textColor = "#000", onSlotPress }) => {
  const mockActivities: TimeSlot[] = [
    {
      time: "08:00",
      activities: [
        {
          id: "1",
          title: "Colazione",
          type: "meal",
          duration: 30,
          color: "#4CAF50",
        },
      ],
    },
    {
      time: "12:00",
      activities: [
        {
          id: "2",
          title: "Pranzo",
          type: "meal",
          duration: 60,
          color: "#FF9800",
        },
      ],
    },
  ]

  const renderActivity = (activity: NonNullable<TimeSlot["activities"]>[number]) => (
    <View
      key={activity.id}
      style={[
        styles.activity,
        {
          backgroundColor: activity.color,
          height: Math.max(((activity.duration || 60) / 60) * HOUR_HEIGHT - 8, HOUR_HEIGHT / 2),
        },
      ]}
    >
      <View style={styles.activityContent}>
        <ThemedText style={styles.activityTitle} numberOfLines={1}>
          {activity.title}
        </ThemedText>
        {activity.type === "meal" && <MaterialIcons name="restaurant" size={14} color="#FFF" />}
      </View>
      <ThemedText style={styles.activityDuration}>{activity.duration}m</ThemedText>
    </View>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {timeSlots.map((slot, index) => (
        <Pressable key={index} style={styles.timeSlot} onPress={() => onSlotPress?.(slot.time)}>
          <View style={styles.timeContainer}>
            <ThemedText style={[styles.timeText, { color: textColor }]}>{slot.time}</ThemedText>
            <View style={styles.timeIndicator} />
          </View>

          <View style={styles.contentContainer}>
            {mockActivities.find((a) => a.time === slot.time)?.activities?.map(renderActivity)}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  timeSlot: {
    flexDirection: "row",
    minHeight: HOUR_HEIGHT,
    position: "relative",
  },
  timeContainer: {
    width: TIME_WIDTH,
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999",
    marginRight: 6,
  },
  timeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#EEEEEE",
  },
  activity: {
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activityTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    marginRight: 6,
  },
  activityDuration: {
    color: "#FFF",
    fontSize: 10,
    opacity: 0.9,
    marginTop: 2,
  },
})
