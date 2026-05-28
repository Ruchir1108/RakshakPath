from django.db import models

class HotspotCluster(models.Model):
    RISK_CHOICES = [
        ('Low Risk', 'Low'),
        ('Medium Risk', 'Medium'),
        ('High Risk', 'High')
    ]
    latitude = models.FloatField()
    longitude = models.FloatField()
    risk_level = models.CharField(max_length=20, choices=RISK_CHOICES)
    total_accidents = models.IntegerField(default=0)
    fatalities = models.IntegerField(default=0)
    injuries = models.IntegerField(default=0)
    primary_cause = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Cluster at {self.latitude}, {self.longitude} ({self.risk_level})"

class AccidentReport(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    severity = models.CharField(max_length=50)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Report {self.id} - {self.severity}"

class EmergencyFacility(models.Model):
    TYPE_CHOICES = [
        ('Hospital', 'Hospital'),
        ('Police', 'Police')
    ]
    name = models.CharField(max_length=255)
    facility_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    latitude = models.FloatField()
    longitude = models.FloatField()
    contact_info = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.facility_type})"

class RoadSegment(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    start_lat = models.FloatField()
    start_lng = models.FloatField()
    end_lat = models.FloatField()
    end_lng = models.FloatField()
    safety_score = models.FloatField(help_text="0-100 score")

    def __str__(self):
        return f"{self.name} (Score: {self.safety_score})"
