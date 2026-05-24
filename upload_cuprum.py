import csv
import json
import urllib.request
import urllib.error
import sys

# Configuration
CSV_PATH = r"F:\Bajadas\Chrome\AFP_Cuprum.csv"
SUPABASE_URL = "https://dinrwcwdxmkcbtyxqlbn.supabase.co"
# Using the public 'anon' key. If RLS blocks it, the user can replace it with their 'service_role' key.
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbnJ3Y3dkeG1rY2J0eXhxbGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjc3ODQsImV4cCI6MjA4OTcwMzc4NH0.AbCoopMj6XVzURhsfLFPahLkt6b-kyO6C0g9q2hlzmE"

def parse_spanish_date(date_str):
    # Standardize Spanish month names to numerical months
    parts = date_str.lower().split('-')
    if len(parts) != 3:
        return date_str
    day = int(parts[0])
    month_str = parts[1]
    year = int(parts[2])
    
    months_map = {
        'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'ago': 8, 'sep': 9, 'set': 9, 'oct': 10, 'nov': 11, 'dic': 12
    }
    
    month = months_map.get(month_str)
    if not month:
        return date_str
        
    if year <= 50:
        year += 2000
    else:
        year += 1900
        
    return f"{year:04d}-{month:02d}-{day:02d}"

def parse_spanish_float(val_str):
    if not val_str:
        return None
    try:
        # Remove dots (thousands) and replace comma with dot (decimal)
        clean_str = val_str.replace('.', '').replace(',', '.')
        return float(clean_str)
    except ValueError:
        return None

def upload_data():
    print(f"Reading CSV from {CSV_PATH}...")
    records = []
    
    try:
        with open(CSV_PATH, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')
            for row in reader:
                record = {
                    "id": int(row["id"]) if "id" in row and row["id"] else None,
                    "fecha": parse_spanish_date(row["fecha"]),
                    "fondo_a": parse_spanish_float(row["fondo_a"]),
                    "fondo_b": parse_spanish_float(row["fondo_b"]),
                    "fondo_c": parse_spanish_float(row["fondo_c"]),
                    "fondo_d": parse_spanish_float(row["fondo_d"]),
                    "fondo_e": parse_spanish_float(row["fondo_e"])
                }
                # Filter out fields with None values
                record = {k: v for k, v in record.items() if v is not None}
                records.append(record)
    except FileNotFoundError:
        print(f"Error: File not found at {CSV_PATH}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        sys.exit(1)
        
    if not records:
        print("No records found in CSV.")
        sys.exit(0)
        
    print(f"Parsed {len(records)} records. Example:")
    print(json.dumps(records[0], indent=2))
    
    url = f"{SUPABASE_URL}/rest/v1/cuprum"
    headers = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    body = json.dumps(records).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    
    print("Uploading to Supabase...")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            print(f"Upload successful! HTTP Status: {status}")
    except urllib.error.HTTPError as e:
        response_body = e.read().decode()
        print(f"HTTP Error {e.code}: {response_body}")
        
        # If there's an RLS issue or write restriction, suggest service role key
        if e.code in (401, 403, 400):
            print("\nTip: If this is a permission error (e.g., Row Level Security) or validation error,")
            print("please replace API_KEY in this script with your Supabase 'service_role' (secret) key.")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    upload_data()
