/*
 * ==============================================================================
 * KHETMITRA — SMART CROP PROTECTION SYSTEM
 * ESP32 Microcontroller Firmware (Arduino C++)
 * ==============================================================================
 * Description:
 *   Four-directional perimeter monitoring firmware for ESP32.
 *   Monitors 4 PIR / microwave motion sensors on North, East, South, and West
 *   boundaries. Upon detection, coordinates localized acoustic (PWM piezo)
 *   and optical (high-luminosity strobe) deterrents, publishes telemetry to
 *   the KhetMitra cloud backend (Supabase / REST API), and maintains an edge-
 *   autonomous failsafe even during network downtime.
 *
 * Microcontroller: ESP32-WROOM-32 (Dual Core 240MHz, 3.3V Logic)
 * Author: KhetMitra Engineering Team
 * Target Platform: College Engineering Capstone / Physical Demonstration
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// -----------------------------------------------------------------------------
// 1. HARDWARE PIN DEFINITIONS
// -----------------------------------------------------------------------------
#define PIN_PIR_NORTH     13  // North Boundary PIR (Digital Input)
#define PIN_PIR_EAST      12  // East Canal Boundary PIR / Radar (Digital Input)
#define PIN_PIR_SOUTH     14  // South Riverbed PIR (Digital Input)
#define PIN_PIR_WEST      27  // West Toolshed PIR (Digital Input)

#define PIN_BUZZER_PWM    26  // Field Piezo Siren / Ultrasonic Driver (PWM)
#define PIN_STROBE_RELAY  25  // Scarecrow Strobe Spotlight (MOSFET / Relay)
#define PIN_LDR_ADC       34  // Ambient Light Sensor (Analog ADC1_CH6)
#define PIN_BATTERY_SENSE 35  // Solar Battery Voltage Divider (ADC1_CH7)
#define PIN_STATUS_LED     2  // Onboard Heartbeat LED

// -----------------------------------------------------------------------------
// 2. PWM & TIMER CONFIGURATION
// -----------------------------------------------------------------------------
#define PWM_CHANNEL       0
#define PWM_RESOLUTION    8     // 8-bit resolution (0 - 255)
#define PWM_FREQ_SIREN    2800  // 2.8 kHz resonant piezo frequency
#define HEARTBEAT_MS      10000 // Send heartbeat telemetry every 10 seconds
#define COOLDOWN_MS       15000 // 15s re-trigger cooldown per sector

// -----------------------------------------------------------------------------
// 3. NETWORK & CLOUD BACKEND CREDENTIALS
// -----------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASS     = "YOUR_WIFI_PASSWORD";
const char* SUPABASE_URL  = "https://YOUR_PROJECT_ID.supabase.co/rest/v1";
const char* SUPABASE_KEY  = "YOUR_SUPABASE_ANON_KEY";

// -----------------------------------------------------------------------------
// 4. VOLATILE INTERRUPT FLAGS
// -----------------------------------------------------------------------------
volatile bool motionDetectedNorth = false;
volatile bool motionDetectedEast  = false;
volatile bool motionDetectedSouth = false;
volatile bool motionDetectedWest  = false;

unsigned long lastNorthTrigger = 0;
unsigned long lastEastTrigger  = 0;
unsigned long lastSouthTrigger = 0;
unsigned long lastWestTrigger  = 0;
unsigned long lastHeartbeat    = 0;

// Operating state
bool isArmed = true;
bool autoDeterrent = true;

// -----------------------------------------------------------------------------
// 5. INTERRUPT SERVICE ROUTINES (ISRs)
// -----------------------------------------------------------------------------
void IRAM_ATTR isrNorth() {
  if (millis() - lastNorthTrigger > 3000) {
    motionDetectedNorth = true;
    lastNorthTrigger = millis();
  }
}

void IRAM_ATTR isrEast() {
  if (millis() - lastEastTrigger > 3000) {
    motionDetectedEast = true;
    lastEastTrigger = millis();
  }
}

void IRAM_ATTR isrSouth() {
  if (millis() - lastSouthTrigger > 3000) {
    motionDetectedSouth = true;
    lastSouthTrigger = millis();
  }
}

void IRAM_ATTR isrWest() {
  if (millis() - lastWestTrigger > 3000) {
    motionDetectedWest = true;
    lastWestTrigger = millis();
  }
}

// -----------------------------------------------------------------------------
// 6. DETERRENT CONTROL ROUTINES
// -----------------------------------------------------------------------------
void playSweptSiren(int durationMs, int startFreq, int endFreq) {
  unsigned long start = millis();
  while (millis() - start < (unsigned long)durationMs) {
    for (int freq = startFreq; freq <= endFreq; freq += 40) {
      ledcWriteTone(PIN_BUZZER_PWM, freq);
      delay(8);
    }
    for (int freq = endFreq; freq >= startFreq; freq -= 40) {
      ledcWriteTone(PIN_BUZZER_PWM, freq);
      delay(8);
    }
  }
  ledcWrite(PIN_BUZZER_PWM, 0); // Silence
}

void flashStrobe(int durationMs, int flashIntervalMs) {
  unsigned long start = millis();
  bool state = false;
  while (millis() - start < (unsigned long)durationMs) {
    state = !state;
    digitalWrite(PIN_STROBE_RELAY, state ? HIGH : LOW);
    delay(flashIntervalMs);
  }
  digitalWrite(PIN_STROBE_RELAY, LOW);
}

void executeDeterrent(const char* sector) {
  Serial.printf("[DETERRENT] Activating acoustic & optical countermeasures for %s Sector!\n", sector);
  digitalWrite(PIN_STROBE_RELAY, HIGH);
  playSweptSiren(5000, 2200, 3600);
  digitalWrite(PIN_STROBE_RELAY, LOW);
}

// -----------------------------------------------------------------------------
// 7. CLOUD TELEMETRY TRANSMITTER
// -----------------------------------------------------------------------------
void transmitAlert(const char* sector, const char* sensorId, const char* animalType, const char* severity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[CLOUD] WiFi offline. Executing edge-autonomous response.");
    return;
  }

  HTTPClient http;
  String endpoint = String(SUPABASE_URL) + "/field_alerts";
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);

  StaticJsonDocument<300> doc;
  doc["side"] = sector;
  doc["sensor_id"] = sensorId;
  doc["animal"] = animalType;
  doc["threat_level"] = "High";
  doc["severity"] = severity;
  doc["status"] = "New";
  doc["deterrent_action"] = "Autonomous Swept Siren (85dB) + Strobe for 5s";
  doc["deterrent_success"] = true;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  Serial.printf("[CLOUD] Dispatched alert for %s (HTTP Response: %d)\n", sector, httpCode);
  http.end();
}

void transmitHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  float batteryVoltage = (analogRead(PIN_BATTERY_SENSE) / 4095.0) * 2.0 * 3.3 * 1.1; // Voltage divider 1:1
  int lightLevel = analogRead(PIN_LDR_ADC);

  HTTPClient http;
  String endpoint = String(SUPABASE_URL) + "/device_telemetry";
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);

  StaticJsonDocument<256> doc;
  doc["device_id"] = "ESP32_CENTRAL_01";
  doc["status"] = "online";
  doc["battery_voltage"] = batteryVoltage;
  doc["core_temp_c"] = temperatureRead();
  doc["free_heap_bytes"] = ESP.getFreeHeap();
  doc["wifi_rssi_dbm"] = WiFi.RSSI();
  doc["operating_mode"] = isArmed ? "ARMED" : "DISARMED";

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  Serial.printf("[HEARTBEAT] Ping sent. Battery: %.2fV, Light: %d (HTTP %d)\n", batteryVoltage, lightLevel, httpCode);
  http.end();
}

// -----------------------------------------------------------------------------
// 8. SETUP & INITIALIZATION
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=========================================");
  Serial.println("  KHETMITRA — SMART CROP PROTECTION SYSTEM");
  Serial.println("  ESP32 Central Gateway Firmware v1.2.0");
  Serial.println("=========================================");

  // Pin Configuration
  pinMode(PIN_PIR_NORTH, INPUT_PULLDOWN);
  pinMode(PIN_PIR_EAST, INPUT_PULLDOWN);
  pinMode(PIN_PIR_SOUTH, INPUT_PULLDOWN);
  pinMode(PIN_PIR_WEST, INPUT_PULLDOWN);
  pinMode(PIN_STROBE_RELAY, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STROBE_RELAY, LOW);

  // Setup PWM Piezo Driver on ESP32 LEDC Channel 0
  ledcAttach(PIN_BUZZER_PWM, PWM_FREQ_SIREN, PWM_RESOLUTION);

  // Attach Hardware Interrupts for Millisecond Detection
  attachInterrupt(digitalPinToInterrupt(PIN_PIR_NORTH), isrNorth, RISING);
  attachInterrupt(digitalPinToInterrupt(PIN_PIR_EAST),  isrEast,  RISING);
  attachInterrupt(digitalPinToInterrupt(PIN_PIR_SOUTH), isrSouth, RISING);
  attachInterrupt(digitalPinToInterrupt(PIN_PIR_WEST),  isrWest,  RISING);

  // Startup Test Beep & Blink
  digitalWrite(PIN_STATUS_LED, HIGH);
  ledcWriteTone(PIN_BUZZER_PWM, 2400);
  delay(150);
  ledcWrite(PIN_BUZZER_PWM, 0);
  digitalWrite(PIN_STATUS_LED, LOW);

  // Initialize WiFi
  Serial.printf("[WIFI] Connecting to %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! IP: %s (RSSI: %d dBm)\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    Serial.println("\n[WIFI] Network not reachable. Running in standalone autonomous edge mode.");
  }
}

// -----------------------------------------------------------------------------
// 9. MAIN CONTROL LOOP
// -----------------------------------------------------------------------------
void loop() {
  // Check North Sector
  if (motionDetectedNorth) {
    motionDetectedNorth = false;
    Serial.println("[ALERT] NORTH SECTOR BREACH DETECTED!");
    if (isArmed) {
      if (autoDeterrent) executeDeterrent("North");
      transmitAlert("North", "PIR-N01", "Wild boar", "high");
    }
  }

  // Check East Sector
  if (motionDetectedEast) {
    motionDetectedEast = false;
    Serial.println("[ALERT] EAST SECTOR BREACH DETECTED!");
    if (isArmed) {
      if (autoDeterrent) executeDeterrent("East");
      transmitAlert("East", "PIR-E02", "Wild boar", "high");
    }
  }

  // Check South Sector
  if (motionDetectedSouth) {
    motionDetectedSouth = false;
    Serial.println("[ALERT] SOUTH SECTOR BREACH DETECTED!");
    if (isArmed) {
      if (autoDeterrent) executeDeterrent("South");
      transmitAlert("South", "PIR-S03", "Nilgai (Blue Bull)", "high");
    }
  }

  // Check West Sector
  if (motionDetectedWest) {
    motionDetectedWest = false;
    Serial.println("[ALERT] WEST SECTOR BREACH DETECTED!");
    if (isArmed) {
      if (autoDeterrent) executeDeterrent("West");
      transmitAlert("West", "PIR-W04", "Possible movement", "low");
    }
  }

  // Periodic Telemetry Heartbeat
  if (millis() - lastHeartbeat > HEARTBEAT_MS) {
    lastHeartbeat = millis();
    digitalWrite(PIN_STATUS_LED, HIGH);
    transmitHeartbeat();
    digitalWrite(PIN_STATUS_LED, LOW);
  }

  delay(20); // Small loop yield for RTOS watchdog
}
