from flask import Blueprint, request, jsonify, abort
from .models import get_connection

development_bp = Blueprint("development", __name__)

# Listar todos los cuestionarios
@development_bp.route("/development_checklists", methods=["GET"])
def list_checklists():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM DevelopmentChecklists")
    rows = cur.fetchall()
    conn.close()
    checklists = [dict(row) for row in rows]
    return jsonify(checklists)

# Crear un nuevo cuestionario
@development_bp.route("/development_checklists", methods=["POST"])
def create_checklist():
    data = request.get_json()
    student_id = data.get("student_id")
    date = data.get("date")
    motor = data.get("motor_skills")
    language = data.get("language_skills")
    social = data.get("social_skills")
    emotional = data.get("emotional_state")
    notes = data.get("notes", "")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO DevelopmentChecklists (
            student_id, date, motor_skills, language_skills,
            social_skills, emotional_state, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (student_id, date, motor, language, social, emotional, notes))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()

    return jsonify({
        "id": new_id,
        "student_id": student_id,
        "date": date,
        "motor_skills": motor,
        "language_skills": language,
        "social_skills": social,
        "emotional_state": emotional,
        "notes": notes
    }), 201

# Actualizar un cuestionario existente
@development_bp.route("/development_checklists/<int:checklist_id>", methods=["PUT"])
def update_checklist(checklist_id):
    data = request.get_json()
    student_id = data.get("student_id")
    date = data.get("date")
    motor = data.get("motor_skills")
    language = data.get("language_skills")
    social = data.get("social_skills")
    emotional = data.get("emotional_state")
    notes = data.get("notes", "")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM DevelopmentChecklists WHERE id = ?", (checklist_id,))
    if cur.fetchone() is None:
        conn.close()
        abort(404, description="Cuestionario no encontrado")

    cur.execute("""
        UPDATE DevelopmentChecklists
        SET student_id = ?, date = ?, motor_skills = ?, language_skills = ?,
            social_skills = ?, emotional_state = ?, notes = ?
        WHERE id = ?
    """, (student_id, date, motor, language, social, emotional, notes, checklist_id))
    conn.commit()
    conn.close()

    return jsonify({
        "id": checklist_id,
        "student_id": student_id,
        "date": date,
        "motor_skills": motor,
        "language_skills": language,
        "social_skills": social,
        "emotional_state": emotional,
        "notes": notes
    })
