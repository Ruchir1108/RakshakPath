from rest_framework import serializers
from .models import HotspotCluster, AccidentReport, EmergencyFacility, RoadSegment

class HotspotClusterSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotspotCluster
        fields = '__all__'

class AccidentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccidentReport
        fields = '__all__'

class EmergencyFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyFacility
        fields = '__all__'

class RoadSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadSegment
        fields = '__all__'
