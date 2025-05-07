"use client"

import type React from "react"
import { useCallback, useRef, useEffect, useState } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from "react-native"
import { ThemedText } from "@/components/common/ThemedText"
import { format, addMonths, subMonths } from "date-fns"
import { it } from "date-fns/locale"
import { IconButton } from "@/components/ui/buttons/IconButton"

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

const { width } = Dimensions.get("window")
const HORIZONTAL_PADDING = 2
const DATE_ITEM_WIDTH = Math.floor((width - HORIZONTAL_PADDING * 2) / 7)
const ARROW_WIDTH = 40

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [isScrolling, setIsScrolling] = useState(false)

  const getDatesInMonth = useCallback(() => {
    const dates = []
    const currentDate = new Date(selectedDate)
    currentDate.setDate(1)

    while (currentDate.getMonth() === selectedDate.getMonth()) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }, [selectedDate])

  // Scroll to selected date only when month changes
  useEffect(() => {
    if (isScrolling) return // Don't scroll if user is interacting

    const dates = getDatesInMonth()
    const selectedIndex = dates.findIndex((date) => date.getDate() === selectedDate.getDate())

    if (selectedIndex !== -1 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: selectedIndex * DATE_ITEM_WIDTH,
          animated: true,
        })
      }, 100)
    }
  }, [selectedDate.getMonth()])

  const handleDatePress = (date: Date) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    onDateSelect(date)
  }

  const handlePrevMonth = () => {
    onDateSelect(subMonths(selectedDate, 1))
  }

  const handleNextMonth = () => {
    onDateSelect(addMonths(selectedDate, 1))
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.monthContainer}>
          <ThemedText style={styles.monthText}>{format(selectedDate, "MMMM yyyy", { locale: it })}</ThemedText>
        </View>

        <View style={styles.arrowsContainer}>
          <IconButton onPress={handlePrevMonth} icon="chevron-left" size={24} color="#666" style={styles.leftArrow} />

          <IconButton onPress={handleNextMonth} icon="chevron-right" size={24} color="#666" style={styles.rightArrow} />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysContainer}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScrollEndDrag={() => setIsScrolling(false)}
        onMomentumScrollEnd={() => setIsScrolling(false)}
        decelerationRate="normal"
        scrollEventThrottle={16}
      >
        {getDatesInMonth().map((date, index) => {
          const isSelected = date.getDate() === selectedDate.getDate()
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <Animated.View key={index} style={[{ transform: [{ scale: isSelected ? scaleAnim : 1 }] }]}>
              <TouchableOpacity
                onPress={() => handleDatePress(date)}
                style={[styles.dateItem, isToday && !isSelected && styles.todayDate, isSelected && styles.selectedDate]}
              >
                <ThemedText style={styles.dayName}>{format(date, "EEE", { locale: it }).toUpperCase()}</ThemedText>
                <View
                  style={[
                    styles.dateCircle,
                    isToday && !isSelected && styles.todayCircle,
                    isSelected && styles.selectedCircle,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.dateNumber,
                      isToday && !isSelected && styles.todayText,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {date.getDate()}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    position: "relative",
    width: "100%",
    marginBottom: 4,
  },
  monthContainer: {
    paddingLeft: ARROW_WIDTH + 4,
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textTransform: "capitalize",
    lineHeight: 20,
  },
  dayNumberText: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
    marginTop: 4,
  },
  arrowsContainer: {
    flexDirection: "row",
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "space-between",
    zIndex: 1,
    height: 40,
  },
  leftArrow: {
    paddingLeft: 4,
  },
  rightArrow: {
    paddingRight: 4,
  },
  daysContainer: {
    flexDirection: "row",
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  dateItem: {
    width: DATE_ITEM_WIDTH,
    alignItems: "center",
    paddingHorizontal: 2,
    height: 52,
  },
  dayName: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
    lineHeight: 12,
  },
  dateCircle: {
    width: Math.min(32, DATE_ITEM_WIDTH - 8),
    height: Math.min(32, DATE_ITEM_WIDTH - 8),
    borderRadius: Math.min(16, (DATE_ITEM_WIDTH - 8) / 2),
    justifyContent: "center",
    alignItems: "center",
  },
  dateNumber: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  selectedDate: {
    backgroundColor: "transparent",
  },
  selectedCircle: {
    backgroundColor: "#4CAF50",
    borderRadius: 999, // Forza il cerchio anche se la View cresce
    width: Math.min(32, DATE_ITEM_WIDTH - 8),
    height: Math.min(32, DATE_ITEM_WIDTH - 8),
    justifyContent: "center",
    alignItems: "center",
  },
  selectedText: {
    color: "#fff",
  },
  todayDate: {
    backgroundColor: "transparent",
  },
  todayCircle: {
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  todayText: {
    color: "#4CAF50",
  },
})
