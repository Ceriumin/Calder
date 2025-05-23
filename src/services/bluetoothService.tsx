import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import base64 from 'react-native-base64';

// Match the UUIDs from the ESP32 code
const ESP32_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const TEMP_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a1';
const HUMIDITY_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a2';
const ESP32_DEVICE_NAME = 'ESP32-Calder';

class BluetoothService {
  manager: BleManager;
  device: Device | null = null;
  tempSubscription: Subscription | null = null;
  humiditySubscription: Subscription | null = null;
  
  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Bluetooth Permission',
          message: 'The app needs bluetooth permission to connect to your device',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  async scanForDevices(onDeviceFound: (device: Device) => void, timeoutMs = 5000): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Bluetooth permissions not granted');
      }

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          this.manager.stopDeviceScan();
          return;
        }
        
        if (device && device.name === ESP32_DEVICE_NAME) {
          onDeviceFound(device);
        }
      });

      // Stop scan after timeout
      setTimeout(() => {
        this.manager.stopDeviceScan();
      }, timeoutMs);
    } catch (error) {
      console.error('Error starting scan:', error);
      throw error;
    }
  }

  async connectToDevice(device: Device): Promise<Device> {
    try {
      const connectedDevice = await device.connect();
      const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
      this.device = discoveredDevice;
      return discoveredDevice;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.tempSubscription) {
      this.tempSubscription.remove();
      this.tempSubscription = null;
    }
    
    if (this.humiditySubscription) {
      this.humiditySubscription.remove();
      this.humiditySubscription = null;
    }
    
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
    }
  }

  async readTemperature(): Promise<number> {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    try {
      const characteristic = await this.device.readCharacteristicForService(
        ESP32_SERVICE_UUID,
        TEMP_CHAR_UUID
      );
      
      if (characteristic.value) {
        const tempString = base64.decode(characteristic.value);
        return parseFloat(tempString);
      }
      return 0;
    } catch (error) {
      console.error('Error reading temperature:', error);
      throw error;
    }
  }

  async readHumidity(): Promise<number> {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    try {
      const characteristic = await this.device.readCharacteristicForService(
        ESP32_SERVICE_UUID,
        HUMIDITY_CHAR_UUID
      );
      
      if (characteristic.value) {
        const humidityString = base64.decode(characteristic.value);
        return parseFloat(humidityString);
      }
      return 0;
    } catch (error) {
      console.error('Error reading humidity:', error);
      throw error;
    }
  }

  monitorTemperature(onReading: (temp: number) => void): void {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    this.tempSubscription = this.device.monitorCharacteristicForService(
      ESP32_SERVICE_UUID,
      TEMP_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Temperature monitoring error:', error);
          return;
        }
        
        if (characteristic?.value) {
          const tempString = base64.decode(characteristic.value);
          onReading(parseFloat(tempString));
        }
      }
    );
  }

  monitorHumidity(onReading: (humidity: number) => void): void {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    this.humiditySubscription = this.device.monitorCharacteristicForService(
      ESP32_SERVICE_UUID,
      HUMIDITY_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Humidity monitoring error:', error);
          return;
        }
        
        if (characteristic?.value) {
          const humidityString = base64.decode(characteristic.value);
          onReading(parseFloat(humidityString));
        }
      }
    );
  }
}

export default new BluetoothService();
