from flask import Flask, jsonify, request, abort
from backend.models import create_tables, get_connection
from backend.routes_attendance import attendance_bp

app = Flask(__name__)
create_tables()

@app.route('/')
def home():
    return "¡KinderTrack está corriendo!"

@app.route('/students', methods=['GET'])
def list_students():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Students")
    rows = cur.fetchall()
    conn.close()
    students = [dict(row) for row in rows]
    return jsonify(students)  

@app.route('/students', methods=['POST'])
def create_student():
    data = request.get_json()
    # Esperamos un JSON con { "name": "...", "age": 3, "group": "...", "allergies": "...", "emergency_contact": "..." }
    name = data.get('name')
    age = data.get('age')
    group = data.get('group')
    allergies = data.get('allergies', '')
    emergency = data.get('emergency_contact', '')

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO Students (name, age, "group", allergies, emergency_contact)
        VALUES (?, ?, ?, ?, ?)
    """, (name, age, group, allergies, emergency))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()

    # Devolvemos el registro recién creado
    return jsonify({
        "id": new_id,
        "name": name,
        "age": age,
        "group": group,
        "allergies": allergies,
        "emergency_contact": emergency
    }), 201

@app.route('/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    group = data.get('group')
    allergies = data.get('allergies', '')
    emergency = data.get('emergency_contact', '')

    conn = get_connection()
    cur = conn.cursor()

    # Verificar que el estudiante exista
    cur.execute("SELECT * FROM Students WHERE id = ?", (student_id,))
    if cur.fetchone() is None:
        conn.close()
        abort(404, description="Estudiante no encontrado")

    # Actualizar los campos
    cur.execute("""
        UPDATE Students
        SET name = ?, age = ?, "group" = ?, allergies = ?, emergency_contact = ?
        WHERE id = ?
    """, (name, age, group, allergies, emergency, student_id))
    conn.commit()
    conn.close()

    # Devolver el recurso actualizado
    return jsonify({
        "id": student_id,
        "name": name,
        "age": age,
        "group": group,
        "allergies": allergies,
        "emergency_contact": emergency
    })

@app.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = get_connection()
    cur = conn.cursor()

    # Verificar que el estudiante exista
    cur.execute("SELECT * FROM Students WHERE id = ?", (student_id,))
    if cur.fetchone() is None:
        conn.close()
        abort(404, description="Estudiante no encontrado")

    # Borrar el estudiante
    cur.execute("DELETE FROM Students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()

    # Respuesta sin contenido (204 No Content)
    return '', 204

# registra las rutas de attendance
app.register_blueprint(attendance_bp)

if __name__ == '__main__':
    app.run(debug=True)
