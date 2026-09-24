#include <Arduino.h>
#include <Adafruit_Fingerprint.h>
#include "config.h"

HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void initFingerprint() {
    mySerial.begin(57800, SERIAL_8N1, FINGERPRINT_RX, FINGERPRINT_TX);
    finger.begin(57600);

    if (finger.verifyPassword()) {
        Serial.println("[SENSOR] Fingerprint sensor found and connected successfully!");
    } else {
        Serial.println("[SENSOR] Did not find fingerprint sensor : Check wiring!");
        while (1) { delay(1); }
    }
}

int getFingerprintID() {
    uint8_t p = finger.getImage();
    if (p != FINGERPRINT_OK) return -1;

    p = finger.image2Tz();
    if (p != FINGERPRINT_OK) return -1;

    p = finger.fastSearch();
    if (p != FINGERPRINT_OK) {
        Serial.println("[SENSOR] Unauthorized fingerprint detected!");
        return -1; // no match found
    }

    // if match found
    Serial.print("[SENSOR] Found ID #"); Serial.print(finger.fingerID);
    Serial.print(" with confidence of "); Serial.println(finger.confidence);
    return finger.fingerID;
}
