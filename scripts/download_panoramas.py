"""
Download Street View Panoramas for Big Island VR

Downloads equirectangular panoramas from Google Street View API
along specified routes on the Big Island.
"""

import os
import json
import requests
from pathlib import Path
from dataclasses import dataclass
from typing import List, Tuple

# Google API Key (same as dc-big-island-vr)
API_KEY = "AIzaSyBmSDHrsQunVjxhZ4UHQ0asdUY6vZVFszY"
STREETVIEW_URL = "https://maps.googleapis.com/maps/api/streetview"
METADATA_URL = "https://maps.googleapis.com/maps/api/streetview/metadata"

@dataclass
class Location:
    name: str
    lat: float
    lng: float
    description: str = ""

# Big Island routes
ROUTES = {
    "hilo_bayfront": [
        Location("Banyan Drive Start", 19.7260, -155.0820, "Start of Banyan Drive"),
        Location("Liliuokalani Gardens", 19.7240, -155.0800, "Japanese garden on the bay"),
        Location("Coconut Island View", 19.7230, -155.0780, "View of Coconut Island"),
        Location("Hilo Bay", 19.7220, -155.0760, "Hilo Bay waterfront"),
        Location("Downtown Hilo", 19.7241, -155.0868, "Kamehameha Avenue"),
    ],
    "keaau": [
        Location("Keaau Intersection", 19.6411, -155.0378, "Main intersection"),
        Location("Keaau Town Center", 19.6405, -155.0370, "Town center"),
        Location("Keaau Highway", 19.6420, -155.0390, "Highway 11"),
    ],
    "volcano": [
        Location("Volcano Village", 19.4400, -155.2364, "Misty village"),
        Location("Wright Road", 19.4420, -155.2400, "Road to park"),
        Location("Kilauea Entrance", 19.4300, -155.2500, "Park entrance"),
    ],
    "saddle_road": [
        Location("Saddle Start", 19.7000, -155.3000, "Saddle Road start"),
        Location("Mauna Kea View", 19.7500, -155.4500, "View of Mauna Kea"),
        Location("Between Mountains", 19.7200, -155.5000, "Between volcanoes"),
    ]
}

def get_pano_id(lat: float, lng: float) -> str:
    """Get panorama ID for a location"""
    params = {
        "location": f"{lat},{lng}",
        "key": API_KEY
    }
    resp = requests.get(METADATA_URL, params=params)
    data = resp.json()
    
    if data.get("status") == "OK":
        return data.get("pano_id")
    return None

def download_panorama(pano_id: str, output_path: Path, size: str = "640x640") -> bool:
    """
    Download a panorama image.
    
    Note: Street View Static API returns perspective views, not equirectangular.
    For true equirectangular, we need to stitch multiple views or use a different approach.
    
    For now, we download multiple angles and can stitch them later.
    """
    headings = [0, 90, 180, 270]  # 4 directions
    pitches = [0]  # horizontal only for now
    
    for heading in headings:
        for pitch in pitches:
            params = {
                "pano": pano_id,
                "size": size,
                "heading": heading,
                "pitch": pitch,
                "fov": 90,
                "key": API_KEY
            }
            
            url = f"{STREETVIEW_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
            resp = requests.get(url)
            
            if resp.status_code == 200 and len(resp.content) > 1000:
                filename = f"{pano_id[:12]}_h{heading:03d}_p{pitch:+03d}.jpg"
                filepath = output_path / filename
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                print(f"  Downloaded: {filename}")
    
    return True

def download_route(route_name: str, output_dir: Path):
    """Download all panoramas for a route"""
    if route_name not in ROUTES:
        print(f"Unknown route: {route_name}")
        return
    
    route_dir = output_dir / route_name
    route_dir.mkdir(parents=True, exist_ok=True)
    
    locations = ROUTES[route_name]
    metadata = []
    
    print(f"\nDownloading route: {route_name}")
    print(f"Locations: {len(locations)}")
    print("-" * 40)
    
    for loc in locations:
        print(f"\n{loc.name} ({loc.lat}, {loc.lng})")
        
        pano_id = get_pano_id(loc.lat, loc.lng)
        if not pano_id:
            print("  No Street View coverage")
            continue
        
        print(f"  Panorama ID: {pano_id}")
        download_panorama(pano_id, route_dir)
        
        metadata.append({
            "name": loc.name,
            "description": loc.description,
            "lat": loc.lat,
            "lng": loc.lng,
            "pano_id": pano_id
        })
    
    # Save metadata
    meta_path = route_dir / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nSaved metadata to {meta_path}")

def download_all_routes(output_dir: Path):
    """Download all defined routes"""
    for route_name in ROUTES:
        download_route(route_name, output_dir)

if __name__ == "__main__":
    output = Path(__file__).parent.parent / "panoramas" / "original"
    output.mkdir(parents=True, exist_ok=True)
    
    print("=" * 50)
    print("BIG ISLAND VR - PANORAMA DOWNLOADER")
    print("=" * 50)
    
    # Download specific route or all
    import sys
    if len(sys.argv) > 1:
        download_route(sys.argv[1], output)
    else:
        download_all_routes(output)
    
    print("\nDone!")
