import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Switch,
  SafeAreaView,
  StatusBar
} from 'react-native';
import useBluetooth from '@/hooks/useBluetooth';
import { Device } from 'react-native-ble-plx';

export default function Home() {
  const { 
    isScanning, 
    devices, 
    connectedDevice, 
    error, 
    startScan, 
    stopScan, 
    connectToDevice,
    disconnectFromDevice,
    
  } = useBluetooth();

  const [isLEDOn, setIsLEDOn] = useState(false);

  // Auto-stop scanning after 10 seconds
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        stopScan();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isScanning, stopScan]);

  const handleScanPress = () => {
    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };

  const handleConnectPress = async (device: Device) => {
    await connectToDevice(device.id);
  };

  const handleDisconnectPress = async () => {
    if (connectedDevice) {
      await disconnectFromDevice(connectedDevice.id);
    }
  };

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnectPress(item)}
      disabled={!!connectedDevice}
    >
      <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
      <Text style={styles.deviceId}>{item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bluetooth Control</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.scanButton, isScanning && styles.scanningButton]} 
          onPress={handleScanPress}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>

        {isScanning && <ActivityIndicator style={styles.spinner} color="#007AFF" />}
      </View>

      {!connectedDevice ? (
        <>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          {devices.length > 0 ? (
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={renderDeviceItem}
              contentContainerStyle={styles.deviceList}
            />
          ) : (
            <Text style={styles.noDevicesText}>
              {isScanning ? 'Scanning for devices...' : 'No devices found. Start scanning to discover devices.'}
            </Text>
          )}
        </>
      ) : (
        <View style={styles.connectedDeviceContainer}>
          <Text style={styles.sectionTitle}>Connected Device</Text>
          <View style={styles.connectedDeviceInfo}>
            <Text style={styles.connectedDeviceName}>
              {connectedDevice.name || 'Unnamed Device'}
            </Text>
            <Text style={styles.connectedDeviceId}>{connectedDevice.id}</Text>

            <TouchableOpacity 
              style={styles.disconnectButton} 
              onPress={handleDisconnectPress}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scanningButton: {
    backgroundColor: '#FF3B30',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  spinner: {
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  deviceList: {
    paddingBottom: 16,
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noDevicesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  connectedDeviceContainer: {
    flex: 1,
  },
  connectedDeviceInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  connectedDeviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  connectedDeviceId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  ledControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ledControlLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  ledStatusText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#007AFF',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disconnectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
