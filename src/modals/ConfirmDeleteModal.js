// components/ConfirmDeleteModal.js
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';

const ConfirmDeleteModal = ({ 
  visible, 
  onClose,
  onConfirm,
  isLoading 
}) => {
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = () => {
    onConfirm(password);
    setPassword('');
    setIsChecked(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Confirm Deletion</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <View style={styles.checkboxContainer}>
            {/* Use your preferred checkbox component */}
            <TouchableOpacity 
              style={[styles.checkbox, isChecked && styles.checked]}
              onPress={() => setIsChecked(!isChecked)}
            >
              {isChecked && <Text>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I understand this will permanently delete all my data
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!password || !isChecked) && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={!password || !isChecked || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Deleting...' : 'Confirm Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily:'Montserrat-Bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontFamily:'Montserrat-Regular',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#239DD6',
    borderColor: '#239DD6',
  },
  checkboxLabel: {
    flex: 1,
    fontFamily:'Montserrat-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    
  },
  confirmButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily:'Montserrat-Bold',
  },
});

export default ConfirmDeleteModal;