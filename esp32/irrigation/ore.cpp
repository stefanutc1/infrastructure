#include <WiFi.h>
#include <time.h>

const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// time configuration (utc+2 for winter, utc+3 for summer, Bucharest)
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0;       
const int   daylightOffset_sec = 0;

// timezone string for Bucharest, Romania
const char* timezone = "EET-2EEST,M3.5.0/3,M10.5.0/4"; 

const int RELAY_PIN = 23;              
const int WATERING_DURATION_SEC = 60;  

// schedule of watering
const int wateringHours[] = {2, 5, 23};   // watering at 2:00 AM, 5:00 AM and 11:00PM because of the water pression in my city
const int numSchedules = sizeof(wateringHours) / sizeof(wateringHours[0]);

bool wateringToday[numSchedules] = {false}; 

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); 

  Serial.printf("Connecting to Wi-Fi: %s\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi!");

  configTzTime(timezone, ntpServer);

  Serial.println("Synchronizing time via NTP...");
  struct tm timeinfo;
  while(!getLocalTime(&timeinfo)){
    Serial.println("Waiting for time synchronization...");
    delay(1000);
  }
  Serial.println("Time synchronized successfully!");
}

void loop() {
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Error obtaining time!");
    delay(5000);
    return;
  }

  int currentHour = timeinfo.tm_hour;
  int currentMin  = timeinfo.tm_min;
  int currentSec  = timeinfo.tm_sec;

  if (currentHour == 0 && currentMin == 0) {
    for (int i = 0; i < numSchedules; i++) {
      wateringToday[i] = false;
    }
  }

  for (int i = 0; i < numSchedules; i++) {
    if (currentHour == wateringHours[i] && currentMin == 0 && !wateringToday[i]) {
      Serial.printf("Scheduled watering started for %02d:00!\n", wateringHours[i]);
      
      startWatering(WATERING_DURATION_SEC);
      
      wateringToday[i] = true; 
    }
  }

  if (currentSec == 0) {
    Serial.printf("Current time in Romania: %02d:%02d:%02d\n", currentHour, currentMin, currentSec);
    delay(1000);
  }

  delay(500);
}

void startWatering(int durationSeconds) {
  digitalWrite(RELAY_PIN, HIGH); 
  Serial.println("Pump is ON.");

  delay(durationSeconds * 1000); 

  digitalWrite(RELAY_PIN, LOW); 
  Serial.println("Pump is OFF.");
}
