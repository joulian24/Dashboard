// 1. Cargar y mostrar estudiantes
async function loadStudents() {
  try {
    const res = await fetch('http://127.0.0.1:5000/students');
    const students = await res.json();
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';  // limpia la tabla
    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td>${s.age}</td>
        <td>${s.group}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando estudiantes:', err);
  }
}

// 2. Cargar y mostrar asistencias
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
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando asistencias:', err);
  }
}

// 3. Cargar y mostrar cuestionarios de desarrollo
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
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando cuestionarios:', err);
  }
}

// 4. Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  loadAttendance();
  loadChecklists();
});

// 5. Enviar nuevo estudiante al backend
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
    // Limpia el formulario
    document.getElementById('studentForm').reset();
    // Recarga la tabla
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


// 6. Dibujar la gráfica de asistencia
async function drawAttendanceChart() {
  const res = await fetch('http://127.0.0.1:5000/attendance');
  const records = await res.json();

  // Contar presentes y ausentes
  const presentCount = records.filter(r => r.status === 'Presente').length;
  const absentCount  = records.filter(r => r.status === 'Ausente').length;

  const ctx = document.getElementById('attendanceChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Presente', 'Ausente'],
      datasets: [{
        label: 'Cantidad',
        data: [presentCount, absentCount]
      }]
    }
  });
}

// 7. Dibujar la gráfica de habilidades promedio
async function drawSkillsChart() {
  const res = await fetch('http://127.0.0.1:5000/development_checklists');
  const list = await res.json();
  if (list.length === 0) return;

  // Calcular promedios
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
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Motor', 'Lenguaje', 'Social', 'Emocional'],
      datasets: [{
        label: 'Promedio de habilidades',
        data: averages
      }]
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
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
