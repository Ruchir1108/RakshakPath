from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HotspotClusterViewSet, 
    AccidentReportViewSet, 
    EmergencyFacilityViewSet, 
    RoadSegmentViewSet,
    analytics_dashboard_summary,
    nearest_hospitals,
    dispatch_ems,
    geocode_search
)

router = DefaultRouter()
router.register(r'hotspots', HotspotClusterViewSet)
router.register(r'reports', AccidentReportViewSet)
router.register(r'facilities', EmergencyFacilityViewSet)
router.register(r'roads', RoadSegmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/summary/', analytics_dashboard_summary, name='analytics-summary'),
    path('nearest-hospitals/', nearest_hospitals, name='nearest-hospitals'),
    path('dispatch-ems/', dispatch_ems, name='dispatch-ems'),
    path('geocode/', geocode_search, name='geocode-search'),
]

