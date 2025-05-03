import React, { useState } from "react"; // Import useState
import { StyleSheet, View, SafeAreaView, Platform, ActivityIndicator, Text } from "react-native"; // Import Text
import { useRouter } from "expo-router";
// Remove ThemedView and ThemedText imports
// import { ThemedView } from "@/components/common/ThemedView";
// import { ThemedText } from "@/components/common/ThemedText";
import { ScreenHeader } from "@/components/ui/layout/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";

// Import hook and components
import { usePlanner } from "@/hooks/usePlanner";
import { Calendar } from "@/components/ui/data-display/Calendar";
import { DailyPlannerView } from "@/components/ui/planner/DailyPlannerView";
import { SelectFoodModal } from "@/components/ui/modals/SelectFoodModal"; // Import the modal
import type { DailyPlan, PlannedMealItem } from "@/types/planner"; // Import PlannedMealItem

export default function PlannerScreen() {
  const router = useRouter();
  const {
    currentDate,
    currentPlan,
    allFoods, // Destructure allFoods from the hook
    isLoading,
    error,
    changeDate,
    addMealItem,
    removeMealItem,
    getFoodById,
  } = usePlanner();

  // State for modal visibility and target meal type
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [targetMealType, setTargetMealType] = useState<keyof DailyPlan | null>(null);

  // Function to open the modal
  const openAddFoodModal = (mealType: keyof DailyPlan) => {
    setTargetMealType(mealType);
    setIsModalVisible(true);
  };

  // Function to close the modal
  const closeAddFoodModal = () => {
    setIsModalVisible(false);
    setTargetMealType(null); // Reset target meal type
  };

  // Function called when items are selected and confirmed in the modal
  const handleFoodSelected = (items: PlannedMealItem[]) => { // Accept an array of items
    if (targetMealType) {
      // Iterate over the array and add each item
      items.forEach(item => {
        addMealItem(targetMealType, item);
      });
    }
    // The modal closes itself after confirmation (handleConfirmAdd calls onClose)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Replace ThemedView with View */}
      <View style={styles.container}>
        <ScreenHeader
          title="Planner"
          icon={<MaterialIcons name="event-note" size={24} color="#000" />}
          showSearch={false}
          showOptions={true}
          onOptionsPress={() => router.push("/settings")}
        />

        {/* Calendar for date selection */}
        <Calendar selectedDate={currentDate} onDateSelect={changeDate} />

        {/* Content Area */}
        <View style={styles.contentArea}>
          {isLoading ? (
            <ActivityIndicator animating={true} size="large" style={styles.loader} />
          ) : error ? (
            // Replace ThemedText with Text
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <DailyPlannerView
              plan={currentPlan}
              onAddItem={openAddFoodModal} // Pass the correct function to open the modal
              onRemoveItem={removeMealItem}
              getFoodById={getFoodById}
            />
          )}
        </View>

        {/* Render the modal */}
        <SelectFoodModal
          visible={isModalVisible}
          mealType={targetMealType}
          allFoods={allFoods} // Pass allFoods to the modal
          onClose={closeAddFoodModal}
          onSelect={handleFoodSelected}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff", // Ensure background color consistency
  },
  contentArea: { // Added style for the area below the calendar
    flex: 1,
    paddingHorizontal: 10, // Add some horizontal padding
    paddingTop: 10, // Add some top padding
  },
  loader: {
    marginTop: 50, // Center loader vertically a bit
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  // fabContainer style might be removed if not needed anymore
  // fabContainer: {
  //   position: "absolute",
  //   right: 20,
  //   bottom: Platform.OS === "ios" ? 100 : 80,
  //   zIndex: 2,
  //   alignItems: "flex-end",
  // },
});
