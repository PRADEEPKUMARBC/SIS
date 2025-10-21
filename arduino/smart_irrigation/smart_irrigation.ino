int sensorPin = A0; // Soil moisture sensor
int sensorValue = 0;

void setup() {
  Serial.begin(9600); // match this baud in backend
}

void loop() {
  sensorValue = analogRead(sensorPin); // Read sensor
  Serial.println(sensorValue);         // Send to backend
  delay(2000);                         // Wait 2 seconds
}
