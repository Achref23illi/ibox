import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../config/colors';

interface DriverSearchScreenProps {
  navigation: any;
  route: any;
}

interface Driver {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  vehicleType?: string;
  vehiclePlate?: string;
  vehicleIcon?: string;
}

const DriverSearchScreen: React.FC<DriverSearchScreenProps> = ({
  navigation,
  route,
}) => {
  const [driversFound, setDriversFound] = useState<Driver[]>([]);
  const [searchComplete, setSearchComplete] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Get service type and pickup location from route params
  const getServiceType = () => {
    const { service, serviceType } = route.params || {};
    return serviceType || service || 'express';
  };

  const getPickupLocation = () => {
    console.log('🔍 DEBUG: DriverSearchScreen route.params:', route.params);
    const { startLocationCoords, destination, service, serviceType } = route.params || {};
    console.log('🔍 DEBUG: Extracted startLocationCoords:', startLocationCoords);
    console.log('🔍 DEBUG: Extracted destination:', destination);
    console.log('🔍 DEBUG: Service type:', serviceType || service);
    
    // If valid pickup coordinates are provided, use them.
    if (
      startLocationCoords &&
      typeof startLocationCoords.latitude === 'number' &&
      typeof startLocationCoords.longitude === 'number'
    ) {
      console.log('📍 Using pickup coordinates for driver search:', startLocationCoords);
      return {
        latitude: startLocationCoords.latitude,
        longitude: startLocationCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    // If pickup coordinates are missing, fall back to a safe default rather than
    // the destination. Spawning drivers at the destination leads to unrealistic
    // behaviour where drivers appear far from the pickup point.
    console.log(
      '📍 WARNING: startLocationCoords missing or invalid – falling back to default location (Quebec City).'
    );
    console.log('🔍 DEBUG: Full route.params structure:', JSON.stringify(route.params, null, 2));

    return {
      latitude: 46.8139, // Quebec City default
      longitude: -71.2082,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  const pickupLocation = getPickupLocation();
  const currentServiceType = getServiceType();

  // Vehicle configurations by service type
  const getVehiclesByService = (serviceType: string) => {
    switch (serviceType) {
      case 'moving':
        return {
          searchText: 'Searching for movers...',
          completeText: 'Mover found!',
          vehicles: [
            { type: 'Camion Cube Plaque L', plate: 'MOV-', icon: 'cube-outline' },
            { type: 'Mercedes Sprinter', plate: 'SPR-', icon: 'bus-outline' },
            { type: 'Iveco Daily', plate: 'IVE-', icon: 'cube-outline' },
            { type: 'Ford Transit', plate: 'TRA-', icon: 'bus-outline' },
            { type: 'Renault Master', plate: 'MAS-', icon: 'cube-outline' },
          ]
        };
      case 'storage':
        return {
          searchText: 'Searching for storage drivers...',
          completeText: 'Storage driver found!',
          vehicles: [
            { type: 'Mercedes Sprinter', plate: 'STO-', icon: 'bus-outline' },
            { type: 'Ford Transit', plate: 'TRA-', icon: 'bus-outline' },
            { type: 'Peugeot Boxer', plate: 'BOX-', icon: 'cube-outline' },
          ]
        };
      case 'standard':
        return {
          searchText: 'Searching for drivers...',
          completeText: 'Driver found!',
          vehicles: [
            { type: 'Toyota Corolla', plate: 'STD-', icon: 'car-outline' },
            { type: 'Honda Civic', plate: 'CIV-', icon: 'car-outline' },
            { type: 'Ford Focus', plate: 'FOC-', icon: 'car-outline' },
            { type: 'Volkswagen Golf', plate: 'GLF-', icon: 'car-outline' },
          ]
        };
      default: // express
        return {
          searchText: 'Searching for couriers...',
          completeText: 'Courier found!',
          vehicles: [
            { type: 'Honda PCX', plate: 'EXP-', icon: 'speedometer-outline' },
            { type: 'Yamaha NMAX', plate: 'YAM-', icon: 'speedometer-outline' },
            { type: 'Smart ForTwo', plate: 'SMT-', icon: 'car-sport-outline' },
            { type: 'Toyota Yaris', plate: 'YAR-', icon: 'car-outline' },
          ]
        };
    }
  };

  const vehicleConfig = getVehiclesByService(currentServiceType);

  // Animation values
  const radarScale1 = useSharedValue(0);
  const radarScale2 = useSharedValue(0);
  const radarScale3 = useSharedValue(0);
  const radarOpacity1 = useSharedValue(1);
  const radarOpacity2 = useSharedValue(1);
  const radarOpacity3 = useSharedValue(1);
  const progressValue = useSharedValue(0);

  useEffect(() => {
    // Set initial search text based on service type
    setSearchText(vehicleConfig.searchText);
    startDriverSearch();
  }, []);

  const startDriverSearch = () => {
    // Start radar animations
    radarScale1.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(3, { duration: 2000 })
      ),
      -1,
      false
    );

    radarScale2.value = withRepeat(
      withSequence(
        withDelay(667, withTiming(0, { duration: 0 })),
        withDelay(667, withTiming(3, { duration: 2000 }))
      ),
      -1,
      false
    );

    radarScale3.value = withRepeat(
      withSequence(
        withDelay(1334, withTiming(0, { duration: 0 })),
        withDelay(1334, withTiming(3, { duration: 2000 }))
      ),
      -1,
      false
    );

    radarOpacity1.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );

    radarOpacity2.value = withRepeat(
      withSequence(
        withDelay(667, withTiming(0.8, { duration: 0 })),
        withDelay(667, withTiming(0, { duration: 2000 }))
      ),
      -1,
      false
    );

    radarOpacity3.value = withRepeat(
      withSequence(
        withDelay(1334, withTiming(0.8, { duration: 0 })),
        withDelay(1334, withTiming(0, { duration: 2000 }))
      ),
      -1,
      false
    );

    // Progress animation
    progressValue.value = withTiming(1, { duration: 7000 });

    // Simulate finding drivers
    setTimeout(() => runOnJS(addDriver)(generateDriver(1)), 2000);
    setTimeout(() => runOnJS(addDriver)(generateDriver(2)), 3500);
    setTimeout(() => runOnJS(addDriver)(generateDriver(3)), 5000);
    setTimeout(() => {
      const nearbyText = currentServiceType === 'moving' ? 'Found movers nearby!' : 
                        currentServiceType === 'storage' ? 'Found storage drivers nearby!' :
                        currentServiceType === 'express' ? 'Found couriers nearby!' :
                        'Found drivers nearby!';
      runOnJS(setSearchText)(nearbyText);
    }, 5500);
    setTimeout(() => runOnJS(addDriver)(generateDriver(4)), 6000);
    setTimeout(() => runOnJS(completeSearch)(), 7000);
  };

  const generateDriver = (id: number): Driver => {
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const distance = Math.random() * 0.008 + 0.002; // Random distance within ~1km
    
    // Select random vehicle from service-specific vehicles
    const randomVehicle = vehicleConfig.vehicles[Math.floor(Math.random() * vehicleConfig.vehicles.length)];
    const plateNumber = Math.floor(Math.random() * 900) + 100; // Random 3-digit number
    
    return {
      id: `driver_${id}`,
      name: `Driver ${id}`,
      latitude: pickupLocation.latitude + Math.cos(angle) * distance,
      longitude: pickupLocation.longitude + Math.sin(angle) * distance,
      distance: Math.round((distance * 111) * 10) / 10, // Convert to km
      vehicleType: randomVehicle.type,
      vehiclePlate: `${randomVehicle.plate}${plateNumber}`,
      vehicleIcon: randomVehicle.icon,
    };
  };

  const addDriver = (driver: Driver) => {
    setDriversFound(prev => [...prev, driver]);
  };

  const completeSearch = () => {
    setSearchComplete(true);
    setSearchText(vehicleConfig.completeText);
    
    // Navigate to driver found screen after a short delay
    setTimeout(() => {
      // Select a random vehicle for the final driver
      const randomVehicle = vehicleConfig.vehicles[Math.floor(Math.random() * vehicleConfig.vehicles.length)];
      const plateNumber = Math.floor(Math.random() * 900) + 100;
      
             // Generate service-appropriate driver names
       const getDriverName = () => {
         const names: { [key: string]: string[] } = {
           moving: ['Pierre Dufour', 'Jacques Martin', 'Michel Tremblay', 'André Côté'],
           storage: ['Marie Gagnon', 'Luc Bouchard', 'Sylvie Roy', 'Denis Lavoie'],
           standard: ['Alex Johnson', 'Sarah Wilson', 'Mike Chen', 'Emma Davis'],
           express: ['Carlos Rodriguez', 'Nina Patel', 'Jake Thompson', 'Lisa Park']
         };
         const serviceNames = names[currentServiceType] || names.express;
         return serviceNames[Math.floor(Math.random() * serviceNames.length)];
       };

      const selectedDriver = {
        id: 'driver_selected',
        name: getDriverName(),
        rating: 4.6 + Math.random() * 0.4, // 4.6-5.0 rating
        reviews: Math.floor(Math.random() * 200) + 50, // 50-250 reviews
        vehicleType: randomVehicle.type,
        vehiclePlate: `${randomVehicle.plate}${plateNumber}`,
        vehicleIcon: randomVehicle.icon,
        estimatedArrival: `${Math.floor(Math.random() * 10) + 5}-${Math.floor(Math.random() * 5) + 12} min`,
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        phone: '+1 (555) 123-4567',
      };

      navigation.replace('DriverFound', {
        ...route.params,
        selectedDriver,
      });
    }, 2000);
  };

  const radar1AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: radarScale1.value }],
      opacity: radarOpacity1.value,
    };
  });

  const radar2AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: radarScale2.value }],
      opacity: radarOpacity2.value,
    };
  });

  const radar3AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: radarScale3.value }],
      opacity: radarOpacity3.value,
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        region={pickupLocation}
        showsUserLocation={false}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {/* Pickup Location Marker */}
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.pickupMarker}>
            <Ionicons name="location" size={24} color="white" />
          </View>
        </Marker>

        {/* Driver Markers */}
        {driversFound.map((driver, index) => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Animated.View 
              style={styles.driverMarker}
              entering={FadeIn.delay(index * 200).duration(600)}
            >
              <Ionicons name="person" size={16} color="white" />
            </Animated.View>
          </Marker>
        ))}
      </MapView>

      {/* Radar Overlay */}
      <View style={styles.radarContainer}>
        <Animated.View style={[styles.radarCircle, radar1AnimatedStyle]} />
        <Animated.View style={[styles.radarCircle, radar2AnimatedStyle]} />
        <Animated.View style={[styles.radarCircle, radar3AnimatedStyle]} />
        <View style={styles.radarCenter} />
      </View>

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Animated.View 
          style={styles.searchCard}
          entering={FadeIn.delay(300)}
        >
          <View style={styles.searchIconContainer}>
            <Ionicons 
              name={searchComplete ? "checkmark-circle" : "search"} 
              size={24} 
              color={searchComplete ? Colors.success : Colors.primary} 
            />
          </View>
          <View style={styles.searchInfo}>
            <Text style={styles.searchTitle}>{searchText}</Text>
            <Text style={styles.searchSubtitle}>
              {searchComplete ? 
                `Found ${driversFound.length} drivers nearby` : 
                'Looking for the best drivers in your area...'
              }
            </Text>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        {!searchComplete && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
            </View>
          </View>
        )}
      </View>

      {/* Drivers Count */}
      {driversFound.length > 0 && (
        <Animated.View 
          style={styles.driversCount}
          entering={FadeIn.delay(500)}
        >
          <Text style={styles.driversCountText}>
            {driversFound.length} driver{driversFound.length !== 1 ? 's' : ''} found
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  radarContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginTop: -100,
    marginLeft: -100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  radarCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  pickupMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInfo: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  searchSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  driversCount: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  driversCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default DriverSearchScreen;