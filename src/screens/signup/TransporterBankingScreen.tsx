import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Modal,
  FlatList,
  TextInput as RNTextInput,
  Alert,
  Text,
  Image,
} from 'react-native';
import { Button, Icon, Input } from '../../ui';
import { Colors } from '../../config/colors';
import { useSignUp } from '../../contexts/SignUpContext';
import { transporterBankingSchema } from '../../validation/signUpSchemas';
import * as ImagePicker from 'expo-image-picker';
import { Images } from '../../config/assets';

// Move BANKS array to the top of the file, before the component
const BANKS = [
  'Banque Royale du Canada (RBC)',
  'Banque de Montréal (BMO)',
  'Banque Scotia (Scotiabank)',
  'Banque Toronto-Dominion (TD Canada Trust)',
  'Banque Nationale du Canada (BNC)',
  'CIBC (Banque Canadienne Impériale de Commerce)',
  'Desjardins (Mouvement Desjardins)',
  'HSBC Bank Canada',
  'Laurentienne Banque du Canada',
  'Canadian Western Bank (CWB)',
  'EQ Bank',
  'Tangerine Bank',
];

interface TransporterBankingScreenProps {
  navigation: any;
}

interface FormData {
  bankIban: string;
  bankRouting: string;
  bankAccount: string;
  bankHolder: string;
}

const TransporterBankingScreen: React.FC<TransporterBankingScreenProps> = ({ navigation }) => {
  const { signUpData, updateSignUpData, setCurrentStep } = useSignUp();
  
  const [formData, setFormData] = useState<FormData>({
    bankIban: '',
    bankRouting: signUpData.bankRouting || '',
    bankAccount: signUpData.bankAccount || '',
    bankHolder: signUpData.bankHolder || '',
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isValid, setIsValid] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [chequeImage, setChequeImage] = useState('');

  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    checkFormComplete();
  }, [formData, selectedBank, chequeImage, isValid]);

  const checkFormComplete = () => {
    const complete = isValid && selectedBank && chequeImage;
    console.log('Form validation check:', {
      isValid,
      selectedBank,
      chequeImage: !!chequeImage,
      formData,
      complete
    });
    setIsFormComplete(complete);
  };

  const validateForm = async () => {
    try {
      // Only validate the fields we're using (routing + account + holder)
      const validationData = {
        bankRouting: formData.bankRouting,
        bankAccount: formData.bankAccount,
        bankHolder: formData.bankHolder,
      };
      
      await transporterBankingSchema.validate(validationData, { abortEarly: false });
      console.log('Validation passed for:', validationData);
      setErrors({});
      setIsValid(true);
    } catch (validationErrors: any) {
      const errorObj: Partial<FormData> = {};
      validationErrors.inner?.forEach((error: any) => {
        errorObj[error.path as keyof FormData] = error.message;
      });
      console.log('Validation errors:', errorObj);
      setErrors(errorObj);
      setIsValid(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!isFormComplete) {
      if (!selectedBank) {
        Alert.alert('Incomplete', 'Please select your bank.');
        return;
      }
      if (!chequeImage) {
        Alert.alert('Incomplete', 'Please select a photo of your specimen cheque.');
        return;
      }
      if (!isValid) {
        Alert.alert('Incomplete', 'Please complete all required fields.');
        return;
      }
    }
    
    updateSignUpData({
      bankRouting: formData.bankRouting,
      bankAccount: formData.bankAccount,
      bankHolder: formData.bankHolder,
    });
    setCurrentStep(8);
    navigation.navigate('ConfirmationScreen');
  };

  const handleBack = () => {
    navigation.goBack();
  };


  const selectChequeImage = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to select images.');
        return;
      }

      console.log('Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setChequeImage(result.assets[0].uri);
        console.log('Image selected:', result.assets[0].uri);
      } else {
        console.log('Image selection canceled or no assets');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                      <Icon name="chevron-left" type="Feather" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 6 of 7</Text>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                Banking Information
              </Text>
              <Text style={styles.subtitle}>
                Add your banking details to receive payments for completed deliveries
              </Text>
            </View>
            
            
            {/* Banking Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="home" type="Feather" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Select Your Bank</Text>
              </View>
              <TouchableOpacity
                style={[styles.dropdownInput, !selectedBank && { borderColor: Colors.error }]}
                onPress={() => setBankModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={{ color: selectedBank ? Colors.textPrimary : Colors.textSecondary }}>
                  {selectedBank || 'Choose a bank'}
                </Text>
                <Icon name="chevron-down" type="Feather" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Bank Modal */}
            <Modal
              visible={bankModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setBankModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Your Bank</Text>
                    <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                      <Icon name="x" type="Feather" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <RNTextInput
                    style={styles.searchInput}
                    placeholder="Search bank..."
                    value={bankSearch}
                    onChangeText={setBankSearch}
                    placeholderTextColor={Colors.textSecondary}
                  />
                  <Text style={{ color: 'red', marginBottom: 8 }}>
                    Banks found: {BANKS.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase())).length}
                  </Text>
                  <FlatList
                    data={BANKS.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()))}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.bankItem}
                        onPress={() => {
                          setSelectedBank(item);
                          setBankModalVisible(false);
                          setBankSearch('');
                        }}
                      >
                        <Text style={styles.bankItemText}>{item}</Text>
                        {selectedBank === item && (
                          <Icon name="check" type="Feather" size={18} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 300, width: '100%' }}
                  />
                </View>
              </View>
            </Modal>
            
            {/* Banking Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="dollar-sign" type="Feather" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Account Details</Text>
              </View>
              
              <View style={styles.sectionContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="hash" type="Feather" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                  <Input
                    placeholder="Routing number (9 digits)"
                    value={formData.bankRouting}
                    onChangeText={(value) => updateField('bankRouting', value)}
                    error={errors.bankRouting}
                    keyboardType="numeric"
                    maxLength={9}
                    style={styles.inputField}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="credit-card" type="Feather" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                  <Input
                    placeholder="Account number"
                    value={formData.bankAccount}
                    onChangeText={(value) => updateField('bankAccount', value)}
                    error={errors.bankAccount}
                    keyboardType="numeric"
                    style={styles.inputField}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="user" type="Feather" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                  <Input
                    placeholder="Account holder name"
                    value={formData.bankHolder}
                    onChangeText={(value) => updateField('bankHolder', value)}
                    error={errors.bankHolder}
                    style={styles.inputField}
                  />
                </View>
              </View>
            </View>
            
            {/* Specimen Cheque Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="image" type="Feather" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Specimen Cheque</Text>
              </View>
              <Button
                title={chequeImage ? 'Change cheque photo' : 'Select photo of specimen cheque'}
                onPress={selectChequeImage}
                variant="secondary"
                style={{ marginBottom: 12 }}
              />
              {chequeImage ? (
                <Image source={{ uri: chequeImage }} style={styles.chequePreview} />
              ) : null}
            </View>

            
            {/* Security Notice */}
            <View style={styles.securityCard}>
              <View style={styles.securityHeader}>
                <Icon name="shield" type="Feather" size={18} color={Colors.success} />
                <Text style={styles.securityTitle}>Your Information is Secure</Text>
              </View>
              <View style={styles.securityContent}>
                <View style={styles.securityItem}>
                  <Icon name="lock" type="Feather" size={16} color={Colors.success} />
                  <Text style={styles.securityText}>Bank-level encryption protects your data</Text>
                </View>
                <View style={styles.securityItem}>
                  <Icon name="eye-off" type="Feather" size={16} color={Colors.success} />
                  <Text style={styles.securityText}>Details are never shared with customers</Text>
                </View>
                <View style={styles.securityItem}>
                  <Icon name="check-circle" type="Feather" size={16} color={Colors.success} />
                  <Text style={styles.securityText}>Used only for secure payment processing</Text>
                </View>
              </View>
            </View>
            
            {/* Payment Info */}
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Icon name="info" type="Feather" size={18} color={Colors.info} />
                <Text style={styles.paymentTitle}>How You Get Paid</Text>
              </View>
              <View style={styles.paymentContent}>
                <Text style={styles.paymentText}>
                  • Payments are processed automatically after delivery completion
                </Text>
                <Text style={styles.paymentText}>
                  • Funds typically arrive within 2-3 business days
                </Text>
                <Text style={styles.paymentText}>
                  • You'll receive detailed payment notifications via email
                </Text>
                <Text style={styles.paymentText}>
                  • Track your earnings in the app's dashboard
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Review and confirm"
            onPress={handleNext}
            variant="primary"
            disabled={!isFormComplete}
            style={styles.nextButton}
            icon={<Icon name="check" type="Feather" size={20} color={Colors.white} />}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  stepIndicator: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 34,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {
    gap: 16,
  },
  inputField: {
    marginBottom: 0,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '90%',
    padding: 20,
    alignItems: 'stretch',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  searchInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bankItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  securityCard: {
    backgroundColor: Colors.success + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.success + '20',
    marginBottom: 24,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 8,
  },
  securityContent: {
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentContent: {
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  nextButton: {
    width: '100%',
  },
  chequePreview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginTop: 8,
    resizeMode: 'contain',
  },
});

export default TransporterBankingScreen;