import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

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
  return (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        {
          backgroundColor,
          borderRadius,
          width,
          height,
          borderWidth,
          borderColor,
          bottom,
          fontFamily,
        }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: textColor, fontSize }]}>
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
    borderColor:'green',
    bottom:0,
  },
  buttonText: {
    
    fontFamily:'Montserrat-Regular',
    color:'black'
  },
});
