import requests
import os
import csv
import time

class OpenDataScraper:
    # Using a placeholder URL for safety - in production this would be a raw GitHub URL
    # e.g., "https://raw.githubusercontent.com/jokecamp/FootballData/master/Euro2024.csv"
    TARGET_URL = "https://raw.githubusercontent.com/lcjmo-mock/football-data/master/latest_transfer_updates.csv"
    
    INCOMING_DIR = "data/incoming"

    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.incoming_path = os.path.join(self.base_dir, self.INCOMING_DIR)

    def fetch_data(self):
        print(f"📡 Connecting to Open Data Source: {self.TARGET_URL}...")
        
        # MOCKING THE NETWORK CALL FOR SAFETY
        # In a real scenario, we use: response = requests.get(self.TARGET_URL)
        print("   (Simulating network download to avoid pollution...)")
        
        # Simulating a CSV content with a "Live Update"
        mock_csv_content = [
            ["Name", "Club", "xG", "PassCompletion"],
            ["Brian Brobbey", "RB Leipzig", "0.75", "78"], # Simulating a transfer!
            ["Jorrel Hato", "Arsenal", "0.05", "92"]      # Simulating another transfer!
        ]
        
        timestamp = int(time.time())
        filename = f"open_data_update_{timestamp}.csv"
        file_path = os.path.join(self.incoming_path, filename)
        
        try:
            with open(file_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerows(mock_csv_content)
            
            print(f"✅ Data harvested and saved to: {filename}")
            return filename
        except Exception as e:
            print(f"❌ Scraping failed: {e}")
            return None

if __name__ == "__main__":
    scraper = OpenDataScraper()
    scraper.fetch_data()
