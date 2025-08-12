//for implementing montserrat font 
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const CustomText = ({ children, style, color, ...props }) => {
  const { theme } = useTheme();
  
  // Use theme text color if no explicit color is provided
  const textColor = color || theme.text;
  
  return (
    <Text 
      style={[
        { fontFamily: 'Montserrat-Variable', color: textColor }, 
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;
