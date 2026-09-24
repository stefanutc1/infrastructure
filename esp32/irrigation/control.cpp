#include <WiFi.h>
#include <time.h>
#include "DHT.h"

const char* ssid     = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

const int RELAY_PIN = 23;     
const int RAIN_PIN  = 34;     
const int DHT_PIN   = 4;      
#define DHTTYPE DHT22         // Change to DHT11 if using DHT11

DHT dht(DHT_PIN, DHTTYPE);

const int NORMAL_INTERVAL_DAYS = 3;          
const unsigned long WATERING_DURATION_MS = 60000; 

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 7200;            // UTC+2 for the Craiova Municipality, Romania (adjust for DST if needed: 10800)
const int   daylightOffset_sec = 3600;

unsigned long lastWateredDay = 0;
bool morningWateringDone = false;

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); 
  pinMode(RAIN_PIN, INPUT);

  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");

  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

void loop() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time from NTP!");
    delay(60000);
    return;
  }

  int rainState = digitalRead(RAIN_PIN);
  if (rainState == LOW) {
    Serial.println("RAIN DETECTED! System halted for safety.");
    digitalWrite(RELAY_PIN, LOW);
    delay(3600000); 
    return;
  }

  float temperature = dht.readTemperature();
  if (isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    temperature = 25.0; 
  }

  int currentHour = timeinfo.tm_hour;
  int currentDayOfYear = timeinfo.tm_yday;

  if (currentHour == 0 && morningWateringDone) {
    morningWateringDone = false;
  }

  bool shouldWater = false;

  if (temperature >= 32.0) {
    if (currentHour == 6 && !morningWateringDone) {
      shouldWater = true;
      morningWateringDone = true;
    } else if (currentHour == 20 && morningWateringDone) {
      shouldWater = true;
      morningWateringDone = false; 
    }
  } else {
    int daysElapsed = (currentDayOfYear >= lastWateredDay) ? 
                      (currentDayOfYear - lastWateredDay) : 
                      (365 - lastWateredDay + currentDayOfYear);

    if (currentHour == 7 && daysElapsed >= NORMAL_INTERVAL_DAYS) {
      shouldWater = true;
      lastWateredDay = currentDayOfYear;
    }
  }

  if (shouldWater) {
    Serial.println("Starting irrigation cycle...");
    digitalWrite(RELAY_PIN, HIGH);
    delay(WATERING_DURATION_MS);
    digitalWrite(RELAY_PIN, LOW);
    Serial.println("Irrigation cycle completed.");
  }

  delay(1800000);
}
