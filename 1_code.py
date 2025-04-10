import sqlite3
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox
from ttkthemes import ThemedTk

def setup_database():
    conn = sqlite3.connect('specimen_records.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS specimens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            microscope_size REAL NOT NULL,
            actual_size REAL NOT NULL,
            date_added TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_measurement(username, microscope_size, actual_size):
    conn = sqlite3.connect('specimen_records.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO specimens (username, microscope_size, actual_size, date_added)
        VALUES (?, ?, ?, ?)
    ''', (username, microscope_size, actual_size, datetime.now()))
    conn.commit()
    conn.close()

def original_size(microscope_size, magn):
    '''
   Calculates the real ife size of the organism given the microscope size
    '''
    specimen_size = microscope_size / magn * 1000
    return specimen_size

class SpecimenCalculator(ThemedTk):
    def __init__(self):
        super().__init__(theme="azure")  # Using a modern theme

        self.title("Specimen Size Calculator")
        self.geometry("600x700")
        self.configure(bg="#f0f0f0")

        style = ttk.Style()
        style.configure("Title.TLabel", font=("Helvetica", 16, "bold"), padding=10)
        style.configure("Custom.TFrame", background="#ffffff", relief="raised")
        style.configure("Custom.TButton", font=("Helvetica", 10), padding=10)
        style.configure("Result.TLabel", font=("Helvetica", 12), foreground="#2E7D32")
        
        # Create main frame with custom styling
        main_frame = ttk.Frame(self, padding="20", style="Custom.TFrame")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=20, pady=20)

        # Title
        title_label = ttk.Label(main_frame, text="Specimen Size Calculator", style="Title.TLabel")
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))

        # Input Frame
        input_frame = ttk.LabelFrame(main_frame, text="Input Details", padding="10")
        input_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 20))

        # Username entry with icon
        ttk.Label(input_frame, text="👤 Username:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.username = ttk.Entry(input_frame, width=30)
        self.username.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)

        # Microscope size entry
        ttk.Label(input_frame, text="🔍 Microscope Size (mm):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.microscope_size = ttk.Entry(input_frame, width=30)
        self.microscope_size.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)

        # Magnification entry
        ttk.Label(input_frame, text="🔎 Magnification:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.magnification = ttk.Entry(input_frame, width=30)
        self.magnification.grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)

        # Calculate button
        calc_button = ttk.Button(main_frame, text="Calculate Size", command=self.calculate, style="Custom.TButton")
        calc_button.grid(row=2, column=0, columnspan=2, pady=20)

        # Result display
        self.result_var = tk.StringVar()
        result_label = ttk.Label(main_frame, textvariable=self.result_var, style="Result.TLabel")
        result_label.grid(row=3, column=0, columnspan=2, pady=10)

        # Recent measurements frame
        history_frame = ttk.LabelFrame(main_frame, text="Recent Measurements", padding="10")
        history_frame.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(20, 0))

        # Treeview for measurements
        self.tree = ttk.Treeview(history_frame, columns=('Username', 'Microscope Size', 'Actual Size', 'Date'), 
                                show='headings', height=5)
        
        # Configure columns
        self.tree.heading('Username', text='Username')
        self.tree.heading('Microscope Size', text='Microscope Size (mm)')
        self.tree.heading('Actual Size', text='Actual Size (µm)')
        self.tree.heading('Date', text='Date')
        
        # Column widths
        self.tree.column('Username', width=100)
        self.tree.column('Microscope Size', width=120)
        self.tree.column('Actual Size', width=120)
        self.tree.column('Date', width=150)
        
        self.tree.grid(row=0, column=0, pady=10)

        # Add scrollbar
        scrollbar = ttk.Scrollbar(history_frame, orient=tk.VERTICAL, command=self.tree.yview)
        scrollbar.grid(row=0, column=1, sticky='ns')
        self.tree.configure(yscrollcommand=scrollbar.set)

        # Configure grid weights
        self.grid_columnconfigure(0, weight=1)
        main_frame.grid_columnconfigure(1, weight=1)
        
        # Initialize database
        setup_database()
        self.load_recent_measurements()

    def calculate(self):
        try:
            username = self.username.get()
            microscope_size = float(self.microscope_size.get())
            magn = int(self.magnification.get())

            if not username:
                messagebox.showerror("Error", "Please enter a username")
                return

            actual_size = original_size(microscope_size, magn)
            self.result_var.set(f"✨ Original size of specimen: {actual_size:.2f} µm")
            
            save_measurement(username, microscope_size, actual_size)
            self.load_recent_measurements()
            
        except ValueError:
            messagebox.showerror("Error", "Please enter valid numbers")

    def load_recent_measurements(self):
        for item in self.tree.get_children():
            self.tree.delete(item)
            
        conn = sqlite3.connect('specimen_records.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT username, microscope_size, actual_size, date_added 
            FROM specimens 
            ORDER BY date_added DESC 
            LIMIT 5
        ''')
        
        for row in cursor.fetchall():
            formatted_row = (
                row[0],
                f"{row[1]:.2f}",
                f"{row[2]:.2f}",
                datetime.strptime(row[3], '%Y-%m-%d %H:%M:%S.%f').strftime('%Y-%m-%d %H:%M')
            )
            self.tree.insert('', 'end', values=formatted_row)
        
        conn.close()

# Keep existing database functions unchanged
if __name__ == "__main__":
    app = SpecimenCalculator()
    app.mainloop()
