import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsOption = ({ iconName, label, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.wrapper}>
      <View style={styles.optionsView}>
        <Ionicons name={iconName} size={24} color="#888" />
        <Text style={styles.optionsName}>{label}</Text>
        <Ionicons
          name="chevron-forward"
          size={24}
          color="#888"
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
    color: '#888',
    flex: 1,
  },
  optionsArrow: {
    // stays at the end of the row
  },
});
