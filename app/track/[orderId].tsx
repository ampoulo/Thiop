import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { useNavigation } from 'expo-router';
import axios from 'axios';

MapboxGL.setAccessToken('pk.eyJ1IjoidXNlcmFjbCIsImEiOiJjbWJ1aTl3ZWIwYzJmMnFzYWF1b25yeWVpIn0.BEWFodNB4W7MrxKZG5LC_Q');


const initialPosition: [number, number] = [-17.4557, 14.6959];
const generateDestination1Km = ([lng, lat]: [number, number]): [number, number] => {
  const earthRadius = 6371; // km
  const distance = 1; // 1 km
  const bearing = Math.random() * 2 * Math.PI; // angle en radians

  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / earthRadius) +
    Math.cos(lat1) * Math.sin(distance / earthRadius) * Math.cos(bearing)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(distance / earthRadius) * Math.cos(lat1),
      Math.cos(distance / earthRadius) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
};
const TrackOrderScreen = () => {
  const cameraRef = useRef(null);
  const [livreurPosition, setLivreurPosition] = useState(initialPosition);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [remainingPath, setRemainingPath] = useState<[number, number][]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [simulationStopped, setSimulationStopped] = useState(false);
  const navigation = useNavigation();
   const [destination, setDestination] = useState<[number, number]>(() =>
    generateDestination1Km(initialPosition)
  );


  // ✅ Fonction pour interpoler les points (ajoute des sous-points pour adoucir les mouvements)
  const interpolateRoute = (path: [number, number][], steps = 5) => {
    const interpolated: [number, number][] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const [lng1, lat1] = path[i];
      const [lng2, lat2] = path[i + 1];
      for (let j = 0; j < steps; j++) {
        const lng = lng1 + ((lng2 - lng1) * j) / steps;
        const lat = lat1 + ((lat2 - lat1) * j) / steps;
        interpolated.push([lng, lat]);
      }
    }
    interpolated.push(path[path.length - 1]);
    return interpolated;
  };

  // 📦 Récupère le trajet entre le point de départ et la destination
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${initialPosition[0]},${initialPosition[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=pk.eyJ1IjoidXNlcmFjbCIsImEiOiJjbWJ1aTl3ZWIwYzJmMnFzYWF1b25yeWVpIn0.BEWFodNB4W7MrxKZG5LC_Q`
        );
        const coordinates = response.data.routes[0].geometry.coordinates;
        const interpolated = interpolateRoute(coordinates, 5); // interpolation
        setRoutePath(interpolated);
        setRemainingPath(interpolated);
      } catch (error) {
        console.error('Erreur lors de la récupération du trajet:', error);
      }
    };
    fetchRoute();
  }, []);

  // 🔁 Déplacement automatique du livreur
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMoving && !simulationStopped && routePath.length > 0) {
      let index = 0;
      interval = setInterval(() => {
        if (index < routePath.length) {
          const newPos = routePath[index];
          setLivreurPosition(newPos);
          setRemainingPath(routePath.slice(index));
          index++;
        } else {
          clearInterval(interval);
          setIsMoving(false);
          setSimulationStopped(true);
        }
      }, 500); // plus fluide
    }
    return () => clearInterval(interval);
  }, [isMoving, routePath]);

  // 🔭 Recentrage automatique de la caméra
  useEffect(() => {
    if (cameraRef.current && livreurPosition) {
      cameraRef.current.setCamera({
        centerCoordinate: livreurPosition,
        zoomLevel: 15,
        animationMode: 'easeTo',
        animationDuration: 1000,
      });
    }
  }, [livreurPosition]);

  // 🔄 Calcul de l'orientation du livreur
  const calculateBearing = ([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) => {
    const deltaLng = lng2 - lng1;
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    return (Math.atan2(y, x) * 180) / Math.PI;
  };

  const bearing =
    isMoving && remainingPath.length > 1
      ? calculateBearing(remainingPath[0], remainingPath[1])
      : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={livreurPosition}
          zoomLevel={15}
          animationMode="flyTo"
          animationDuration={0}
        />

        {/* 🚴 Marqueur livreur */}
        <MapboxGL.MarkerView coordinate={livreurPosition}>
          <Image
            source={require('../../assets/livreur.png')}
            style={[styles.customMarker, { transform: [{ rotate: `${bearing}deg` }] }]}
          />
        </MapboxGL.MarkerView>

        {/* 🏠 Marqueur maison */}
        <MapboxGL.MarkerView coordinate={destination}>
          <Image source={require('../../assets/house.png')} style={styles.customMarker} />
        </MapboxGL.MarkerView>

        {/* 🛣️ Trajet restant */}
        <MapboxGL.ShapeSource
          id="remainingRoute"
          shape={{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: remainingPath },
          }}
        >
          <MapboxGL.LineLayer
            id="remainingLine"
            style={{
              lineColor: 'black',
              lineWidth: 4,
            }}
          />
        </MapboxGL.ShapeSource>
      </MapboxGL.MapView>

      {/* Informations commande */}
      <View style={styles.infoBox}>
        <Text style={styles.commande}>📦 Commande 123</Text>
        <Text style={styles.simulation}>
          {simulationStopped
            ? '✔ Livraison terminée'
            : isMoving
            ? 'En cours...'
            : '⏸ Simulation arrêtée'}
        </Text>
      </View>

      {/* ▶️ Bouton Démarrer */}
      <TouchableOpacity
        onPress={() => {
          setIsMoving(true);
          setSimulationStopped(false);
        }}
        style={[styles.button, isMoving && styles.disabledButton]}
        disabled={isMoving}
      >
        <Text style={styles.buttonText}>Démarrer</Text>
      </TouchableOpacity>

      {/* 📍 Bouton de centrage */}
      <TouchableOpacity
        onPress={() => {
          cameraRef.current?.setCamera({
            centerCoordinate: livreurPosition,
            zoomLevel: 15,
            animationMode: 'flyTo',
            animationDuration: 800,
          });
        }}
        style={styles.centerButton}
      >
        <Text style={styles.centerButtonText}>📍</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TrackOrderScreen;

// 🎨 Styles (non modifiés)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 40,
    height: 40,
  },
  infoBox: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 5,
  },
  commande: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  simulation: {
    marginTop: 4,
    fontSize: 14,
  },
  button: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    padding: 14,
    backgroundColor: '#3498db',
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  centerButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
  },
  centerButtonText: {
    fontSize: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
  },
});
