import { Donation, DonationItem, NGO } from '../models/types';
import { db } from '../config/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import * as Location from 'expo-location';

export class DonationService {
  /**
   * Submit a new donation to Firestore
   */
  static async createDonation(
    userId: string,
    items: DonationItem[],
    ngoId: string,
    ngoName: string
  ): Promise<Donation> {
    const donationData = {
      userId,
      items,
      ngoId,
      ngoName,
      date: new Date().toISOString(),
      status: 'pending' as const,
    };

    const docRef = await addDoc(collection(db, `users/${userId}/donations`), donationData);

    return {
      id: docRef.id,
      ...donationData,
    };
  }

  /**
   * Get dynamic NGOs from OpenStreetMap Overpass API based on user location
   */
  static async getNGOs(): Promise<NGO[]> {
    try {
      // 1. Request Location Permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let lat = 19.0760; // Default to Mumbai
      let lon = 72.8777;

      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lon = location.coords.longitude;
        } catch (locErr) {
          console.warn('Failed to get location, falling back to default', locErr);
        }
      } else {
        console.warn('Location permission denied, using default city coordinates');
      }

      // 2. Build Overpass QL Query 
      // Searching for social facilities roughly within 25km radius (25000 meters)
      const radius = 25000;
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="social_facility"](around:${radius},${lat},${lon});
          way["amenity"="social_facility"](around:${radius},${lat},${lon});
          node["social_facility"="food_bank"](around:${radius},${lat},${lon});
          way["social_facility"="food_bank"](around:${radius},${lat},${lon});
          node["name"~"charity|foundation|ngo|trust",i](around:${radius},${lat},${lon});
        );
        out center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      });

      if (!response.ok) {
        throw new Error('Overpass API failed');
      }

      const data = await response.json();

      let ngos: NGO[] = data.elements
        .filter((el: any) => el.tags && el.tags.name) // Must have a name
        .map((el: any) => {
          const elLat = el.lat || el.center?.lat;
          const elLon = el.lon || el.center?.lon;
          const distance = this.calculateDistance(lat, lon, elLat, elLon);

          return {
            id: el.id.toString(),
            name: el.tags.name,
            address: el.tags['addr:full'] || el.tags['addr:street'] || el.tags['addr:city'] || 'Local Organization',
            distance: Math.round(distance * 10) / 10,
            pickupAvailable: Math.random() > 0.5, // Mock pickup availability
            operatingHours: el.tags.opening_hours || '9:00 AM - 6:00 PM',
            phone: el.tags.phone || el.tags['contact:phone'] || '+91 98765 43210',
          };
        });

      // Remove duplicates by name
      ngos = ngos.filter((ngo, index, self) => 
        index === self.findIndex((t) => (t.name === ngo.name))
      );

      // Sort by distance
      ngos.sort((a, b) => a.distance - b.distance);

      const fallbackNGOs: NGO[] = [
        {
          id: 'fallback-1',
          name: 'Local Food Bank Foundation',
          address: 'City Center Community Area',
          distance: 2.5,
          pickupAvailable: true,
          operatingHours: '9:00 AM - 5:00 PM',
          phone: '+1 234 567 8900'
        },
        {
          id: 'fallback-2',
          name: 'Hope Charity Trust',
          address: 'North District Help Center',
          distance: 5.1,
          pickupAvailable: false,
          operatingHours: '10:00 AM - 8:00 PM',
          phone: '+1 987 654 3210'
        }
      ];

      // If Overpass returned nothing, fallback to some smart dummy ones based on location
      if (ngos.length === 0) {
        return fallbackNGOs;
      }

      return ngos.slice(0, 15); // Return up to 15 closest
    } catch (error) {
      console.error('getNGOs Error:', error);
      return [
        {
          id: 'fallback-1',
          name: 'Local Food Bank Foundation',
          address: 'City Center Community Area',
          distance: 2.5,
          pickupAvailable: true,
          operatingHours: '9:00 AM - 5:00 PM',
          phone: '+1 234 567 8900'
        },
        {
          id: 'fallback-2',
          name: 'Hope Charity Trust',
          address: 'North District Help Center',
          distance: 5.1,
          pickupAvailable: false,
          operatingHours: '10:00 AM - 8:00 PM',
          phone: '+1 987 654 3210'
        }
      ]; // Return fallback if API fails
    }
  }

  /**
   * Helper function using Haversine formula to calculate distance in km
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get user's donation history from Firestore
   */
  static async getDonations(userId: string): Promise<Donation[]> {
    const q = query(
      collection(db, `users/${userId}/donations`),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Donation[];
  }
}
