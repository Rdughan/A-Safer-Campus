import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportHistoryScreen from '../src/screens/ReportHistoryScreen';
import ReportDetailScreen from '../src/screens/ReportHistoryScreen/ReportDetailScreen';

const Stack = createNativeStackNavigator();

export default function ReportStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ReportHistory" component={ReportHistoryScreen} options={{ title: 'My Reports' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
  );
} 