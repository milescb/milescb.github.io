# IoT Plant and Environment Monitor

## Overview

A complete IoT system for monitoring home environment and plant moisture levels, hosted at [crabdance.milescb.com](https://crabdance.milescb.com/). The project combines embedded systems, web development, and backend services to create a real-time monitoring solution running on a Raspberry Pi Zero 2W with ESP8266-based sensor nodes.

## Motivation

Home plant care and environmental monitoring require consistent attention and manual measurement. This project automates the monitoring process, providing real-time data visualization and historical tracking accessible from anywhere via the web. The system demonstrates practical applications of IoT architecture, including sensor networks, message queuing protocols, database management, and web service deployment.

## System Architecture

### Hardware Components

**Raspberry Pi Zero 2W Server:**
- Hosts the website using nginx web server
- Runs Flask-based REST API for database queries (served via Gunicorn)
- Manages MQTT broker for sensor data collection
- Stores historical data in SQLite database

**ESP8266 Sensor Nodes:**
- DHT sensor for temperature and humidity measurements
- CD4051BE multiplexer with capacitive moisture sensors
- WiFi connectivity for MQTT message publishing
- Custom Arduino library ([PlantMonitor](https://github.com/milescb/PlantMonitor)) for sensor integration

### Software Stack

**Frontend:**
- Responsive web interface with light/dark mode support
- Real-time data visualization using JavaScript
- Chart.js for moisture history graphs
- Mobile-friendly design

**Backend:**
- Python services for MQTT subscription and database management
- Gunicorn WSGI server with gevent workers for API endpoints
- SQLite database for efficient time-series data storage
- systemd integration for reliable service management

**Networking:**
- nginx reverse proxy for secure HTTPS traffic
- Cloudflare Tunnel for secure external access without port forwarding
- SSL/TLS certificates via Let's Encrypt (for non-Cloudflare deployments)
- MQTT protocol for lightweight sensor communication

## Technical Implementation

### Sensor Network

The ESP8266 nodes use the custom PlantMonitor library to interface with multiple sensors:
- **Analog multiplexing:** CD4051BE allows reading up to 8 capacitive moisture sensors through a single analog input
- **Address selection:** Three digital GPIO pins control which sensor is actively being read
- **Calibration system:** Configurable wet/dry thresholds for accurate moisture percentage calculation
- **MQTT publishing:** Periodic transmission of sensor readings to the central broker

### Data Pipeline

1. **Data Collection:** ESP8266 sensors publish readings to MQTT topics
2. **Data Ingestion:** Python subscriber service listens to MQTT broker and writes to SQLite
3. **Data Storage:** Time-series data stored with timestamps and sensor identifiers
4. **Data Retrieval:** REST API queries database and serves JSON responses
5. **Data Visualization:** Frontend JavaScript fetches API data and renders charts/displays

### Deployment Configuration

The system supports two deployment options:

**Free Domain with Port Forwarding:**
- Uses FreeDNS for free subdomain registration
- Forwards ports 80 and 443 on home router
- Configures nginx with SSL certificates from certbot
- Includes security hardening (fail2ban, ufw firewall)

**Cloudflare Tunnel (Recommended):**
- Purchases domain through Cloudflare registrar
- Sets up Cloudflare Tunnel on Raspberry Pi
- Eliminates need for port forwarding
- Provides DDoS protection and enhanced security

## Key Features

- **Real-time Monitoring:** Live temperature, humidity, and plant moisture levels
- **Historical Data:** Track environmental trends over time with interactive charts
- **Multi-plant Support:** Configure and monitor multiple plants simultaneously
- **Responsive Design:** Optimized for desktop and mobile viewing
- **Theme Support:** Light and dark mode for comfortable viewing
- **Low Power:** Efficient ESP8266 nodes with configurable sleep modes
- **Modular Architecture:** Easy to add new sensors or modify plant configurations

## Security Considerations

The project implements multiple security layers:
- SSH key-only authentication (password login disabled)
- Firewall configuration with ufw
- fail2ban integration for intrusion prevention
- HTTPS/TLS encryption for web traffic
- Regular security updates via systemd services
- Network isolation for IoT devices

**Warning:** Port forwarding exposes devices to potential attacks. The Cloudflare Tunnel approach is recommended for enhanced security without exposing home network ports.

## Technical Challenges Solved

1. **Analog Multiplexing:** Overcame ESP8266's single analog input limitation to read multiple moisture sensors
2. **Service Reliability:** Implemented systemd services for automatic restart and system integration
3. **Database Performance:** Optimized SQLite queries for efficient time-series data retrieval
4. **Web Concurrency:** Used Gunicorn with gevent workers to handle multiple simultaneous API requests
5. **Network Security:** Balanced external accessibility with home network security through Cloudflare Tunnel

## Resources

- [Main Website Repository (PiWebsite)](https://github.com/milescb/PiWebsite)
- [Arduino PlantMonitor Library](https://github.com/milescb/PlantMonitor)
- [Live Website](https://crabdance.milescb.com/)
- [Setup Instructions](https://crabdance.milescb.com/pages/info.html)

## Future Enhancements

- Integration with automated watering systems
- Machine learning for plant health prediction
- Email/SMS notifications for critical moisture levels
- Additional sensor types (light levels, soil pH)
- Mobile app development for iOS/Android
