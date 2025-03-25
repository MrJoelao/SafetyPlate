"use client"

import React from "react"
import { TouchableOpacity, StyleSheet, Animated } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

interface FloatingActionButtonProps {
  onPress: () => void
  isOpen?: boolean
  color?: string
  activeColor?: string
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  isOpen = false,
  color = "#4CAF50",
  activeColor = "#E53935",
}) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start()
  }, [isOpen])

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  })

  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: isOpen ? activeColor : color }]} onPress={onPress}>
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
})

