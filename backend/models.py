import sqlite3

DB_PATH = "backend/database.db"

def get_connection():
    """Devuelve una conexión a la base de datos."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    """Crea las tablas necesarias si no existen."""
    conn = get_connection()
    cur = conn.cursor()

    # Tabla de estudiantes
    cur.execute("""
    CREATE TABLE IF NOT EXISTS Students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,       -- PRIMARY (no PRIMARI)
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        "group" TEXT NOT NULL,
        allergies TEXT,
        emergency_contact TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Tabla de asistencia
    cur.execute("""
    CREATE TABLE IF NOT EXISTS Attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,      -- INTEGER, PRIMARY
        student_id INTEGER NOT NULL,               -- student_id (no studen_id)
        date DATE NOT NULL,
        status TEXT CHECK(status IN ('Presente','Ausente')) NOT NULL,
        FOREIGN KEY(student_id) REFERENCES Students(id)  -- REFERENCES (no REFERNECES)
    );
    """)

    # Tabla de cuestionarios de desarrollo
    cur.execute("""
    CREATE TABLE IF NOT EXISTS DevelopmentChecklists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,               -- idem: student_id
        date DATE NOT NULL,
        motor_skills INTEGER CHECK(motor_skills BETWEEN 1 AND 5),
        language_skills INTEGER CHECK(language_skills BETWEEN 1 AND 5),
        social_skills INTEGER CHECK(social_skills BETWEEN 1 AND 5),
        emotional_state INTEGER CHECK(emotional_state BETWEEN 1 AND 5),
        notes TEXT,
        FOREIGN KEY(student_id) REFERENCES Students(id)
    );
    """)

    conn.commit()
    conn.close()
