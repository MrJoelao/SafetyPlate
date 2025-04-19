import { useRef } from "react"
import { Animated, Dimensions } from "react-native"

export function useSlideAnimation() {
  const slideAnim = useRef(new Animated.Value(0)).current
  const { width } = Dimensions.get("window")

  const slideLeft = (onComplete?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0)
      onComplete?.()
    })
  }

  const slideRight = (onComplete?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0)
      onComplete?.()
    })
  }

  return {
    slideAnim,
    slideLeft,
    slideRight,
  }
}
