# Datasheet Analysis Report: Semiconductor Knowledge Graph

## 1. Executive Summary
- **Target File**: `data/raw/microcontroller_soc_datasheet.csv`
- **File Format**: CSV (Comma-Separated Values, UTF-8 encoded)
- **Domain**: Semiconductor Microcontrollers, Wireless SoCs, Hardware Security Elements, and Precision MEMS Sensors.
- **Total Records (Rows)**: 10 representative industrial component specifications
- **Total Fields (Columns)**: 18 structured columns
- **Duplicate Rows**: 0 (Clean, uniquely indexed records)
- **Data Quality / Completeness**: 100% complete records across all core parameters.

---

## 2. Field Schema & Data Types

| Field Name | Type | Sample Value | Description |
| :--- | :--- | :--- | :--- |
| `part_number` | String (Unique Key) | `ESP32-S3-WROOM-1` | Industry-standard commercial part identifier |
| `component_name` | String | `Espressif ESP32-S3 Dual-Core AI SoC` | Full descriptive engineering component title |
| `category` | Categorical | `Microcontroller`, `Wireless SoC`, `MEMS Sensor` | Functional semiconductor category |
| `manufacturer` | Categorical | `Espressif Systems`, `STMicroelectronics` | Original Equipment Manufacturer / Fabless vendor |
| `core_architecture` | Text / Specs | `Dual-core 32-bit Xtensa LX7`, `Arm Cortex-M7` | Processor ALU or transducer transducer core |
| `max_clock_mhz` | Integer | `240`, `480`, `64`, `0` | Peak operating clock frequency (0 for sensors/HSMs) |
| `flash_memory_kb` | Integer | `8192`, `2048`, `1024` | On-chip or in-package non-volatile storage |
| `sram_kb` | Integer | `512`, `1024`, `256` | On-chip static RAM capacity |
| `operating_voltage_min_v` | Float | `1.71`, `3.0` | Minimum reliable operating voltage |
| `operating_voltage_max_v` | Float | `3.6`, `5.5` | Maximum recommended operating voltage |
| `active_current_ma` | Float | `68.0`, `220.0`, `3.9` | Active power consumption at nominal clock |
| `sleep_current_ua` | Float | `5.0`, `0.15`, `0.05` | Deep sleep / standby leakage current |
| `supported_protocols` | Multi-value String | `Wi-Fi 802.11 b/g/n, BLE 5.0, SPI, I2C` | Peripheral bus and wireless communication standards |
| `package_type` | Categorical String | `QFN-56 (7x7mm)`, `LQFP-144` | Physical IC package footprint and form factor |
| `operating_temp_range_c`| Categorical String | `-40°C to +85°C`, `-40°C to +125°C`| Industrial/automotive rated temperature window |
| `compatible_companion_chips` | Multi-value String | `BME688-MEMS, ATECC608A-TNGTLS` | Interoperable companion ICs & sensors |
| `target_applications` | Multi-value String | `Edge AI Vision & Voice, Industrial IoT` | Domain deployment verticals |
| `errata_and_operational_notes` | Rich Text | Silicon errata, bypass caps, startup errata | Critical electrical design considerations & errata |

---

## 3. Candidate Knowledge Graph Model

### Entity Classifications (61 Total Nodes)
1. **Component (10 Nodes)**: `ESP32-S3-WROOM-1`, `STM32H743ZI`, `BME688-MEMS`, `ATECC608A-TNGTLS`, `nRF52840`, `STM32U585`, `CC2652R`, `MAX32666`, `RP2040`, `SX1262-LORA`.
2. **Manufacturer (9 Nodes)**: `Espressif Systems`, `STMicroelectronics`, `Bosch Sensortec`, `Microchip Technology`, `Nordic Semiconductor`, `Texas Instruments`, `Analog Devices`, `Raspberry Pi Ltd`, `Semtech Corporation`.
3. **CoreArchitecture (10 Nodes)**: `Dual-core 32-bit Xtensa LX7`, `32-bit Arm Cortex-M7 with DP-FPU`, `MEMS Metal-Oxide Gas Transducer with ASIC`, `Hardware Cryptographic Engine with Secure EEPROM`, `32-bit Arm Cortex-M4F with FPU`, `32-bit Arm Cortex-M33 with TrustZone`, `32-bit Arm Cortex-M4F + Sensor Controller Engine`, `Dual-core Arm Cortex-M4F with FPU + BLE 5.2`, `Dual-core 32-bit Arm Cortex-M0+`, `LoRa Chirp Spread Spectrum & (G)FSK RF Modulator`.
4. **Hardware Communication Protocol (32 Nodes)**: `Wi-Fi 802.11 b/g/n`, `BLE 5.0`, `BLE 5.2`, `BLE 5.3`, `SPI`, `I2C`, `UART`, `CAN-FD`, `Ethernet 10/100`, `USB-OTG`, `SAI`, `Single-Wire Interface (SWI)`, `Thread`, `Zigbee`, `NFC`, `USB 2.0`, `USB-C FS`, `Sub-1GHz`, `1-Wire`, `USB-FS`, `USB 1.1`, `PIO`, `LoRa Chirp Spread Spectrum`, `FSK Modulator`, `QSPI Flash Bus`, `JTAG IEEE 1149.1`, `SWD Arm Serial Wire`, `I2S Digital Audio`, `DVP Camera Parallel Interface`, `MIPI-CSI2`, `LIN Automotive Bus`, `Modbus RTU`.

### Relational Edge Semantics (97 Total Edges)
- `(Component) -[:MANUFACTURED_BY]-> (Manufacturer)` (10 Edges)
- `(Component) -[:POWERED_BY_CORE]-> (CoreArchitecture)` (10 Edges)
- `(Component) -[:COMMUNICATES_VIA]-> (Protocol)` (50 Edges)
- `(Component) -[:COMPATIBLE_WITH]-> (Component)` (27 Edges across verified companion chip pairings)
