import { View, StyleSheet, TouchableOpacity, Image } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { ThemedText } from "@/components/common/ThemedText"
import type { Food } from "@/types/food"
import { getScoreColor, withOpacity } from "@/utils/colorUtils"

interface FoodListItemProps {
  food: Food
  onEdit: (food: Food) => void
  onDelete: (foodId: string) => void
  compact?: boolean // Re-added
}

export function FoodListItem({ food, onEdit, onDelete, compact = false }: FoodListItemProps) { // Re-added compact prop
  const scoreColor = getScoreColor(food.score)

  return (
      // Re-added conditional compact style
      <View style={[styles.foodItem, compact && styles.foodItemCompact]}>
      <View style={styles.foodContent}>
        <View style={styles.foodIconContainer}>
          {food.imageUri ? (
            <Image source={{ uri: food.imageUri }} style={styles.foodImage} />
          ) : (
           // Re-added compact size check for icon
           <MaterialIcons name="fastfood" size={compact ? 18 : 24} color="#333" />
          )}
        </View>

        <View style={styles.foodTextContainer}>
          <View style={styles.nameScoreContainer}>
            <ThemedText style={styles.foodName}>{food.name}</ThemedText>
            <View style={[styles.scoreBadge, { backgroundColor: withOpacity(scoreColor, 20) }]}>
              <ThemedText style={[styles.scoreText, { color: scoreColor }]}>Score: {food.score}</ThemedText>
            </View>
          </View>

          {/* Re-added !compact check for calories */}
          {food.nutritionPer100g?.calories && !compact && (
            <ThemedText style={styles.caloriesText}>{food.nutritionPer100g.calories} kcal/100g</ThemedText>
          )}
        </View>

        <View style={styles.foodActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(food)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MaterialIcons name="edit" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(food.id)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MaterialIcons name="delete-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  foodItem: {
    borderRadius: 9999,
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 12,
  },
  foodItemCompact: {
    borderRadius: 9999,
    marginBottom: 8,
  },
  foodContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  foodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d5d5d5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  foodImage: {
    width: "100%",
    height: "100%",
  },
  foodTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  caloriesText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  scoreBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 30,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  foodActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 30,
    backgroundColor: "#d5d5d5",
  },
})
