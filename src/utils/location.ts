// Location utilities for SwachhSathi Collector App

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache location for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: getLocationErrorMessage(error.code)
        });
      },
      options
    );
  });
};

export const watchLocation = (
  onSuccess: (location: LocationData) => void,
  onError: (error: LocationError) => void
): number | null => {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: 'Geolocation is not supported by this browser.'
    });
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      });
    },
    (error) => {
      onError({
        code: error.code,
        message: getLocationErrorMessage(error.code)
      });
    },
    options
  );
};

export const clearLocationWatch = (watchId: number) => {
  navigator.geolocation.clearWatch(watchId);
};

const getLocationErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Location access denied by user.';
    case 2:
      return 'Location information is unavailable.';
    case 3:
      return 'Location request timed out.';
    default:
      return 'An unknown error occurred while fetching location.';
  }
};

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadian(lat2 - lat1);
  const dLng = toRadian(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadian = (degree: number): number => {
  return degree * (Math.PI / 180);
};