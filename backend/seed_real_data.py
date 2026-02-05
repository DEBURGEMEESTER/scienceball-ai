import pandas as pd
import requests
from bs4 import BeautifulSoup
from app.core.db import engine, init_db
from app.models.player import Player
from sqlmodel import Session, select
import uuid
import random
import time
import io

# --- CONFIGURATION ---
LEAGUES = [
    {"name": "Premier League", "url": "https://fbref.com/en/comps/9/stats/Premier-League-Stats"},
    {"name": "La Liga", "url": "https://fbref.com/en/comps/12/stats/La-Liga-Stats"},
    {"name": "Bundesliga", "url": "https://fbref.com/en/comps/20/stats/Bundesliga-Stats"},
    {"name": "Serie A", "url": "https://fbref.com/en/comps/11/stats/Serie-A-Stats"},
    {"name": "Ligue 1", "url": "https://fbref.com/en/comps/13/stats/Ligue-1-Stats"},
    {"name": "Eredivisie", "url": "https://fbref.com/en/comps/23/stats/Eredivisie-Stats"},
    {"name": "Primeira Liga", "url": "https://fbref.com/en/comps/32/stats/Primeira-Liga-Stats"}
]
SEASON = "2024-2025"

def scrape_fbref(league_name, league_url):
    print(f"📡 Connecting to FBref for {league_name}: {league_url}...")
    try:
        # FBref often blocks automated requests, so we need headers
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(league_url, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Error: Failed to fetch page. Status: {response.status_code}")
            return None

        # Parse tables with pandas
        # The main stats table is usually the first one or id='stats_standard_dom_lg'
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try to find the specific table for the league (ID varies by comp ID in URL)
        # Extract comp ID from URL for table ID construction (e.g., '9' from 'comps/9/...')
        try:
             comp_id = league_url.split('/comps/')[1].split('/')[0]
             table_id = f'stats_standard_{comp_id}'
             table = soup.find('table', {'id': table_id})
        except:
             table = None

        if not table:
             # Fallback for generic class if ID changes
             print("⚠️  Specific table ID not found, trying generic search...")
             tables = pd.read_html(io.BytesIO(response.content))
             df = tables[0]
        else:
             df = pd.read_html(str(table))[0]
        
        # Cleanup Multi-level headers
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.droplevel(0)
            
        print(f"✅ Scraped {len(df)} rows form {league_name}.")
        return df

    except Exception as e:
        print(f"❌ Scraping Fatal Error for {league_name}: {e}")
        return None

def clean_and_seed(df, league_name):
    if df is None:
        return

    print(f"🧹 Cleaning data for {league_name}...")
    
    # Remove spacer rows (FBref repeats headers)
    df = df[df['Rk'] != 'Rk']
    df = df.dropna(subset=['Player'])
    
    players_added = 0
    
    with Session(engine) as session:
        for _, row in df.iterrows():
            name = row['Player']
            squad = row['Squad']
            
            # Skip if exists
            existing = session.exec(select(Player).where(Player.name == name)).first()
            if existing:
                continue

            # --- PARSE BASIC STATS ---
            try:
                age = int(row['Age'].split('-')[0]) if '-' in str(row['Age']) else int(row['Age'])
            except:
                age = 24 # Fallback
                
            position = row['Pos'].split(',')[0] if pd.notna(row['Pos']) else "MF"
            
            # --- SIMULATION ENGINE (The "Science" Part) ---
            # We derive "Market Value" and "xT" from real stats to make it feel authentic
            
            # 1. Calculate a "Performance Score" based on Goals/Assists
            goals = float(row.get('Gls', 0))
            assists = float(row.get('Ast', 0))
            matches = float(row.get('MP', 1))
            
            # 2. Simulate Market Value (Base + Performance + Youth Premium)
            base_val = 1.0
            # Higher leagues have higher base value multiplier
            league_multiplier = 1.5 if league_name in ["Premier League", "La Liga"] else 1.0
            
            perf_mod = ((goals * 0.5) + (assists * 0.3)) * league_multiplier
            age_mod = (30 - age) * 0.5 if age < 30 else 0
            
            final_val = (base_val + perf_mod + age_mod) * league_multiplier
            market_value_str = f"€{final_val:.1f}M"
            
            # 3. Simulate Expected Threat (xT) - Correlate with Assists/Passes
            xt = (assists / matches) * 2.5 + random.uniform(0.1, 0.4)
            xt = min(xt, 1.2) # Cap at realistic max
            
            attributes = {
                "Goals": goals,
                "Assists": assists,
                "Matches": matches,
                "xG": row.get('xG', 0),
                "npxG": row.get('npxG', 0),
                "xAG": row.get('xAG', 0),
                "Prog": row.get('PrgC', 0) # Progressive Carries often labeled PrgC or similar
            }
            
            new_player = Player(
                id=str(uuid.uuid4()),
                name=name,
                club=squad,
                league=league_name,
                position=position,
                age=age,
                nationality=row.get('Nation', 'NED').split(' ')[-1],
                image="/defaults/player_placeholder.png",
                market_value=market_value_str,
                predicted_growth=random.uniform(2.0, 9.5),
                tactical_role="Balanced", # Could deduce from stats later
                contract_expiry="2027-06-30",
                metrics=[{"name": "xT", "value": round(xt, 2)}],
                attributes=attributes
            )
            
            session.add(new_player)
            players_added += 1
            
        session.commit()
    
    print(f"🚀 Success! Seeded {players_added} real players from {league_name}.")

if __name__ == "__main__":
    # Initialize DB specifically here if running as script
    # This ensures tables exist before we try to add to them
    init_db()
    
    total_leagues = len(LEAGUES)
    print(f"🌍 Starting global scrape for {total_leagues} leagues...")
    
    for i, league in enumerate(LEAGUES):
        print(f"\n--- Processing {league['name']} ({i+1}/{total_leagues}) ---")
        df = scrape_fbref(league['name'], league['url'])
        clean_and_seed(df, league['name'])
        
        if i < total_leagues - 1:
            print("⏳ Sleeping for 4 seconds to respect rate limits...")
            time.sleep(4)
            
    print("\n✅ Global database update complete!")
