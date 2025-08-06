import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/themes';

const SettingsOption = ({ iconName, label, onPress }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <TouchableOpacity onPress={onPress} style={styles.wrapper}>
      <View style={[styles.optionsView, { borderBottomColor: theme.border }]}>
        <Ionicons name={iconName} size={24} color={theme.text} />
        <Text style={[styles.optionsName, { color: theme.text }]}>{label}</Text>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.text}
          style={styles.optionsArrow}
        />
      </View>
    </TouchableOpacity>
  );
};

export default SettingsOption;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  optionsView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    width: '90%',
    borderBottomWidth: 0.6,
    paddingVertical: 16,
  },
  optionsName: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  optionsArrow: {
    // stays at the end of the row
  },
});
