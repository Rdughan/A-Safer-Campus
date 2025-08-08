// components/ConfirmDeleteModal.js
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/themes';

const ConfirmDeleteModal = ({ 
  visible, 
  onClose,
  onConfirm,
  isLoading 
}) => {
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const themeContext = useContext(ThemeContext);
  
  // Handle case where context isn't available
  if (!themeContext) {
    console.error("ThemeContext is not available in ConfirmDeleteModal");
    return null;
  }
  
  const { isDarkMode } = themeContext;
  const colors = isDarkMode ? darkTheme : lightTheme;

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Confirm Deletion</Text>
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: isDarkMode ? '#3A3A3A' : '#F5F5F5',
              color: colors.text,
              borderColor: colors.border
            }]}
            placeholder="Enter Password"
            placeholderTextColor={isDarkMode ? '#AAAAAA' : '#888'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <View style={styles.checkboxContainer}>
            {/* Use your preferred checkbox component */}
            <TouchableOpacity 
              style={[
                styles.checkbox, 
                { borderColor: colors.border },
                isChecked && { backgroundColor: '#239DD6', borderColor: '#239DD6' }
              ]}
              onPress={() => setIsChecked(!isChecked)}
            >
              {isChecked && <Text style={{ color: 'white' }}>✓</Text>}
            </TouchableOpacity>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              I understand this will permanently delete all my data
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.border }]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: colors.primary },
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