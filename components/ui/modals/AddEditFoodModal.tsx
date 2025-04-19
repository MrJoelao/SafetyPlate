"use client"

import { useState } from "react"
import { Modal, StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native"
import { BlurView } from "expo-blur"
import type { Food } from "@/types/food"
import { ModalHeader } from "@/components/ui/common/ModalHeader"
import { ModalFooter } from "@/components/ui/common/ModalFooter"
import { FoodForm } from "@/components/ui/food/FoodForm"
import { useFoodForm } from "@/hooks/useFoodForm"

interface AddEditFoodModalProps {
  visible: boolean
  onClose: () => void
  food?: Food
  onSave: (food: Food) => Promise<void>
}

export function AddEditFoodModal({ visible, onClose, food, onSave }: AddEditFoodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    name,
    score,
    defaultUnit,
    calories,
    proteins,
    carbs,
    fats,
    imageUri,
    setName,
    setScore,
    setDefaultUnit,
    setCalories,
    setProteins,
    setCarbs,
    setFats,
    setImageUri,
    resetForm,
    validateForm,
    getFormData,
  } = useFoodForm(food)

  const handleSave = async () => {
    if (isSubmitting) return

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      const foodData = getFormData(food?.id)
      await onSave(foodData)
      resetForm()
      onClose()
    } catch (error) {
      console.error("Error saving food:", error)
      alert("An error occurred while saving the food. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={handleClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            
            <ModalHeader
              title={food ? "Edit Food" : "New Food"}
              onClose={handleClose}
              icon={{
                name: food ? "edit" : "plus-circle",
                color: food ? "#2196F3" : "#4CAF50",
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
              onNameChange={setName}
              onScoreChange={setScore}
              onUnitChange={setDefaultUnit}
              onCaloriesChange={setCalories}
              onProteinsChange={setProteins}
              onCarbsChange={setCarbs}
              onFatsChange={setFats}
              onImageSelected={setImageUri}
            />

            <ModalFooter
              onSave={handleSave}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            />
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  keyboardView: {
    flex: 1,
    marginTop: "5%",
  },
  modalContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    maxHeight: "95%",
    marginHorizontal: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  },
})
