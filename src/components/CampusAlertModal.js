import { StyleSheet, Text, View, Image, Modal } from 'react-native';
import React from 'react';
import CustomButton from './CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';

const CampusAlertModal = ({ visible, onClose, title, message, type = 'success' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#2196F3';
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <Icon name={getIcon()} size={80} color={getIconColor()} style={styles.icon} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <CustomButton 
            buttonText="OK" 
            backgroundColor="#239DD6" 
            onPress={onClose} 
          />
        </View>
      </View>
    </Modal>
  );
};

export default CampusAlertModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10
  },
  mainContainer: {
    backgroundColor: 'white',
    height: 'auto',
    minHeight: '40%',
    width: '85%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 25,
    gap: 15
  },
  icon: {
    marginBottom: 10
  },
  title: {
    color: 'black',
    fontFamily: 'Montserrat-Bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 5
  },
  message: {
    color: 'black',
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10
  }
});
