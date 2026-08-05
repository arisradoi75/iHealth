# iHealth
🩺 iHealth - Sistem IoT Multi-Tier pentru Monitorizare MedicalăUn sistem distribuit IoT (Internet of Things) conceput pentru achiziția, procesarea și monitorizarea în timp real a parametrilor vitali (ECG, Puls, SpO2, Temperatură). Proiectul adoptă o arhitectură de tip Multi-Tier, integrând o componentă hardware (wearable), un broker de mesaje, un backend scalabil în Cloud și interfețe dedicate pentru pacienți și medici. 

🌟 Funcționalități PrincipaleAchiziție de date Non-Blocantă (Real-Time): Citirea senzorilor folosind task-uri izolate (FreeRTOS) și timere hardware, fără utilizarea funcțiilor blocante (delay()).Filtrarea Datelor (Data Sanitization):
  Sistem integrat la nivel de firmware pentru detectarea deconectării electrozilor ECG (Leads-Off Detection) și validarea datelor înainte de transmisia în rețea.
  Comunicație Hibridă: Utilizarea protocolului MQTT (Publish/Subscribe) pentru un flux continuu și rapid de telemetrie de la senzori, combinat cu REST API securizat (prin HTTPS și JWT) pentru aplicațiile utilizatorilor.
  Sistem de Alerte Inteligente: Evaluarea pragurilor biometrice personalizate per pacient și declanșarea de notificări Push critice via Firebase Cloud Messaging (FCM).
  Dashboard și trasabilitate: Trasabilitatea istoricului medical, generarea de recomandări și monitorizarea vizuală a graficelor ECG.
  
⚙️ Arhitectura Sistemului (Tech Stack)Sistemul este împărțit în patru straturi (Tiers) independente:Edge Tier (Hardware / Firmware):
  Microcontroler: ESP32 / ESP8266 (Dual-Core cu FreeRTOS).
  Senzori: AD8232 (ECG), MAX30100 (Puls & SpO2), BMP280 (Temperatură & Presiune).
  Limbaj: C++ (Arduino IDE) cu parsare de pachete JSON (ArduinoJson).
  Middleware Tier (IoT):Broker MQTT: Eclipse Mosquitto.
  Application Tier (Cloud Backend):
      Framework: Java Spring Boot.
      Securitate: Spring Security cu JSON Web Tokens (JWT).
      Notificări: Integrare API Firebase Cloud Messaging (FCM).
  Data Tier (Bază de date):RDBMS: PostgreSQL (proiectat în Forma Normală 3 - 3NF).
  Client Tier (Frontend):Web (Medic): React.js.Mobile (Pacient): Android Native (Kotlin/Java).
