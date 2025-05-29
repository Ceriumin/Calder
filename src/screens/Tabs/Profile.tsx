import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, useAuth } from '@/hooks/_index';
import { Button } from '@/components/input/_index';

export default function Profile() {
  const { 
    currentTheme, 
    themeMode, 
    isSystemPreference, 
    setLightTheme, 
    setDarkTheme, 
    setSystemPreference 
  } = useTheme();
  const { signOut } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: currentTheme.colors.background,
    },
    section: {
      marginBottom: 24,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 8,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      color: currentTheme.colors.text,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    themeOptionText: {
      fontSize: 16,
      color: currentTheme.colors.text,
      marginLeft: 8,
    },
    optionLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activeIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: currentTheme.colors.primary,
    },
    inactiveIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.text,
    },
    logoutButton: {
      marginTop: 24,
      alignSelf: 'center',
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme Settings</Text>
        
        {/* Light Theme Option */}
        <TouchableOpacity 
          style={styles.themeOption} 
          onPress={setLightTheme}
        >
          <View style={styles.optionLabel}>
            <Text style={styles.themeOptionText}>Light Theme</Text>
          </View>
          <View style={!isSystemPreference && themeMode === 'light' ? styles.activeIndicator : styles.inactiveIndicator} />
        </TouchableOpacity>
        
        {/* Dark Theme Option */}
        <TouchableOpacity 
          style={styles.themeOption} 
          onPress={setDarkTheme}
        >
          <View style={styles.optionLabel}>
            <Text style={styles.themeOptionText}>Dark Theme</Text>
          </View>
          <View style={!isSystemPreference && themeMode === 'dark' ? styles.activeIndicator : styles.inactiveIndicator} />
        </TouchableOpacity>
        
        {/* System Preference Option */}
        <TouchableOpacity 
          style={[styles.themeOption, { borderBottomWidth: 0 }]} 
          onPress={setSystemPreference}
        >
          <View style={styles.optionLabel}>
            <Text style={styles.themeOptionText}>System Preference</Text>
          </View>
          <View style={isSystemPreference ? styles.activeIndicator : styles.inactiveIndicator} />
        </TouchableOpacity>
      </View>
      
      <Button 
        onPress={signOut}
        title="Logout" 
        style={styles.logoutButton}
      />
    </View>
  );
}
