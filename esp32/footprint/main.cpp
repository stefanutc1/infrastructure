#include <WiFi.h>
#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>
#include "config.h"

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

int getFingerprintID();

void setup() {
  Serial.begin(115200);
  
  pinMode(RELAY_GATE_PIN, OUTPUT);
  digitalWrite(RELAY_GATE_PIN, LOW); 

  mySerial.begin(57600, SERIAL_8N1, FINGERPRINT_RX, FINGERPRINT_TX);
  
  Serial.println("\nInitializing Fingerprint Gate Scanner...");
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Fingerprint sensor found and connected successfully!");
  } else {
    Serial.println("Did not find fingerprint sensor : Check wiring!");
    while (1) {
      delay(1);
    }
  }

  finger.getParameters();
  Serial.print("Sensor capacity: "); Serial.println(finger.capacity);
}

void loop() {
  int fingerprintID = getFingerprintID();

  if (fingerprintID >= 0) {
    Serial.print("Access Granted! Authorized Finger ID #");
    Serial.println(fingerprintID);

    digitalWrite(RELAY_GATE_PIN, HIGH);
    delay(GATE_PULSE_MS);
    digitalWrite(RELAY_GATE_PIN, LOW);
    
    Serial.println("Gate closing relay reset.");
  }

  delay(50);
}
