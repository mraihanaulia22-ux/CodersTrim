import net from 'node:net';

export interface PortStatus {
  port: number;
  isAvailable: boolean;
  statusText: string;
}

/**
 * Checks whether a given TCP port is available on localhost.
 */
export function checkPortAvailability(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, '127.0.0.1');
  });
}

/**
 * Inspects standard development ports commonly used in web and API projects.
 */
export async function diagnoseCommonPorts(): Promise<PortStatus[]> {
  const commonDevPorts = [3000, 5173, 8000, 8080, 4000, 5000];
  const results: PortStatus[] = [];

  for (const port of commonDevPorts) {
    const isAvailable = await checkPortAvailability(port);
    results.push({
      port,
      isAvailable,
      statusText: isAvailable ? 'Available' : 'In Use (EADDRINUSE)',
    });
  }

  return results;
}
