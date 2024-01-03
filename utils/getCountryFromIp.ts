const ipCountryMap: { [ipRange: string]: string } = {
  '41.128.0.0-41.255.255.255': 'Egypt',
  '1.0.0.0-1.255.255.255': 'Australia',
  '2.0.0.0-2.255.255.255': 'United Kingdom',
  '3.0.0.0-3.255.255.255': 'Germany',
  '94.96.0.0-94.103.255.255': 'Saudi Arabia',
  '20.0.0.0-20.255.255.255': 'United States',
  // Add more entries for other countries
};
export const getCountryFromIP = (ip: string): string | undefined => {
  for (const ipRange in ipCountryMap) {
    const [start, end] = ipRange.split('-').map((ip) => ip.trim());
    const ipInt = ipToInt(ip);
    const startInt = ipToInt(start);
    const endInt = ipToInt(end);

    if (ipInt >= startInt && ipInt <= endInt) {
      return ipCountryMap[ipRange];
    }
  }

  return undefined;
};

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}
