#include "logger.h"

void initLogger() {
    Serial.println("[LOGGER] Logging subsystem initialized.");
}

void logEvent(const String& message) {
    String timestampedLog = "[LOG] " + message;
    Serial.println(timestampedLog);
}

void logWateringEvent(int sector, int durationMinutes) {
    String msg = "Sector " + String(sector) + " watered for " + String(durationMinutes) + " minutes.";
    logEvent(msg);
}
