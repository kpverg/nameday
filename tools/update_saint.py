import sys
import os
import uuid
import shutil
import sqlite3
from PyQt5.QtWidgets import (
    QApplication, QWidget, QLabel, QLineEdit, QComboBox,
    QTextEdit, QPushButton, QVBoxLayout, QHBoxLayout,
    QMessageBox, QFileDialog
)

# === ΡΥΘΜΙΣΕΙΣ ΜΟΝΟΠΑΤΙΩΝ ===
# Το αρχείο αυτό τρέχει από τον φάκελο tools/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "android", "app", "src", "main", "assets", "www", "appdata_v2.db")
IMG_DIR = os.path.join(BASE_DIR, "img")
ASSETS_IMG_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "assets", "img")

# Διασφάλιση ότι υπάρχουν οι φάκελοι
for d in [IMG_DIR, ASSETS_IMG_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

# Greek month names
GREEK_MONTHS = {
    1: 'Ιανουάριος', 2: 'Φεβρουάριος', 3: 'Μάρτιος', 4: 'Απρίλιος',
    5: 'Μάιος', 6: 'Ιούνιος', 7: 'Ιούλιος', 8: 'Αύγουστος',
    9: 'Σεπτέμβριος', 10: 'Οκτώβριος', 11: 'Νοέμβριος', 12: 'Δεκέμβριος'
}

class SaintUploaderLocal(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Saint Bio & Icon Manager (Local SQLite)")
        self.selected_image_path = "" # Προσωρινή αποθήκευση path εικόνας

        # Fields
        self.name_input = QLineEdit()
        self.day_input = QLineEdit()
        self.month_input = QComboBox()
        self.bio_input = QTextEdit()
        self.apolitikio_input = QTextEdit()
        
        # Image elements
        self.image_label = QLabel("Δεν έχει επιλεγεί εικόνα")
        self.image_label.setStyleSheet("color: gray; font-style: italic;")
        self.select_image_btn = QPushButton("Επιλογή Εικόνας / Icon")
        self.select_image_btn.clicked.connect(self.select_image)

        # Labels
        name_label = QLabel("Όνομα Αγίου:")
        day_label = QLabel("Ημέρα Γιορτής (1-31):")
        month_label = QLabel("Μήνας:")
        bio_label = QLabel("Βίος:")
        apolitikio_label = QLabel("Απολυτίκιο:")

        # Submit Button
        self.submit_button = QPushButton("Αποθήκευση στην Τοπική Βάση")
        self.submit_button.setFixedHeight(40)
        self.submit_button.setStyleSheet("background-color: #0277bd; color: white; font-weight: bold;")
        self.submit_button.clicked.connect(self.save_to_sqlite)

        # Layout Setup
        layout = QVBoxLayout()
        layout.addWidget(name_label)
        layout.addWidget(self.name_input)

        h_layout = QHBoxLayout()
        v_day = QVBoxLayout()
        v_day.addWidget(day_label)
        v_day.addWidget(self.day_input)
        v_month = QVBoxLayout()
        v_month.addWidget(month_label)
        v_month.addWidget(self.month_input)
        h_layout.addLayout(v_day)
        h_layout.addLayout(v_month)
        layout.addLayout(h_layout)

        # Populate month combo
        self.month_input.addItem("Επίλεξε μήνα")
        for i in range(1, 13):
            self.month_input.addItem(GREEK_MONTHS[i])

        layout.addWidget(bio_label)
        layout.addWidget(self.bio_input)

        layout.addWidget(apolitikio_label)
        layout.addWidget(self.apolitikio_input)

        # Image Section Layout
        layout.addSpacing(10)
        layout.addWidget(QLabel("Εικονίδιο Αγίου:"))
        layout.addWidget(self.image_label)
        layout.addWidget(self.select_image_btn)
        layout.addSpacing(20)

        layout.addWidget(self.submit_button)

        self.setLayout(layout)

    def select_image(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Επιλογή Εικόνας", "", "Image Files (*.png *.jpg *.jpeg *.webp)"
        )
        if file_path:
            self.selected_image_path = file_path
            self.image_label.setText(f"Επιλέχθηκε: {os.path.basename(file_path)}")
            self.image_label.setStyleSheet("color: blue; font-weight: bold;")

    def save_image_locally(self, source_path):
        """Αντιγράφει την εικόνα στον φάκελο img/ του project και στα assets του Android"""
        if not source_path:
            return None
        
        try:
            file_extension = os.path.splitext(source_path)[1]
            unique_filename = f"saint_{uuid.uuid4().hex[:8]}{file_extension}"
            
            # Copy to project img/ folder
            dest_path = os.path.join(IMG_DIR, unique_filename)
            shutil.copy2(source_path, dest_path)
            
            # Copy to android assets folder
            asset_dest_path = os.path.join(ASSETS_IMG_DIR, unique_filename)
            shutil.copy2(source_path, asset_dest_path)
            
            # Επιστρέφουμε τη σχετική διαδρομή για τη βάση
            return f"img/{unique_filename}"
        except Exception as e:
            print(f"Image Copy Error: {e}")
            return None

    def save_to_sqlite(self):
        name = self.name_input.text().strip()
        feast_day = self.day_input.text().strip()
        feast_month_idx = self.month_input.currentIndex()
        bio = self.bio_input.toPlainText().strip()
        apolitikio = self.apolitikio_input.toPlainText().strip()

        # Validation
        if not name or not feast_day.isdigit() or feast_month_idx == 0:
            QMessageBox.warning(self, "Σφάλμα", "Παρακαλώ συμπληρώστε Όνομα, Ημέρα και Μήνα.")
            return

        day_num = int(feast_day)
        month_name = GREEK_MONTHS.get(feast_month_idx)

        # 1. Copy Image if exists
        image_filename = None
        if self.selected_image_path:
            image_filename = self.save_image_locally(self.selected_image_path)

        # 2. Database Operation
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Δημιουργία πίνακα αν δεν υπάρχει (για ασφάλεια)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS saint (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    feast_day TEXT,
                    bio TEXT,
                    apolitikio TEXT,
                    image_url TEXT,
                    feast_month TEXT
                )
            ''')

            new_id = str(uuid.uuid4())
            # Εισαγωγή δεδομένων
            # Σημείωση: Στο image_url βάζουμε το όνομα του αρχείου που σώθηκε στο img/
            cursor.execute('''
                INSERT INTO saint (id, name, feast_day, feast_month, bio, apolitikio, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (new_id, name, str(day_num), month_name, bio, apolitikio, image_filename))
            
            conn.commit()
            conn.close()
            
            QMessageBox.information(self, "Επιτυχία", f"Ο Άγιος {name} αποθηκεύτηκε στην τοπική βάση!\n\nΜην ξεχάσετε να τρέξετε 'npm run android' για να ενημερωθεί το κινητό.")
            self.clear_fields()
            
        except Exception as e:
            QMessageBox.critical(self, "Σφάλμα", f"Σφάλμα κατά την αποθήκευση στην SQLite: {str(e)}")

    def clear_fields(self):
        self.name_input.clear()
        self.day_input.clear()
        self.month_input.setCurrentIndex(0)
        self.bio_input.clear()
        self.apolitikio_input.clear()
        self.selected_image_path = ""
        self.image_label.setText("Δεν έχει επιλεγεί εικόνα")
        self.image_label.setStyleSheet("color: gray; font-style: italic;")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SaintUploaderLocal()
    window.resize(450, 700)
    window.show()
    sys.exit(app.exec_())
