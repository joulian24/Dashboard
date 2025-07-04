//  VARIABLES GLOBALES PARA GRÁFICAS
let attendanceChartInstance;
let skillsChartInstance;

//FUNCIONES DE DIBUJO CON CHART.JS
async function drawAttendanceChart() {
  if (attendanceChartInstance) {
    attendanceChartInstance.destroy();
  }

  const res = await fetch('http://127.0.0.1:5000/attendance');
  const records = await res.json();

  const presentCount = records.filter(r => r.status === 'Presente').length;
  const absentCount  = records.filter(r => r.status === 'Ausente').length;

  const ctx = document.getElementById('attendanceChart').getContext('2d');
  attendanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Presente', 'Ausente'],
      datasets: [{ label: 'Cantidad', data: [presentCount, absentCount] }]
    }
  });
}

async function drawSkillsChart() {
  if (skillsChartInstance) {
    skillsChartInstance.destroy();
  }

  const res = await fetch('http://127.0.0.1:5000/development_checklists');
  const list = await res.json();
  if (list.length === 0) return;

  const sums = list.reduce((acc, c) => {
    acc.motor   += c.motor_skills;
    acc.lang    += c.language_skills;
    acc.social  += c.social_skills;
    acc.emotion += c.emotional_state;
    return acc;
  }, { motor: 0, lang: 0, social: 0, emotion: 0 });

  const count = list.length;
  const averages = [
    sums.motor   / count,
    sums.lang    / count,
    sums.social  / count,
    sums.emotion / count
  ];

  const ctx = document.getElementById('skillsChart').getContext('2d');
  skillsChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Motor', 'Lenguaje', 'Social', 'Emocional'],
      datasets: [{ label: 'Promedio de habilidades', data: averages }]
    }
  });
}

//  FUNCIONES DE CARGA (READ) PARA TABLAS
//  READ: Cargar y mostrar tablas
async function loadStudents() {
  try {
    const res = await fetch('http://127.0.0.1:5000/students');
    const students = await res.json();
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';  
    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.age}</td>
        <td>${s.group}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editStudent(${s.id})">Editar</button>
          <button class="btn btn-sm btn-danger"       onclick="deleteStudent(${s.id})">Borrar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando estudiantes:', err);
  }
}

async function loadAttendance() {
  try {
    const res = await fetch('http://127.0.0.1:5000/attendance');
    const records = await res.json();
    const tbody = document.querySelector('#attendanceTable tbody');
    tbody.innerHTML = '';
    records.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.student_id}</td>
        <td>${r.date}</td>
        <td>${r.status}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editAttendance(${r.id})">Editar</button>
          <button class="btn btn-sm btn-danger"       onclick="deleteAttendance(${r.id})">Borrar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando asistencias:', err);
  }
}

async function loadChecklists() {
  try {
    const res = await fetch('http://127.0.0.1:5000/development_checklists');
    const list = await res.json();
    const tbody = document.querySelector('#checklistsTable tbody');
    tbody.innerHTML = '';
    list.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.student_id}</td>
        <td>${c.date}</td>
        <td>${c.motor_skills}</td>
        <td>${c.language_skills}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editChecklist(${c.id})">Editar</button>
          <button class="btn btn-sm btn-danger"       onclick="deleteChecklist(${c.id})">Borrar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando cuestionarios:', err);
  }
}

// CREATE
async function createStudent(event) {
  event.preventDefault();  // evita recarga de página

  const name    = document.getElementById('nameInput').value;
  const age     = parseInt(document.getElementById('ageInput').value);
  const group   = document.getElementById('groupInput').value;
  const allergies = document.getElementById('allergiesInput').value;
  const emergency = document.getElementById('emergencyInput').value;

  try {
    const res = await fetch('http://127.0.0.1:5000/students', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, age, group, allergies, emergency_contact: emergency })
    });
    if (!res.ok) throw new Error('Error al crear estudiante');
    document.getElementById('studentForm').reset();
    loadStudents();
  } catch (err) {
    console.error(err);
    alert('No se pudo crear el estudiante');
  }
}


//  Crear un registro de asistencia
async function createAttendance(event) {
  event.preventDefault();
  const student_id = parseInt(document.getElementById('attStudentInput').value);
  const date       = document.getElementById('attDateInput').value;
  const status     = document.getElementById('attStatusInput').value;

  try {
    const res = await fetch('http://127.0.0.1:5000/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, date, status })
    });
    if (!res.ok) throw new Error('Error al crear asistencia');
    document.getElementById('attendanceForm').reset();
    loadAttendance();
  } catch (err) {
    console.error(err);
    alert('No se pudo marcar la asistencia');
  }
}

//  Crear un cuestionario de desarrollo
async function createChecklist(event) {
  event.preventDefault();
  const student_id     = parseInt(document.getElementById('chkStudentInput').value);
  const date           = document.getElementById('chkDateInput').value;
  const motor_skills   = parseInt(document.getElementById('chkMotorInput').value);
  const language_skills= parseInt(document.getElementById('chkLangInput').value);
  const social_skills  = parseInt(document.getElementById('chkSocialInput').value);
  const emotional_state= parseInt(document.getElementById('chkEmoInput').value);
  const notes          = document.getElementById('chkNotesInput').value;

  try {
    const res = await fetch('http://127.0.0.1:5000/development_checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, date, motor_skills, language_skills, social_skills, emotional_state, notes })
    });
    if (!res.ok) throw new Error('Error al crear cuestionario');
    document.getElementById('checklistForm').reset();
    loadChecklists();
  } catch (err) {
    console.error(err);
    alert('No se pudo crear el cuestionario');
  }
}

//  UPDATE

async function editStudent(id) {
  const name  = prompt('Nuevo nombre:');
  if (!name) return;
  const age   = parseInt(prompt('Nueva edad:'), 10);
  if (isNaN(age)) return;
  const group = prompt('Nuevo grupo:');
  if (!group) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/students/${id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name, age, group, allergies:'', emergency_contact:'' })
    });
    if (!res.ok) throw new Error();
    loadStudents();
  } catch {
    alert('Error al actualizar estudiante');
  }
}

async function editAttendance(id) {
  const status = prompt('Nuevo estado (Presente/Ausente):');
  if (!status) return;
  const date = prompt('Nueva fecha (YYYY-MM-DD):');
  if (!date) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/attendance/${id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ student_id: null, date, status })
    });
    if (!res.ok) throw new Error();
    loadAttendance();
  } catch {
    alert('Error al actualizar asistencia');
  }
}

async function editChecklist(id) {
  const date  = prompt('Nueva fecha (YYYY-MM-DD):');
  if (!date) return;
  const motor = parseInt(prompt('Motor (1-5):'), 10);
  const lang  = parseInt(prompt('Lenguaje (1-5):'), 10);
  const social= parseInt(prompt('Social (1-5):'), 10);
  const emo   = parseInt(prompt('Emocional (1-5):'), 10);
  const notes = prompt('Notas:');

  try {
    const res = await fetch(`http://127.0.0.1:5000/development_checklists/${id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        student_id: null,
        date,
        motor_skills: motor,
        language_skills: lang,
        social_skills: social,
        emotional_state: emo,
        notes
      })
    });
    if (!res.ok) throw new Error();
    loadChecklists();
  } catch {
    alert('Error al actualizar cuestionario');
  }
}

// DELETE

async function deleteStudent(id) {
  if (!confirm(`¿Eliminar estudiante ${id}?`)) return;
  try {
    const res = await fetch(`http://127.0.0.1:5000/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    loadStudents();
  } catch {
    alert('Error al borrar estudiante');
  }
}

async function deleteAttendance(id) {
  if (!confirm(`¿Eliminar asistencia ${id}?`)) return;
  try {
    const res = await fetch(`http://127.0.0.1:5000/attendance/${id}`, { method:'DELETE' });
    if (!res.ok) throw new Error();
    loadAttendance();
  } catch {
    alert('Error al borrar asistencia');
  }
}

async function deleteChecklist(id) {
  if (!confirm(`¿Eliminar cuestionario ${id}?`)) return;
  try {
    const res = await fetch(`http://127.0.0.1:5000/development_checklists/${id}`, { method:'DELETE' });
    if (!res.ok) throw new Error();
    loadChecklists();
  } catch {
    alert('Error al borrar cuestionario');
  }
}

//  INICIALIZACIÓN AL CARGAR EL DOM
document.addEventListener('DOMContentLoaded', () => {
  
  // Leer y mostrar datos
  loadStudents();
  loadAttendance();
  loadChecklists();

  // Formularios
  document.getElementById('studentForm').addEventListener('submit', createStudent);
  document.getElementById('attendanceForm').addEventListener('submit', createAttendance);
  document.getElementById('checklistForm').addEventListener('submit', createChecklist);

  // Dibujar gráficas
  drawAttendanceChart();
  drawSkillsChart();
});
