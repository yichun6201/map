import React,{useState,useEffect} from "react";
import { View,StyleSheet,Image,Platform } from "react-native";
import MapView,{Marker} from "react-native-maps";
import mapStyle from "./styles/mapStyle.json";
import beok from "./styles/img.json";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { Icon } from "react-native-elements";
import metroJson from "./styles/metro.json"
import axios from "axios";
import youbike from "./styles/youbike.json";
const App=()=>{

  const [region, setRegion] = React.useState({
    longitude: 121.543889,
    latitude: 25.0416667,
    longitudeDelta: 0.01,
    latitudeDelta: 0.02,
  });
  const [marker, setMarker] = useState({
    coord: {
      longitude: 121.543889,
      latitude: 25.0416667,
    },
    name: "🚩",
    address: "🐾🐾",
  });

  const [onCurrentLocation, setOnCurrentLocation] = useState(false);
  const [metro, setMetro] = useState(metroJson);
  const [ubike, setUbike] = useState([]);

  const onRegionChangeComplete = (rgn) => {
    if (
      Math.abs(rgn.latitude - region.latitude) > 0.002 ||
      Math.abs(rgn.longitude - region.longitude) > 0.002
    ) {
      setRegion(rgn);
      setOnCurrentLocation(false);
    }
  };

  const getUbikeAsync = async () => {
    let response = await axios.get(UBIKE_URL);
    setUbike(response.data);
  };

  const setRegionAndMarker = (location) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      ...marker,
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setRegionAndMarker(location);
    setOnCurrentLocation(true);
  };

  useEffect(() => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      setErrorMsg(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
    } else {
      getLocation();
      getUbikeAsync();
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        region={region}
        style={{ flex: 1 }}
        showsTraffic
        provider="google"
        customMapStyle={mapStyle}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {
            <Marker
            coordinate={marker.coord}
            title={marker.name}
            description={marker.address}
          >
           <Image style={styles.marker} source={{url:beok[0].marker}}/>
          </Marker>
        }
        {metro.map((site) => (
         <Marker
         coordinate={{ latitude: site.latitude, longitude: site.longitude }}
         key={`${site.id}${site.line}`}
         title={site.name}
         description={site.address}
       >
         <Image
          style={styles.marker} source={{url:beok[0].mrt}}
           resizeMode="contain"
         />
       </Marker>
     ))}
      {ubike.map((site) => (
          <Marker
            coordinate={{
              latitude: Number(site.lat),
              longitude: Number(site.lng),
            }}
            key={site.sno}
            title={`${site.sna} ${site.sbi}/${site.tot}`}
            description={site.ar}
            >
              <Image style={styles.marker} source={{url:beok[0].ubike}}
              resizeMode="contain"
              />
              </Marker>
        ))}
      </MapView>
      {!onCurrentLocation && (
        <Icon
          raised
          name="ios-rocket"
          type="ionicon"
          color="black"
          containerStyle={{
            backgroundColor: "#517fa4",
            position: "absolute",
            right: 20,
            bottom: 40,
          }}
          onPress={getLocation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  marker: {
    width:30,
    height:36.53,
  },
});
export default App;
