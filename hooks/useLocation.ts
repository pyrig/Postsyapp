import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location Access Denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationName = address.district || address.city || address.region || 'Unknown Area';
        setCurrentLocation(locationName);
      } else {
        setCurrentLocation('Campus Area');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentLocation('Campus Area');
    } finally {
      setLoading(false);
    }
  };

  return {
    currentLocation,
    loading,
    refreshLocation: getCurrentLocation,
  };
}