import json
import os
import pandas as pd
from sklearn.cluster import DBSCAN
import numpy as np

def run_clustering(file_path):
    print("Loading accident data...")
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    
    if 'Latitude' not in df.columns or 'Longitude' not in df.columns:
        print("Required coordinate columns missing.")
        return []
    
    coords = df[['Latitude', 'Longitude']].values
    
    # DBSCAN implementation
    # Epsilon = 0.01 roughly translates to ~1.1km distance
    print("Running DBSCAN algorithm...")
    db = DBSCAN(eps=0.01, min_samples=3).fit(coords)
    
    df['Cluster'] = db.labels_
    
    clusters = []
    
    for cluster_id, group in df.groupby('Cluster'):
        if cluster_id == -1:
            continue # Skip noise points
        
        # Calculate cluster center
        lat_mean = group['Latitude'].mean()
        lng_mean = group['Longitude'].mean()
        
        # Risk assessment based on cluster density
        count = len(group)
        if count >= 15:
            risk = "High Risk"
        elif count >= 8:
            risk = "Medium Risk"
        else:
            risk = "Low Risk"
            
        primary_cause = group['Crash_Type'].mode()[0] if 'Crash_Type' in group.columns else "Unknown"
        
        clusters.append({
            "latitude": lat_mean,
            "longitude": lng_mean,
            "total_accidents": count,
            "risk_level": risk,
            "primary_cause": primary_cause
        })
        
    print(f"Discovered {len(clusters)} Black Spots.")
    return clusters

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", help="Path to accidents.json")
    args = parser.parse_args()
    if args.file:
        run_clustering(args.file)
