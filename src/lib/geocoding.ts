export const getLatLngFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    // Check for HTTP errors (like 429 Too Many Requests)
    if (!response.ok) {
      console.error(`Geocoding HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } else {
      console.error('Geocoding error: No results found (API returned empty array).');
      return null;
    }
  } catch (error) {
    console.error('Error fetching geocoding data (Network or JSON parse error):', error);
    return null;
  }
};

export const getAddressFromLatLng = async (lat: number, lng: number): Promise<string | null> => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    // Check for HTTP errors
    if (!response.ok) {
      console.error(`Reverse geocoding HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    } else {
      console.error('Reverse geocoding error: No results found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching reverse geocoding data (Network or JSON parse error):', error);
    return null;
  }
};

export const getAddressComponents = async (lat: number, lng: number): Promise<any | null> => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    // Check for HTTP errors
    if (!response.ok) {
      console.error(`Reverse geocoding (components) HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data && data.address) {
      return data.address;
    } else {
      console.error('Reverse geocoding error: No address components found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching reverse geocoding data (Network or JSON parse error):', error);
    return null;
  }
};