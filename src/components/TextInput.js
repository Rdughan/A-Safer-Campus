// components/InputField.js
import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
  
const InputField = ({
  iconName,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  iconColor = '#000',
  style,
  ...rest
}) => {
  return (
    <View style={[
      styles.inputContainer, 
      { 
        backgroundColor: '#E6E7E8' // Always light color for login/signup inputs
      },
      style
    ]}>
      <MaterialCommunityIcons
        name={iconName}
        size={24}
        color={iconColor}
        style={styles.icon}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888"
        style={[
          styles.textInput,
          { color: '#000' } // Always black text for login/signup inputs
        ]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
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
