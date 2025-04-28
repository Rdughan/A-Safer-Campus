import React from 'react';
import { Text } from 'react-native';

const CustomText = ({ children, style, ...props }) => {
  return <Text style={[{ fontFamily: 'Montserrat-Variable' }, style]} {...props}>{children}</Text>;
};

export default CustomText;
