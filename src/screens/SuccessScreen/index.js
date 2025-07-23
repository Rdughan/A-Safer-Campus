import React from 'react';
import { StyleSheet, Text, View, Image, Modal } from 'react-native';
import PropTypes from 'prop-types';

const SuccessModal = ({ visible, onClose }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Image 
            source={require('./media/successImg.png')} 
            style={styles.image}
          />
          <Text style={styles.text}>Success!</Text>
        </View>
      </View>
    </Modal>
  );
};

SuccessModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  image: {
    width: 170,  
    height: 170, 
    resizeMode: 'contain',
    marginBottom: 20,    
  },
  text: {
    color: '#239DD6',
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',    
  },
});

export default SuccessModal;