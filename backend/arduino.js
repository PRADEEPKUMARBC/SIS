// arduino.js
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

// Change COM3 to your actual port name
const port = new SerialPort({ path: 'COM3', baudRate: 9600 });

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

port.on('open', () => {
  console.log('✅ Serial Port Opened on COM3 at 9600 baud');
});

parser.on('data', (line) => {
  console.log('📟 Sensor Data from Arduino:', line);
  // Example: send to backend or save to DB
});
