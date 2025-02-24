import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Food } from '@/types/food';
import { saveFoods } from '@/utils/foodStorage';

interface AddEditFoodModalProps {
  visible: boolean;
  onClose: () => void;
  food?: Food;
  onSave: (food: Food) => Promise<void>;
}

export function AddEditFoodModal({ visible, onClose, food, onSave }: AddEditFoodModalProps) {
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [defaultUnit, setDefaultUnit] = useState('');
  const [calories, setCalories] = useState('');
  const [proteins, setProteins] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (food) {
      setName(food.name);
      setScore(food.score.toString());
      setDefaultUnit(food.defaultUnit);
      if (food.nutritionPer100g) {
        setCalories(food.nutritionPer100g.calories?.toString() || '');
        setProteins(food.nutritionPer100g.proteins?.toString() || '');
        setCarbs(food.nutritionPer100g.carbs?.toString() || '');
        setFats(food.nutritionPer100g.fats?.toString() || '');
      }
    } else {
      resetForm();
    }
  }, [food]);

  const resetForm = () => {
    setName('');
    setScore('');
    setDefaultUnit('');
    setCalories('');
    setProteins('');
    setCarbs('');
    setFats('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return;
    }

    if (!score || isNaN(Number(score))) {
      Alert.alert('Errore', 'Lo score deve essere un numero valido');
      return;
    }

    if (!defaultUnit.trim()) {
      Alert.alert('Errore', "L'unità di misura è obbligatoria");
      return;
    }

    try {
      setIsLoading(true);
      const foodData: Food = {
        id: food?.id || `food-${Date.now()}`,
        name: name.trim(),
        score: Number(score),
        defaultUnit: defaultUnit.trim(),
        nutritionPer100g: {
          calories: calories ? Number(calories) : undefined,
          proteins: proteins ? Number(proteins) : undefined,
          carbs: carbs ? Number(carbs) : undefined,
          fats: fats ? Number(fats) : undefined,
        },
      };

      const result = await saveFoods([foodData]);
      if (result.success) {
        await onSave(foodData);
        resetForm();
        onClose();
      } else {
        Alert.alert('Errore', result.error || 'Errore durante il salvataggio');
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore inatteso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <MaterialIcons
                  name={food ? 'edit' : 'add-circle'}
                  size={24}
                  color={food ? '#2196F3' : '#4CAF50'}
                />
                <ThemedText style={styles.title}>
                  {food ? 'Modifica Alimento' : 'Nuovo Alimento'}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {/* Required Fields */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Informazioni base *
                </ThemedText>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome alimento"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#999"
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Score"
                      value={score}
                      onChangeText={setScore}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    <TextInput
                      style={[styles.input, styles.halfInput]}
                      placeholder="Unità di misura"
                      value={defaultUnit}
                      onChangeText={setDefaultUnit}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              {/* Optional Fields */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Valori nutrizionali per 100g
                </ThemedText>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Calorie (kcal)"
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.thirdInput]}
                      placeholder="Proteine (g)"
                      value={proteins}
                      onChangeText={setProteins}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    <TextInput
                      style={[styles.input, styles.thirdInput]}
                      placeholder="Carboidrati (g)"
                      value={carbs}
                      onChangeText={setCarbs}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    <TextInput
                      style={[styles.input, styles.thirdInput]}
                      placeholder="Grassi (g)"
                      value={fats}
                      onChangeText={setFats}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={24} color="#fff" />
                    <ThemedText style={styles.buttonText}>Salva</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  keyboardView: {
    flex: 1,
    marginTop: '5%',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    maxHeight: '95%',
    marginHorizontal: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
