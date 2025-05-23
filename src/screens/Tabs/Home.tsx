import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import { useBluetooth } from '@/hooks/useBluetooth';

const Home = () => {
  const {
    devices,
    connectedDevices,
    isScanning,
    hasPermission,
    isLoading,
    error,
    checkPermission,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnectFromDevice,
    discoverServices,
    clearError,
    removeBondedDevice,
  } = useBluetooth();

  // Request permissions when component mounts
  useEffect(() => {
    checkPermission();
  }, []);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  // Handle device connection
  const handleConnect = async (deviceId: string) => {
    await connectToDevice(deviceId);
    
    // After successful connection, discover services
    const connectedDevice = connectedDevices.find(d => d.id === deviceId);
    if (connectedDevice) {
      Alert.alert(
        'Connection Successful',
        `Connected to ${connectedDevice.name || 'device'}.`,
        [
          { text: 'Explore Services', onPress: () => handleExploreServices(deviceId) },
          { text: 'OK' }
        ]
      );
    }
  };

  // Handle service discovery
  const handleExploreServices = async (deviceId: string) => {
    const services = await discoverServices(deviceId);
    if (services) {
      console.log('Services discovered:', services);
      // You could navigate to a device detail screen here
    }
  };

  // Render device item
  const renderDeviceItem = ({ item }: { item: { id: string; name?: string; rssi?: number } }) => {
    const isConnected = connectedDevices.some(d => d.id === item.id);
    
    return (
      <View style={styles.deviceItem}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <Text style={styles.deviceId}>ID: {item.id}</Text>
          <Text style={styles.deviceDetails}>
            Signal: {item.rssi ? `${item.rssi} dBm` : 'N/A'}
          </Text>
          {isConnected && (
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.actionButton, isConnected ? styles.disconnectButton : styles.connectButton]}
          onPress={() => isConnected 
            ? disconnectFromDevice(item.id) 
            : handleConnect(item.id)
          }
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Processing...' : isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Empty state message
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {isScanning ? 'Searching for devices...' : 'No devices found'}
      </Text>
      {!isScanning && (
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={startScanning}
          disabled={!hasPermission || isLoading}
        >
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Create a merged and deduplicated list of devices
  const getDeviceList = () => {
    // First add all connected devices
    const deviceMap = new Map();
    
    // Add connected devices first (they have priority)
    connectedDevices.forEach(device => {
      deviceMap.set(device.id, {
        id: device.id,
        name: device.name || 'Unknown Device',
        rssi: device.rssi ?? undefined,
        isConnected: true
      });
    });
    
    // Then add discovered devices that aren't already connected
    devices.forEach(device => {
      if (!deviceMap.has(device.id)) {
        deviceMap.set(device.id, {
          id: device.id,
          name: device.name || 'Unknown Device',
          rssi: device.rssi ?? undefined,
          isConnected: false
        });
      }
    });
    
    // Convert map to array
    return Array.from(deviceMap.values());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calder Devices</Text>
      </View>

      {/* Permission warning */}
      {!hasPermission && (
        <View style={styles.permissionWarning}>
          <Text style={styles.permissionText}>Bluetooth permission required</Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={checkPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scanning indicator */}
      {isScanning && (
        <View style={styles.scanningIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.scanningText}>Scanning for devices...</Text>
        </View>
      )}

      {/* Device list */}
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={getDeviceList()}
        renderItem={({ item }) => {
          const isConnected = item.isConnected;
          
          return (
            <View style={styles.deviceItem}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>ID: {item.id}</Text>
                <Text style={styles.deviceDetails}>
                  Signal: {item.rssi ? `${item.rssi} dBm` : 'N/A'}
                </Text>
                {isConnected && (
                  <View style={styles.connectedBadge}>
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={[styles.actionButton, isConnected ? styles.disconnectButton : styles.connectButton]}
                onPress={() => isConnected 
                  ? disconnectFromDevice(item.id) 
                  : handleConnect(item.id)
                }
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Processing...' : isConnected ? 'Disconnect' : 'Connect'}
                </Text>
                <Text>
                </Text>
              </TouchableOpacity>
            </View>

          );
        }}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isScanning}
            onRefresh={startScanning}
            colors={['#007AFF']}
          />
        }
      />

      {/* Floating action button */}
      <TouchableOpacity 
        style={[styles.fab, isScanning ? styles.stopFab : styles.scanFab]} 
        onPress={isScanning ? stopScanning : startScanning}
        disabled={!hasPermission || isLoading}
      >
        <Text style={styles.fabText}>
          {isScanning ? 'Stop' : 'Scan'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ff5252',
    padding: 12,
  },
  permissionText: {
    color: 'white',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  permissionButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#e3f2fd',
  },
  scanningText: {
    marginLeft: 8,
    color: '#0d47a1',
  },
  listContainer: {
    flexGrow: 1,
    padding: 12,
  },
  deviceItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  deviceDetails: {
    fontSize: 12,
    color: '#888',
  },
  connectedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  connectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#2196f3',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanFab: {
    backgroundColor: '#2196f3',
  },
  stopFab: {
    backgroundColor: '#f44336',
  },
  fabText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginVertical: 16,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 8,
  }
});

export default Home;