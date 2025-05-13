#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "abcd1234-ab12-cd34-ef56-1234567890ab"

// Define onboard LED pin (usually GPIO 2 for blue LED on many ESP32 boards)
#define LED_PIN 2

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    // Turn on the onboard blue LED when device connects
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Device connected.");
  }

  void onDisconnect(BLEServer *pServer)
  {
    digitalWrite(LED_PIN, LOW);
    Serial.println("Device disconnected.");

    // Restart advertising so that new devices can find it again
    BLEDevice::startAdvertising();
    Serial.println("Advertising restarted");
  }
};

void setup()
{
  pinMode(LED_PIN, OUTPUT);   // Set onboard LED pin as output
  digitalWrite(LED_PIN, LOW); // Initially turn off the LED

  Serial.begin(115200);
  delay(1000); // Let power stabilize
  Serial.println("Starting Simple BLE Server...");

  // Initialize BLE
  BLEDevice::init("ESP32-Test");

  // Create BLE server with custom callbacks for connection events
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create BLE service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create characteristic
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE);
  pCharacteristic->setValue("Hello BLE");

  // Start service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  BLEDevice::startAdvertising();

  Serial.println("BLE Server is up and advertising");
}

void loop()
{
  // Nothing needed in the loop
}
