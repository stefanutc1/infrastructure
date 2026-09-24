#include <Arduino.h>
#include "config.h"

void initGate() {
    pinMode(GATE_RELAY_PIN, OUTPUT);
    digitalWrite(GATE_RELAY_PIN, LOW); 
}

void triggerGate() {
    Serial.println("[GATE] Access granted! Opening gate...");
    digitalWrite(GATE_RELAY_PIN, HIGH); 
    delay(GATE_PULSE_DURATION_MS);      
    digitalWrite(GATE_RELAY_PIN, LOW);  
    Serial.println("[GATE] Gate closed/relocked.");
}
