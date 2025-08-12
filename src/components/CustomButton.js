import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const CustomButton = ({
  buttonText,
  onPress,
  backgroundColor = '#007AFF',
  textColor = '#FFFFFF',
  borderRadius = 10,
  width = '80%',
  height = 50,
  fontSize = 16,
  borderWidth=0,
  borderColor,
  bottom,
  fontFamily,
}) => {
  const { theme } = useTheme();
  
  // Use theme colors if not explicitly provided
  const finalBackgroundColor = backgroundColor === '#007AFF' ? theme.primary : backgroundColor;
  const finalTextColor = textColor === '#FFFFFF' ? (theme.text === '#FFFFFF' ? '#000000' : '#FFFFFF') : textColor;
  const finalBorderColor = borderColor || theme.border;

  return (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        {
          backgroundColor: finalBackgroundColor,
          borderRadius,
          width,
          height,
          borderWidth,
          borderColor: finalBorderColor,
          bottom,
          fontFamily,
        }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      delayPressIn={0}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Text style={[styles.buttonText, { color: finalTextColor, fontSize }]}>
        {buttonText}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth:5,
    
    bottom:0,
  },
  buttonText: {
    
    fontFamily:'Montserrat-Regular',
  },
});
