#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>

void initLogger();
void logEvent(const String& message);
void logWateringEvent(int sector, int durationMinutes);

#endif
