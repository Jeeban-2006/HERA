import pandas as pd
import numpy as np
import random
from pathlib import Path
import sys

# Add app to path to import constants
sys.path.append(str(Path(__file__).parent.parent))
from app.ml.constants import SYMPTOM_ORDER, SUBTYPES

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE = DATA_DIR / "pcod_synthetic.csv"

def generate_row(subtype):
    row = {symptom: 0 for symptom in SYMPTOM_ORDER}
    
    # 1. Base probabilities based on subtype
    if subtype == "insulin_resistant":
        row["weight_gain"] = 1 if random.random() < 0.85 else 0
        row["acne"] = 1 if random.random() < 0.6 else 0
        row["skin_darkening"] = 1 if random.random() < 0.7 else 0
        row["fatigue"] = 1 if random.random() < 0.5 else 0
        
        sleep_hours = round(random.uniform(5, 9), 1)
        stress_level = random.randint(3, 8)
        exercise_days = random.randint(0, 3) # Skew low
        water_intake = random.randint(2, 10)
        
        insulin = round(random.uniform(20, 40), 1) # Skew high
        glucose = round(random.uniform(95, 180), 1) # Skew high
        lh_fsh_ratio = round(random.uniform(0.5, 2), 1) # Normal
        testosterone = round(random.uniform(20, 70), 1)
        amh = round(random.uniform(1.5, 5), 1)
        
    elif subtype == "inflammatory":
        row["bloating"] = 1 if random.random() < 0.8 else 0
        row["fatigue"] = 1 if random.random() < 0.85 else 0
        row["pelvic_pain"] = 1 if random.random() < 0.6 else 0
        row["brain_fog"] = 1 if random.random() < 0.5 else 0
        
        sleep_hours = round(random.uniform(3, 6), 1) # Skew low
        stress_level = random.randint(5, 10)
        exercise_days = random.randint(1, 5)
        water_intake = random.randint(3, 8)
        
        insulin = round(random.uniform(2, 15), 1) # Normal
        glucose = round(random.uniform(60, 100), 1) # Normal
        lh_fsh_ratio = round(random.uniform(0.5, 2.5), 1)
        testosterone = round(random.uniform(40, 70), 1) # Mildly elevated
        amh = round(random.uniform(1.0, 4.0), 1)
        
    elif subtype == "adrenal":
        row["mood_swings"] = 1 if random.random() < 0.85 else 0
        row["brain_fog"] = 1 if random.random() < 0.7 else 0
        row["hair_thinning"] = 1 if random.random() < 0.6 else 0
        row["low_libido"] = 1 if random.random() < 0.65 else 0
        
        sleep_hours = round(random.uniform(4, 7), 1)
        stress_level = random.randint(7, 10) # Skew high
        exercise_days = random.randint(2, 6)
        water_intake = random.randint(4, 10)
        
        insulin = round(random.uniform(2, 18), 1)
        glucose = round(random.uniform(70, 95), 1)
        lh_fsh_ratio = round(random.uniform(0.5, 2.0), 1) # Normal
        testosterone = round(random.uniform(60, 100), 1) # High (DHEA-S proxy)
        amh = round(random.uniform(1.5, 4.5), 1)
        
    else: # post_pill
        row["irregular_periods"] = 1 if random.random() < 0.9 else 0
        row["acne"] = 1 if random.random() < 0.4 else 0
        row["absent_periods"] = 1 if random.random() < 0.5 else 0
        
        sleep_hours = round(random.uniform(6, 9), 1)
        stress_level = random.randint(2, 7)
        exercise_days = random.randint(1, 4)
        water_intake = random.randint(4, 10)
        
        insulin = round(random.uniform(2, 15), 1) # Normal
        glucose = round(random.uniform(70, 90), 1) # Normal
        lh_fsh_ratio = round(random.uniform(2, 4), 1) # Elevated (rebound)
        testosterone = round(random.uniform(15, 50), 1)
        amh = round(random.uniform(4, 12), 1) # Elevated
        
    # 2. Add 10% random noise to all symptoms regardless of subtype
    for symptom in SYMPTOM_ORDER:
        if random.random() < 0.1:
            row[symptom] = 1 - row[symptom] # flip bit
            
    # Compile features
    row["sleep_hours"] = sleep_hours
    row["stress_level"] = stress_level
    row["exercise_days"] = exercise_days
    row["water_intake"] = water_intake
    
    row["insulin"] = insulin
    row["testosterone"] = testosterone
    row["lh_fsh_ratio"] = lh_fsh_ratio
    row["amh"] = amh
    row["glucose"] = glucose
    
    row["subtype"] = subtype
    
    return row

def generate_dataset(num_rows=100000):
    print(f"Generating {num_rows} synthetic rows...")
    data = []
    
    for _ in range(num_rows):
        subtype = random.choice(SUBTYPES)
        data.append(generate_row(subtype))
        
    df = pd.DataFrame(data)
    
    # 3. Randomly set ~30% of lab values to NaN, then fill with -1
    lab_cols = ["insulin", "testosterone", "lh_fsh_ratio", "amh", "glucose"]
    for col in lab_cols:
        mask = np.random.rand(len(df)) < 0.3
        df.loc[mask, col] = np.nan
        
    df[lab_cols] = df[lab_cols].fillna(-1)
    
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Dataset saved to {OUTPUT_FILE}")
    print("\nSubtype Distribution:")
    print(df['subtype'].value_counts())

if __name__ == "__main__":
    np.random.seed(42)
    random.seed(42)
    generate_dataset()
