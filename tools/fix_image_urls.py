import sqlite3
import os

# === ΡΥΘΜΙΣΕΙΣ ΜΟΝΟΠΑΤΙΩΝ ===
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "android", "app", "src", "main", "assets", "www", "appdata_v2.db")

def fix_image_urls():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Παίρνουμε όλους τους Αγίους που έχουν URL από Supabase
        cursor.execute("SELECT id, image_url FROM saint WHERE image_url LIKE '%supabase.co%'")
        rows = cursor.fetchall()

        if not rows:
            print("Δεν βρέθηκαν image_urls που να χρειάζονται διόρθωση.")
            return

        print(f"Βρέθηκαν {len(rows)} εγγραφές για διόρθωση...")
        
        updated_count = 0
        for row_id, old_url in rows:
            # Το παλιό URL είναι της μορφής: https://.../Agiografies/filename.jpg
            # Θέλουμε να κρατήσουμε μόνο το filename.jpg και να προσθέσουμε το img/
            filename = old_url.split('/')[-1]
            new_url = f"img/{filename}"
            
            cursor.execute("UPDATE saint SET image_url = ? WHERE id = ?", (new_url, row_id))
            updated_count += 1

        conn.commit()
        conn.close()
        print(f"Επιτυχία! Ενημερώθηκαν {updated_count} εγγραφές.")
        print("Τα image_urls έχουν πλέον τη μορφή 'img/filename.jpg'.")

    except Exception as e:
        print(f"Σφάλμα κατά τη διάρκεια της διόρθωσης: {e}")

if __name__ == "__main__":
    fix_image_urls()
