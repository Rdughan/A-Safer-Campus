// components/InputField.js
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const InputField = ({
  placeholder = 'Enter text',
  iconName = 'email-outline',
  iconColor = '#97999C',
  value,
  onChangeText,
  style = {},
  ...rest
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <MaterialCommunityIcons
        name={iconName}
        size={24}
        color={iconColor}
        style={styles.icon}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888"
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E7E8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    width:'90%'
   
    
  },
  icon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    borderWidth: 0,
    fontFamily: 'Montserrat-Regular',
  },
});
