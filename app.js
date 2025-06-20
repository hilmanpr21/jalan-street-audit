import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// connect supabase
const supabaseUrl = 'https://knfjfjnwbtjqtnnpgvwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZmpmam53YnRqcXRubnBndndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTUyNzYsImV4cCI6MjA2NTY3MTI3Nn0.lr9CI-ONEsE_vq3sSPDnI0b-V9oh6CExfDwMXH_Fq7Y'
const supabase = createClient(supabaseUrl, supabaseKey)

// Load Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiaGlsbWFucHIyMSIsImEiOiJjbGQxbGhycTAwZG01M3BxcWV5ejB2ZGtzIn0.wnQW51k0xp5SEd1ggujsiA";

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/hilmanpr21/cm1p8cp9200qt01pi8uagd0wa',
  center: [-0.12, 51.50], // Your coordinates
  zoom: 15
});

// Add navigation controls including the location button
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  })
);

// Add fixed pin to DOM
const pin = document.createElement('div');
pin.className = 'fixed-pin';
pin.innerHTML = '📍';
document.getElementById('map').appendChild(pin);



// Track map movement to get center coordinates
let currentCoordinates = map.getCenter();
map.on('move', () => {
  currentCoordinates = map.getCenter();
  console.log('Current center:', currentCoordinates);
});

// For form submission later
function getCurrentLocation() {
  return {
    lng: currentCoordinates.lng,
    lat: currentCoordinates.lat
  };
}


// Handle file input label
document.getElementById('photo-upload').addEventListener('change', function () {
  const label = document.querySelector('.upload-box');
  if (this.files.length > 0) {
    label.textContent = this.files[0].name;
  } else {
    label.textContent = '+ add photo (optional)';
  }
});

// Handle form submission
document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const type = document.getElementById('issue-type').value;
  const notes = document.getElementById('notes').value;
  const coordinates = getCurrentLocation();
  const photoFile = document.getElementById('photo-upload').files[0];

  let photoUrl = null;

  if (photoFile) {
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase
        .storage
        .from('issuesphotos')
        .upload(fileName, photoFile, {
          contentType: photoFile.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('issuesphotos')
        .getPublicUrl(fileName);

      photoUrl = publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Photo upload failed. Please try again.');
      return;
    }
  }

  try {
    const { error } = await supabase
      .from('reports')
      .insert([{
        type,
        notes,
        coordinates,
        photo_url: photoUrl
      }]);

    if (error) throw error;

    alert('Thank you for your audit!');
    e.target.reset();
    document.querySelector('.upload-box').textContent = '+ add photo (optional)';
    document.getElementById('form-feedback').innerHTML = '';
  } catch (error) {
    console.error('Database error:', error);
    alert('Submission failed. Please check console for details.');
  }
});

