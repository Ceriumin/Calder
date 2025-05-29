import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import useBluetooth from '../../hooks/useBluetooth';
import { useTheme } from '../../hooks/useTheme';

const Home: React.FC = () => {
  const {
    isScanning,
    isConnecting,
    isConnected,
    device,
    error,
    temperature,
    humidity,
    startScan,
    connectToDevice,
    disconnect,
  } = useBluetooth();
  
  const { currentTheme }  = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    scrollContent: {
      padding: 20,
    },
    header: {
      marginBottom: 30,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    subtitle: {
      fontSize: 16,
      color:  currentTheme.colors.text,
      marginTop: 5,
    },
    errorContainer: {
      backgroundColor: '#FFE5E5',
      padding: 15,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    errorText: {
      color: '#FF3B30',
      marginLeft: 10,
      flex: 1,
    },
    deviceSection: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color:  currentTheme.colors.text,
      marginBottom: 15,
    },
    statusContainer: {
      gap: 10,
    },
    statusItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusLabel: {
      fontSize: 16,
      color: '#8E8E93',
    },
    statusValue: {
      fontSize: 16,
      fontWeight: '500',
    },
    readingsSection: {
      backgroundColor:  currentTheme.colors.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    readingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor:  currentTheme.colors.card,
      borderRadius: 8,
      marginBottom: 10,
    },
    readingIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    readingDetails: {
      flex: 1,
    },
    readingLabel: {
      fontSize: 14,
      color: '#8E8E93',
    },
    readingValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1C1C1E',
    },
    buttonContainer: {
      marginTop: 10,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
    },
    scanButton: {
      backgroundColor: '#007AFF',
    },
    connectButton: {
      backgroundColor: '#34C759',
    },
    disconnectButton: {
      backgroundColor: '#FF3B30',
    },
    buttonIcon: {
      marginRight: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Bluetooth Demo</Text>
          <Text style={styles.subtitle}>ESP32 Temperature & Humidity Monitor</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.deviceSection}>
          <Text style={styles.sectionTitle}>Device Status</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Connection:</Text>
              <Text style={[
                styles.statusValue, 
                { color: isConnected ? '#34C759' : '#FF9500' }
              ]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
            
            {device && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Device:</Text>
                <Text style={styles.statusValue}>{device.name || device.id}</Text>
              </View>
            )}
          </View>
        </View>

        {isConnected && (
          <View style={styles.readingsSection}>
            <Text style={styles.sectionTitle}>Sensor Readings</Text>
            
            <View style={styles.readingCard}>
              <View style={styles.readingDetails}>
                <Text style={styles.readingLabel}>Temperature</Text>
                <Text style={styles.readingValue}>
                  {temperature !== null ? `${temperature.toFixed(1)}°C` : 'Loading...'}
                </Text>
              </View>
            </View>
            
            <View style={styles.readingCard}>
              <View style={styles.readingDetails}>
                <Text style={styles.readingLabel}>Humidity</Text>
                <Text style={styles.readingValue}>
                  {humidity !== null ? `${humidity.toFixed(1)}%` : 'Loading...'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!device && !isConnected && (
            <TouchableOpacity
              style={[styles.button, styles.scanButton]}
              onPress={startScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Scan for ESP32</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {device && !isConnected && (
            <TouchableOpacity
              style={[styles.button, styles.connectButton]}
              onPress={connectToDevice}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Connect</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isConnected && (
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={disconnect}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
