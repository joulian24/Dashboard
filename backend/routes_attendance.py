from flask import Blueprint, request, jsonify, abort
from backend.models import get_connection

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance', methods=['POST'])
def create_attendance():
    data = request.get_json()
    student_id = data['student_id']
    date       = data['date']
    status     = data['status']

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO Attendance (student_id, date, status) VALUES (?, ?, ?)",
        (student_id, date, status)
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()

    return jsonify({"id": new_id, "student_id": student_id, "date": date, "status": status}), 201

@attendance_bp.route('/attendance', methods=['GET'])
def list_attendance():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM Attendance").fetchall()
    conn.close()
    records = [dict(r) for r in rows]
    return jsonify(records)

@attendance_bp.route('/attendance/<int:att_id>', methods=['PUT'])
def update_attendance(att_id):
    data = request.get_json()
    student_id = data['student_id']
    date       = data['date']
    status     = data['status']

    conn = get_connection()
    cur = conn.cursor()
    # Verificar existencia
    cur.execute("SELECT * FROM Attendance WHERE id = ?", (att_id,))
    if cur.fetchone() is None:
        conn.close()
        abort(404, description="Registro no encontrado")

    cur.execute(
        "UPDATE Attendance SET student_id=?, date=?, status=? WHERE id=?",
        (student_id, date, status, att_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"id": att_id, "student_id": student_id, "date": date, "status": status})

@attendance_bp.route('/attendance/<int:att_id>', methods=['DELETE'])
def delete_attendance(att_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Attendance WHERE id = ?", (att_id,))
    if cur.fetchone() is None:
        conn.close()
        abort(404, description="Registro no encontrado")
    cur.execute("DELETE FROM Attendance WHERE id = ?", (att_id,))
    conn.commit()
    conn.close()
    return '', 204

