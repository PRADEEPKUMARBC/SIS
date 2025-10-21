// listPorts.js
import { SerialPort } from 'serialport';

async function showPorts() {
  try {
    const ports = await SerialPort.list();
    console.log('Available Serial Ports:');
    console.table(ports);
  } catch (err) {
    console.error('Error listing ports:', err);
  }
}

showPorts();
