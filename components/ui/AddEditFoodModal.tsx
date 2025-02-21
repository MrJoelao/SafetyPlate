import { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, TextInput, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Food } from '@/types/food';

interface AddEditFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (food: Food) => Promise<void>;
  food?: Food;
}

export function AddEditFoodModal({ visible, onClose, onSave, food }: AddEditFoodModalProps) {
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [defaultUnit, setDefaultUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [proteins, setProteins] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && food) {
      setName(food.name);
      setScore(food.score.toString());
      setDefaultUnit(food.defaultUnit);
      if (food.nutritionPer100g) {
        setCalories(food.nutritionPer100g.calories?.toString() || '');
        setProteins(food.nutritionPer100g.proteins?.toString() || '');
        setCarbs(food.nutritionPer100g.carbs?.toString() || '');
        setFats(food.nutritionPer100g.fats?.toString() || '');
      }
    }
  }, [visible, food]);

  const resetForm = () => {
    setName('');
    setScore('');
    setDefaultUnit('g');
    setCalories('');
    setProteins('');
    setCarbs('');
    setFats('');
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return false;
    }

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      Alert.alert('Errore', 'Lo score deve essere un numero valido');
      return false;
    }

    if (!defaultUnit.trim()) {
      Alert.alert('Errore', "L'unità di misura è obbligatoria");
      return false;
    }

    // Validate optional nutrition fields if any are filled
    if (calories || proteins || carbs || fats) {
      const validateNumber = (value: string, fieldName: string): boolean => {
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          Alert.alert('Errore', `${fieldName} deve essere un numero valido`);
          return false;
        }
        return true;
      };

      if (!validateNumber(calories, 'Calorie') ||
          !validateNumber(proteins, 'Proteine') ||
          !validateNumber(carbs, 'Carboidrati') ||
          !validateNumber(fats, 'Grassi')) {
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const newFood: Food = {
        id: food?.id || Date.now() + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        score: parseInt(score),
        defaultUnit: defaultUnit.trim(),
        nutritionPer100g: (calories || proteins || carbs || fats) ? {
          calories: calories ? Number(calories) : undefined,
          proteins: proteins ? Number(proteins) : undefined,
          carbs: carbs ? Number(carbs) : undefined,
          fats: fats ? Number(fats) : undefined,
        } : undefined
      };

      await onSave(newFood);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Errore', 'Errore durante il salvataggio dell\'alimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: 'default' | 'numeric' = 'default',
    optional: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <ThemedText style={styles.label}>
        {label}{!optional && <ThemedText style={styles.required}> *</ThemedText>}
      </ThemedText>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
    </View>
  );

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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <MaterialIcons 
                  name={food ? "edit" : "add-circle"} 
                  size={24} 
                  color="#4CAF50" 
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
              {/* Basic Info */}
              {renderInput('Nome', name, setName)}
              {renderInput('Score', score, setScore, 'numeric')}
              {renderInput('Unità di Misura', defaultUnit, setDefaultUnit)}

              {/* Nutrition Info */}
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Valori Nutrizionali (per 100g)
                </ThemedText>
                <ThemedText style={styles.optional}>Opzionale</ThemedText>
              </View>

              {renderInput('Calorie', calories, setCalories, 'numeric', true)}
              {renderInput('Proteine', proteins, setProteins, 'numeric', true)}
              {renderInput('Carboidrati', carbs, setCarbs, 'numeric', true)}
              {renderInput('Grassi', fats, setFats, 'numeric', true)}
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <MaterialIcons name="check" size={24} color="#fff" />
                <ThemedText style={styles.saveButtonText}>
                  {isSubmitting ? 'Salvataggio...' : 'Salva'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: width,
    height: height * 0.9,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 24,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 12,
    alignSelf: 'center',
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
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  required: {
    color: '#F44336',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optional: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
