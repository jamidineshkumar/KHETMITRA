# KhetMitra — Hardware Engineering & Wiring Reference
## Smart Crop Protection System — ESP32 Field Gateway

This technical reference provides the complete circuit schematics, pin mappings, Bill of Materials (BOM), and assembly instructions for constructing physical KhetMitra field gateway hardware.

---

## 1. System Block Diagram & Architecture

```
                       +-----------------------------+
                       |   10W Solar Panel (18V)     |
                       +--------------+--------------+
                                      |
                       +--------------v--------------+
                       | TP5100 / MPPT 2A Charger    |
                       +--------------+--------------+
                                      |
                       +--------------v--------------+
                       | 3.7V Li-ion (18650 x 2)     |
                       +--------------+--------------+
                                      |
                               +------v-------+
                               | 5V/3.3V LDO  |
                               +------+-------+
                                      |
      +-------------------------------+-------------------------------+
      |                                                               |
+-----v-------+  GPIO 13 (North)   +--------------------+   GPIO 26   +-----v-------+
| North PIR   +-------------------->                    +-------------> Piezo Siren |
| (HC-SR501)  |                    |                    |   (LEDC PWM)| (2.8 kHz)   |
+-------------+  GPIO 12 (East)    |                    +-------------+-------------+
| East Radar  +-------------------->                    |
| (RCWL-0516) |                    |  ESP32-WROOM-32    |   GPIO 25   +-------------+
+-------------+  GPIO 14 (South)   |  Master Microhub   +-------------> 12V Strobe  |
| South PIR   +-------------------->  (Dual Core 240MHz)+----> Relay  | Spotlight   |
| (HC-SR501)  |                    |                    |             +-------------+
+-------------+  GPIO 27 (West)    |                    |
| West PIR    +-------------------->                    |             +-------------+
| (HC-SR501)  |                    |                    +-- 2.4GHz WiFi| Supabase /  |
+-------------+                    +--------------------+   WebSockets| KhetMitra UI|
                                                                      +-------------+
```

---

## 2. Complete ESP32 GPIO Pin Connection Table

| ESP32 Pin | Connected Component | Signal Type | Electrical Specification | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **GPIO 13** | North Sector PIR (HC-SR501) | Digital Input | 3.3V Logic, Active HIGH | Detects animal intrusions on North boundary |
| **GPIO 12** | East Sector Radar (RCWL-0516) | Digital Input | 3.3V Logic, Active HIGH | Microwave motion detection through canal foliage |
| **GPIO 14** | South Sector PIR (HC-SR501) | Digital Input | 3.3V Logic, Active HIGH | Detects movements across riverbed fence |
| **GPIO 27** | West Sector PIR (HC-SR501) | Digital Input | 3.3V Logic, Active HIGH | Detects intrusions near storage shed and yard |
| **GPIO 26** | Piezo Buzzer / Siren Driver | PWM Output | 0–3.3V PWM (2.4–3.6 kHz) | Swept acoustic deterrent to frighten wild boars |
| **GPIO 25** | Scarecrow Strobe Spotlight | Digital Output | 3.3V Logic (Triggers Relay) | High-intensity optical flash to disorient nocturnal pests |
| **GPIO 34** | Ambient Light Sensor (LDR) | Analog Input | 0–3.3V (ADC1_CH6) | Automatic dusk-to-dawn mode detection |
| **GPIO 35** | Battery Voltage Monitor | Analog Input | 0–3.3V via 100k/100k Divider | Monitors Li-ion battery health & solar charge state |
| **GPIO 4**  | DHT22 Climate Sensor | Bidirectional | Single-bus with 4.7kΩ pullup | Records ambient field temperature and humidity |
| **3V3 / GND**| Sensor Power Rails | Power | Regulated 3.3V DC | Common ground and regulated power supply |

---

## 3. High-Power Actuator Driver Circuits

### A. Piezo Siren Driver (GPIO 26)
Because the ESP32 GPIO can only sink/source ~12mA, an NPN transistor (2N2222) is used:

```
+5V / +12V Rail -----------------------+
                                       |
                                  [+ Piezo Siren -]
                                       |
                                       +---------+
                                       |         | (1N4007 Flyback Diode)
                                       |      [ |< ]
                                       |         |
                                       +---------+
                                       |
                             Collector |
  ESP32 GPIO 26 ----- [ 1k Resistor ] -+- Base  (2N2222 NPN)
                                       |
                              Emitter  |
GND -----------------------------------+
```

### B. Scarecrow 12V LED Spotlight Driver (GPIO 25)
Operated via an optocoupled 5V relay module or an IRFZ44N N-channel logic-level MOSFET:

```
+12V Battery Rail --------------------+
                                      |
                                [+ 12V LED Array -]
                                      |
                               Drain  |
  ESP32 GPIO 25 ----- [ 220R ] -------+- Gate  (IRFZ44N MOSFET)
                                      |
       GND ---------- [ 10k Pull-down]+
                                      |
                               Source |
GND ----------------------------------+
```

---

## 4. Bill of Materials (BOM) & Approximate Project Cost

| Component | Quantity | Description | Estimated Cost (INR) |
| :--- | :---: | :--- | :--- |
| **ESP32-WROOM-32 Development Board** | 1 | 38-pin or 30-pin microcontroller | ₹350 – ₹450 |
| **HC-SR501 PIR Motion Sensors** | 3 | Directional infrared sensors with Fresnel lenses | ₹240 (3 x ₹80) |
| **RCWL-0516 Doppler Radar Sensor** | 1 | 3GHz microwave motion detector (East sector) | ₹90 |
| **12V High-Luminosity LED Strobe / Spotlight**| 1 | 10W waterproof COB / motorcycle auxiliary LED | ₹180 |
| **High-Decibel Piezo Transducer Siren** | 1 | 110dB active/passive buzzer | ₹120 |
| **5V 1-Channel Relay Module (Optocoupled)** | 1 | High-current isolation switch | ₹60 |
| **LDR Photoresistor (5mm) + 10k Resistor** | 1 | Ambient dusk/dawn daylight detector | ₹20 |
| **TP5100 2A Solar Li-ion Charge Controller** | 1 | Solar battery charging management | ₹90 |
| **18650 Li-ion Batteries (2600mAh each)** | 2 | Rechargeable energy storage | ₹300 |
| **10W 18V Monocrystalline Solar Panel** | 1 | Weatherproof field solar panel | ₹550 |
| **Weatherproof IP65 Enclosure Box** | 1 | ABS electrical junction box | ₹180 |
| **Total Estimated Hardware Cost** | | | **~₹2,180** |

---

## 5. Firmware Flashing Guide

1. Download and install the [Arduino IDE](https://www.arduino.cc/en/software) (version 2.0+).
2. Go to **File → Preferences** and paste into *Additional Board Manager URLs*:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Go to **Tools → Board → Boards Manager**, search for `esp32`, and click **Install**.
4. Install the required libraries via **Sketch → Include Library → Manage Libraries**:
   - `ArduinoJson` (v6.x or v7.x)
5. Open `hardware/esp32_firmware/khetmitra_esp32.ino`.
6. Select your board under **Tools → Board → ESP32 Arduino → ESP32 Dev Module**.
7. Connect your ESP32 board via micro-USB, select the COM port, and click **Upload**.
8. Open the Serial Monitor at **115200 baud** to view real-time heartbeat and directional detection logs.
