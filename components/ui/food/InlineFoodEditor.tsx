import { KeyboardAvoidingView, Platform, StyleSheet, Animated, View } from "react-native"
import { ModalHeader } from "@/components/ui/common/ModalHeader"
import { ModalFooter } from "@/components/ui/common/ModalFooter"
import { FoodForm } from "@/components/ui/food/FoodForm"
import type { Food } from "@/types/food"

interface InlineFoodEditorProps {
  name: string
  score: string
  defaultUnit: string
  calories: string
  proteins: string
  carbs: string
  fats: string
  imageUri?: string
  onNameChange: (value: string) => void
  onScoreChange: (value: string) => void
  onUnitChange: (value: string) => void
  onCaloriesChange: (value: string) => void
  onProteinsChange: (value: string) => void
  onCarbsChange: (value: string) => void
  onFatsChange: (value: string) => void
  onImageSelected: (uri: string | undefined) => void
  slideAnim: Animated.Value
  onSave: () => void
  onClose: () => void
  isSubmitting: boolean
  editMode: boolean
}

export function InlineFoodEditor({
  name,
  score,
  defaultUnit,
  calories,
  proteins,
  carbs,
  fats,
  imageUri,
  onNameChange,
  onScoreChange,
  onUnitChange,
  onCaloriesChange,
  onProteinsChange,
  onCarbsChange,
  onFatsChange,
  onImageSelected,
  slideAnim,
  onSave,
  onClose,
  isSubmitting,
  editMode,
}: InlineFoodEditorProps) {
  return (
    <Animated.View style={[styles.editContainer, { transform: [{ translateX: slideAnim }] }]}>
      <ModalHeader
        title={editMode ? "Modifica Alimento" : "Nuovo Alimento"}
        onClose={onClose}
        icon={{
          name: editMode ? "edit" : "plus-circle",
          color: editMode ? "#2196F3" : "#4CAF50",
        }}
        disabled={isSubmitting}
      />

      <FoodForm
        name={name}
        score={score}
        defaultUnit={defaultUnit}
        calories={calories}
        proteins={proteins}
        carbs={carbs}
        fats={fats}
        imageUri={imageUri}
        onNameChange={onNameChange}
        onScoreChange={onScoreChange}
        onUnitChange={onUnitChange}
        onCaloriesChange={onCaloriesChange}
        onProteinsChange={onProteinsChange}
        onCarbsChange={onCarbsChange}
        onFatsChange={onFatsChange}
        onImageSelected={onImageSelected}
      />

      <ModalFooter
        onSave={onSave}
        disabled={isSubmitting}
        isLoading={isSubmitting}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  editContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
})
