#!/usr/bin/env python3
"""
Batch Process Big Island VR Panoramas

Processes all defined routes and locations through the AI enhancement pipeline.
Features:
- Resume interrupted runs
- Skip already-processed locations
- Detailed progress tracking
- Error logging and recovery

Usage:
    python batch_process.py                    # Process all locations
    python batch_process.py --route hilo       # Process specific route
    python batch_process.py --resume           # Resume from last run
    python batch_process.py --status           # Show processing status
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field

# Import the full pipeline
from full_pipeline import FullPipeline, PipelineResult

# Setup logging
LOG_FORMAT = '%(asctime)s [%(levelname)s] %(message)s'
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


@dataclass
class BatchProgress:
    """Tracks batch processing progress"""
    total_locations: int = 0
    processed: int = 0
    successful: int = 0
    failed: int = 0
    skipped: int = 0
    start_time: str = ""
    end_time: str = ""
    results: List[Dict] = field(default_factory=list)
    errors: List[Dict] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'BatchProgress':
        return cls(**data)


class BatchProcessor:
    """
    Batch processor for Big Island VR panoramas.
    
    Processes all locations in the locations.json database,
    tracking progress and handling errors gracefully.
    """
    
    def __init__(self, output_base: Path, locations_file: Path = None):
        self.output_base = Path(output_base)
        self.locations_file = locations_file or (self.output_base / "locations.json")
        self.progress_file = self.output_base / "batch_progress.json"
        self.log_file = self.output_base / "batch_log.txt"
        
        # Initialize pipeline
        self.pipeline = FullPipeline(
            output_base=self.output_base,
            skip_existing=True
        )
        
        # Setup file logging
        file_handler = logging.FileHandler(self.log_file)
        file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
        logger.addHandler(file_handler)
    
    def load_locations(self) -> Dict[str, Any]:
        """Load locations database"""
        if not self.locations_file.exists():
            logger.error(f"Locations file not found: {self.locations_file}")
            return {}
        
        with open(self.locations_file) as f:
            return json.load(f)
    
    def save_progress(self, progress: BatchProgress):
        """Save progress to file for resume capability"""
        with open(self.progress_file, 'w') as f:
            json.dump(progress.to_dict(), f, indent=2)
    
    def load_progress(self) -> Optional[BatchProgress]:
        """Load progress from previous run"""
        if not self.progress_file.exists():
            return None
        
        try:
            with open(self.progress_file) as f:
                data = json.load(f)
            return BatchProgress.from_dict(data)
        except Exception as e:
            logger.warning(f"Could not load progress file: {e}")
            return None
    
    def get_processed_locations(self) -> set:
        """Get set of already-processed location IDs"""
        processed = set()
        
        # Check processed directory for existing files
        processed_dir = self.output_base / "processed"
        if processed_dir.exists():
            for f in processed_dir.glob("*_panorama.jpg"):
                loc_id = f.stem.replace("_panorama", "")
                processed.add(loc_id)
        
        return processed
    
    def process_all(self, route_filter: str = None, 
                    resume: bool = False,
                    force: bool = False) -> BatchProgress:
        """
        Process all locations in the database.
        
        Args:
            route_filter: Only process locations in this route
            resume: Resume from last interrupted run
            force: Reprocess even if already done
        
        Returns:
            BatchProgress with results
        """
        # Load locations
        data = self.load_locations()
        if not data:
            return BatchProgress()
        
        locations = data.get("locations", [])
        routes = data.get("routes", {})
        
        # Filter by route if specified
        if route_filter:
            route_locations = routes.get(route_filter, [])
            if not route_locations:
                logger.error(f"Route not found: {route_filter}")
                logger.info(f"Available routes: {list(routes.keys())}")
                return BatchProgress()
            
            locations = [l for l in locations if l["name"] in route_locations]
            logger.info(f"Processing route '{route_filter}': {len(locations)} locations")
        
        # Load previous progress for resume
        already_processed = set()
        if resume:
            prev_progress = self.load_progress()
            if prev_progress:
                already_processed = {r.get("location_name") for r in prev_progress.results}
                logger.info(f"Resuming: {len(already_processed)} locations already processed")
        
        # Check for existing processed files
        if not force:
            file_processed = self.get_processed_locations()
            logger.info(f"Found {len(file_processed)} existing processed files")
        
        # Initialize progress
        progress = BatchProgress(
            total_locations=len(locations),
            start_time=datetime.now().isoformat()
        )
        
        # Process each location
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING: {len(locations)} LOCATIONS")
        logger.info("=" * 70)
        
        for i, loc in enumerate(locations, 1):
            name = loc.get("name", "Unknown")
            
            # Skip if already processed
            if name in already_processed:
                logger.info(f"[{i}/{len(locations)}] Skipping (already processed): {name}")
                progress.skipped += 1
                progress.processed += 1
                continue
            
            logger.info(f"\n[{i}/{len(locations)}] Processing: {name}")
            
            try:
                result = self.pipeline.process_location(
                    name=name,
                    lat=loc.get("lat"),
                    lng=loc.get("lng"),
                    pano_id=loc.get("pano_id"),
                    description=loc.get("description", "")
                )
                
                progress.processed += 1
                
                if result.success:
                    progress.successful += 1
                    progress.results.append(asdict(result))
                    
                    # Update locations.json with paths
                    loc["panorama_path"] = result.panorama_path
                    loc["depth_path"] = result.depth_path
                    loc["processed"] = True
                    loc["processed_date"] = datetime.now().isoformat()
                else:
                    progress.failed += 1
                    progress.errors.append({
                        "location": name,
                        "error": result.error,
                        "timestamp": datetime.now().isoformat()
                    })
                    logger.error(f"Failed: {result.error}")
                
                # Save progress after each location
                self.save_progress(progress)
                
            except KeyboardInterrupt:
                logger.info("\n\nInterrupted by user. Progress saved.")
                progress.end_time = datetime.now().isoformat()
                self.save_progress(progress)
                break
                
            except Exception as e:
                logger.error(f"Unexpected error processing {name}: {e}")
                progress.failed += 1
                progress.errors.append({
                    "location": name,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                self.save_progress(progress)
        
        # Finalize
        progress.end_time = datetime.now().isoformat()
        self.save_progress(progress)
        
        # Update locations.json with results
        data["locations"] = locations
        data["last_batch_run"] = datetime.now().isoformat()
        
        with open(self.locations_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Print summary
        self._print_summary(progress)
        
        return progress
    
    def _print_summary(self, progress: BatchProgress):
        """Print processing summary"""
        print("\n" + "=" * 70)
        print("BATCH PROCESSING COMPLETE")
        print("=" * 70)
        print(f"  Total locations: {progress.total_locations}")
        print(f"  Processed:       {progress.processed}")
        print(f"  Successful:      {progress.successful}")
        print(f"  Failed:          {progress.failed}")
        print(f"  Skipped:         {progress.skipped}")
        
        if progress.start_time and progress.end_time:
            start = datetime.fromisoformat(progress.start_time)
            end = datetime.fromisoformat(progress.end_time)
            duration = (end - start).total_seconds()
            print(f"  Duration:        {duration:.1f}s ({duration/60:.1f}m)")
        
        if progress.errors:
            print(f"\n  Errors ({len(progress.errors)}):")
            for err in progress.errors[:5]:  # Show first 5
                print(f"    - {err['location']}: {err['error'][:50]}")
            if len(progress.errors) > 5:
                print(f"    ... and {len(progress.errors) - 5} more")
        
        print("=" * 70)
    
    def show_status(self):
        """Show current processing status"""
        data = self.load_locations()
        if not data:
            print("No locations database found.")
            return
        
        locations = data.get("locations", [])
        routes = data.get("routes", {})
        
        processed = sum(1 for l in locations if l.get("processed"))
        with_coverage = sum(1 for l in locations if l.get("pano_id"))
        
        print("\n" + "=" * 60)
        print("BIG ISLAND VR - PROCESSING STATUS")
        print("=" * 60)
        print(f"\nTotal locations:    {len(locations)}")
        print(f"With Street View:   {with_coverage}")
        print(f"Processed:          {processed}")
        print(f"Remaining:          {len(locations) - processed}")
        
        print(f"\nRoutes ({len(routes)}):")
        for route_name, route_locs in routes.items():
            route_processed = sum(
                1 for name in route_locs 
                if any(l.get("processed") and l["name"] == name for l in locations)
            )
            print(f"  {route_name}: {route_processed}/{len(route_locs)} processed")
        
        # Check for progress file
        progress = self.load_progress()
        if progress:
            print(f"\nLast batch run: {progress.start_time}")
            if progress.errors:
                print(f"  Errors: {len(progress.errors)}")
        
        print("=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Batch Process Big Island VR Panoramas",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument("--route", "-r", type=str, 
                        help="Process only this route")
    parser.add_argument("--resume", action="store_true",
                        help="Resume from last interrupted run")
    parser.add_argument("--force", "-f", action="store_true",
                        help="Reprocess already-completed locations")
    parser.add_argument("--status", "-s", action="store_true",
                        help="Show processing status")
    parser.add_argument("--output", "-o", type=str,
                        help="Output directory")
    parser.add_argument("--locations", "-l", type=str,
                        help="Locations JSON file")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Verbose output")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Determine paths
    if args.output:
        output_base = Path(args.output)
    else:
        output_base = Path(__file__).parent.parent / "panoramas"
    
    if args.locations:
        locations_file = Path(args.locations)
    else:
        locations_file = output_base / "locations.json"
    
    # Initialize processor
    processor = BatchProcessor(
        output_base=output_base,
        locations_file=locations_file
    )
    
    # Show status
    if args.status:
        processor.show_status()
        return 0
    
    # Process
    progress = processor.process_all(
        route_filter=args.route,
        resume=args.resume,
        force=args.force
    )
    
    # Exit code based on success
    if progress.failed > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
