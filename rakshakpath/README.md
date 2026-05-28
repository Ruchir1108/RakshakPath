# Project Title: RakshakPath – AI-Powered Road Safety & Emergency Response Analytics

## 1. Project Overview
RakshakPath is an intelligent geospatial dashboard designed to improve road safety in India by identifying high-risk "Black Spots" (accident hotspots) and optimizing emergency response. Unlike traditional maps that only show traffic, this platform utilizes Unsupervised Machine Learning to analyze historical accident data from the Karnataka State Transport Department.

The system identifies clusters of recurring accidents, analyzes the infrastructural flaws at those locations (e.g., poor lighting, Y-junctions), and dynamically connects these danger zones to the nearest emergency infrastructure. A key feature is the "Golden Hour Recovery" module, which fetches nearby hospitals and police stations to assist in rapid medical intervention planning.

## 2. Core Technical Stack
**Machine Learning & Data Science:**
- **Scikit-Learn (DBSCAN):** Used for density-based spatial clustering to define "Black Spots" based on GPS coordinates.
- **Pandas & GeoPandas:** For cleaning, manipulating, and performing spatial operations on the Karnataka Accident Dataset.

**Backend (The Engine):**
- **Django REST Framework (DRF):** Handles the API logic, serving cluster data and infrastructure insights.
- **PostgreSQL with PostGIS:** A relational database with spatial extensions to perform high-speed geographic queries.

**Frontend (The Visualizer):**
- **React.js:** For building a responsive, single-page user interface.
- **React-Leaflet:** An open-source map integration library to render heatmaps and interactive markers.

**External APIs:**
- **Google Places API:** To fetch real-time data on nearby hospitals and police stations.
- **Overpass API (OpenStreetMap):** Used as a secondary source for detailed road metadata.

## 3. Key Functionalities
- **Heatmap Visualization:** Provides a visual density map of accidents across Karnataka, allowing users to zoom into specific districts like Bengaluru.
- **Infrastructural Root Cause Analysis:** When a "Black Spot" is clicked, the system displays the most frequent road conditions (e.g., "Wet Surface," "Unlit Junction") associated with that spot.
- **Emergency Facility Locator:** Automatically calculates and displays the nearest medical and law enforcement facilities within a 2km-5km radius of any identified hotspot.
- **Temporal Filtering:** Allows users to filter accident clusters by Time of Day or Weather Conditions (e.g., viewing night-time hotspots specifically).

## 4. Target Use Cases & Stakeholders
- **Urban Planners & Civil Engineers:** To identify where to install new streetlights, speed breakers, or traffic signals.
- **Emergency Medical Services (EMS):** To pre-deploy ambulances near identified high-frequency accident zones during peak hours.
- **Traffic Police Departments:** To optimize patrolling routes based on data-driven "Danger Zones."
- **Daily Commuters:** To check the "Safety Score" of their intended travel routes.
