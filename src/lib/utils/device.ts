interface DeviceInfo {
  platform: string;
  userAgent: string;
  ipAddress?: string;
}

export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  let platform = 'web';

  if (/Android/i.test(userAgent)) {
    platform = 'android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    platform = 'ios';
  } else if (/Windows/i.test(userAgent)) {
    platform = 'windows';
  } else if (/Mac/i.test(userAgent)) {
    platform = 'mac';
  } else if (/Linux/i.test(userAgent)) {
    platform = 'linux';
  }

  return {
    platform,
    userAgent,
    // Note: In a real application, you might want to get the IP address from the server-side
    ipAddress: undefined
  };
}