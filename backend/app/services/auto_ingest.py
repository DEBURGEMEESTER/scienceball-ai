import os
import sys
import subprocess
from app.services.data_sync import DataSyncService

class AutoIngestionScheduler:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.scripts_dir = os.path.join(self.base_dir, "scripts")
        self.sync_service = DataSyncService()

    def run_pipeline(self):
        print("🚀 Starting Auto-Ingestion Pipeline...")
        report = {"scraped_file": None, "ingestion_status": "skipped", "sync_stats": None}

        # Step 1: Scrape
        scraper_script = os.path.join(self.scripts_dir, "scrape_open_data.py")
        print(f"   Running Scraper: {scraper_script}")
        try:
            # Running as subprocess to keep environment clean
            result = subprocess.run([sys.executable, scraper_script], capture_output=True, text=True)
            if result.returncode == 0:
                print(result.stdout)
                # Parse filename from stdout if needed, or check dir
                # For now assume success if valid exit code
            else:
                print(f"❌ Scraper failed: {result.stderr}")
                return report
        except Exception as e:
            print(f"❌ Scraper Execution Error: {e}")
            return report

        # Step 2: Ingest
        ingest_script = os.path.join(self.scripts_dir, "ingest_external.py")
        print(f"   Running Ingestion Engine: {ingest_script}")
        try:
            result = subprocess.run([sys.executable, ingest_script], capture_output=True, text=True)
            if result.returncode == 0:
                print(result.stdout)
                report["ingestion_status"] = "success"
            else:
                print(f"❌ Ingestion failed: {result.stderr}")
                return report
        except Exception as e:
            print(f"❌ Ingestion Execution Error: {e}")
            return report

        # Step 3: Sync to Live DB
        print("   Running DataSyncService...")
        try:
            stats = self.sync_service.sync_database()
            print(f"✅ Sync Complete: {stats}")
            report["sync_stats"] = sync_stats
        except Exception as e:
            print(f"❌ Sync Error: {e}")

        print("🏁 Pipeline Finished.")
        return report

if __name__ == "__main__":
    scheduler = AutoIngestionScheduler()
    scheduler.run_pipeline()
