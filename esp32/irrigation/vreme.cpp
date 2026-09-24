#include <Arduino.h>

bool isRaining();

class WeatherManager {
public:
    void init() {
        Serial.println("[WEATHER] Weather manager initialized.");
    }

    bool shouldSkipWatering() {
        if (isRaining()) {
            Serial.println("[WEATHER] Rain detected! Skipping scheduled watering.");
            return true;
        }
        
        return false;
    }
};

WeatherManager weatherManager;
