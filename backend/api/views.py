from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
import requests
import random
import time
from .models import HotspotCluster, AccidentReport, EmergencyFacility, RoadSegment
from .serializers import (
    HotspotClusterSerializer, 
    AccidentReportSerializer, 
    EmergencyFacilitySerializer, 
    RoadSegmentSerializer
)

class HotspotClusterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HotspotCluster.objects.all()
    serializer_class = HotspotClusterSerializer

class AccidentReportViewSet(viewsets.ModelViewSet):
    queryset = AccidentReport.objects.all()
    serializer_class = AccidentReportSerializer

class EmergencyFacilityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmergencyFacility.objects.all()
    serializer_class = EmergencyFacilitySerializer

class RoadSegmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoadSegment.objects.all()
    serializer_class = RoadSegmentSerializer

@api_view(['GET'])
def analytics_dashboard_summary(request):
    """
    Returns summary analytics for the government dashboard.
    """
    total_accidents = AccidentReport.objects.count()
    high_risk_clusters = HotspotCluster.objects.filter(risk_level='High Risk').count()
    
    return Response({
        "total_accidents": total_accidents,
        "high_risk_clusters": high_risk_clusters,
        "status": "Operational"
    })

@api_view(['POST'])
def nearest_hospitals(request):
    data = request.data
    lat = data.get('lat')
    lon = data.get('lon')
    if not lat or not lon:
        return Response({'error': 'lat and lon are required'}, status=400)
    
    radiuses = [5000, 10000, 20000]
    hospitals = []
    found_radius = 0
    
    for radius in radiuses:
        query = f"[out:json];\nnode(around:{radius},{lat},{lon})[amenity=hospital];\nout 10;"
        try:
            response = requests.get(f"https://overpass-api.de/api/interpreter?data={query}", timeout=10)
            json_data = response.json()
            if json_data and "elements" in json_data:
                hospitals = [h for h in json_data["elements"] if "tags" in h and "name" in h["tags"]]
                if hospitals:
                    found_radius = radius
                    break
        except Exception as e:
            print("Overpass error:", e)
            
    return Response({
        "hospitals": hospitals,
        "searchRadiusExpandedTo": found_radius
    })

@api_view(['POST'])
def dispatch_ems(request):
    hospital = request.data.get('hospital')
    location = request.data.get('location')
    if not hospital or not location:
        return Response({'error': 'Hospital and location required'}, status=400)
        
    ambulance_id = f"AMB-{random.randint(1000, 9999)}"
    return Response({
        "message": "Dispatch initiated",
        "ambulanceId": ambulance_id,
        "status": "Assigned"
    })

# Simple in-memory cache for geocoding results
_geocode_cache = {}

@api_view(['GET'])
def geocode_search(request):
    """
    Proxy geocoding requests through the backend to avoid browser rate-limiting.
    Tries Photon first (better rate limits), falls back to Nominatim.
    """
    query = request.query_params.get('q', '').strip()
    if not query or len(query) < 2:
        return Response({'results': []})
    
    # Check cache first
    cache_key = query.lower()
    if cache_key in _geocode_cache:
        cached_data, cached_time = _geocode_cache[cache_key]
        # Cache valid for 10 minutes
        if time.time() - cached_time < 600:
            return Response({'results': cached_data})
    
    headers = {
        'User-Agent': 'RakshakPath/1.0 (road-safety-project)',
        'Accept': 'application/json',
    }
    
    results = []
    
    # Try Photon first (more generous rate limits)
    try:
        resp = requests.get(
            f'https://photon.komoot.io/api/?q={query}&limit=5',
            headers=headers,
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get('features'):
                for f in data['features']:
                    p = f.get('properties', {})
                    coords = f.get('geometry', {}).get('coordinates', [0, 0])
                    parts = [p.get('name'), p.get('street'), p.get('city'), 
                             p.get('state'), p.get('country')]
                    display_name = ', '.join([x for x in parts if x])
                    results.append({
                        'display_name': display_name,
                        'lat': coords[1],
                        'lon': coords[0],
                    })
    except Exception as e:
        print(f"Photon geocoder error: {e}")
    
    # Fallback to Nominatim if Photon returned nothing
    if not results:
        try:
            resp = requests.get(
                f'https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=5',
                headers=headers,
                timeout=5
            )
            if resp.status_code == 200:
                data = resp.json()
                for item in data:
                    results.append({
                        'display_name': item.get('display_name', ''),
                        'lat': float(item.get('lat', 0)),
                        'lon': float(item.get('lon', 0)),
                    })
        except Exception as e:
            print(f"Nominatim geocoder error: {e}")
    
    # Cache the results
    if results:
        _geocode_cache[cache_key] = (results, time.time())
    
    return Response({'results': results})

