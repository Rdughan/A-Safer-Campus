// components/InputField.js
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

const InputField = ({
  placeholder = 'Enter text',
  iconName = 'email-outline',
  iconColor = '#97999C',
  value,
  onChangeText,
  style = {},
  ...rest
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.inputContainer, { backgroundColor: theme.card }, style]}>
      <MaterialCommunityIcons
        name={iconName}
        size={24}
        color={iconColor}
        style={styles.icon}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.text === '#FFFFFF' ? '#888' : '#666'}
        style={[styles.textInput, { color: theme.text }]}
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
    fontSize: 16,
    borderWidth: 0,
    fontFamily: 'Montserrat-Regular',
  },
});
