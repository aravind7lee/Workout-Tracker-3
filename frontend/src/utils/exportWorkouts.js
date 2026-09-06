import jsPDF from 'jspdf';
import api from './api';

const download = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
};
const safe = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export async function exportAllWorkoutsCSV() {
  const { data } = await api.get('/workouts', { params: { limit: 200 } });
  const rows = [['Date', 'Title', 'Muscle Group', 'Duration (min)', 'Volume (kg)', 'Exercises']];
  (data.workouts || []).forEach((workout) => rows.push([workout.date, workout.title, workout.muscle || workout.category, workout.durationMinutes, workout.totalVolume, (workout.exercises || []).map((item) => item.exerciseName).join('; ')]));
  download(new Blob([rows.map((row) => row.map(safe).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }), `grindx-workouts-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportSingleWorkoutPDF(workout) {
  const pdf = new jsPDF();
  pdf.setFillColor(12, 12, 12); pdf.rect(0, 0, 210, 297, 'F'); pdf.setTextColor(239, 68, 68); pdf.setFontSize(24); pdf.text('GRIND-X WORKOUT', 16, 22);
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(18); pdf.text(workout.title || 'Workout', 16, 36);
  pdf.setTextColor(170, 170, 170); pdf.setFontSize(10); pdf.text(new Date(workout.completedAt || workout.date).toLocaleString(), 16, 44);
  pdf.text(`Duration: ${Math.round((workout.duration || workout.durationMinutes * 60 || 0) / 60)} min   Volume: ${workout.totalVolume || 0} kg`, 16, 53);
  let y = 68; (workout.exercises || []).forEach((exercise, index) => { if (y > 270) { pdf.addPage(); y = 20; } pdf.setTextColor(249, 115, 22); pdf.text(`${index + 1}. ${exercise.exerciseName || exercise.name}`, 16, y); y += 7; pdf.setTextColor(210, 210, 210); pdf.text((exercise.sets || []).map((set) => `${set.weight || 0}kg x ${set.reps || 0}`).join('  |  '), 20, y); y += 11; });
  pdf.save(`grindx-${(workout.title || 'workout').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
}

export function exportProgressReportPDF(report) {
  const pdf = new jsPDF(); pdf.setFontSize(24); pdf.setTextColor(220, 38, 38); pdf.text('GRIND-X PROGRESS REPORT', 16, 22); pdf.setTextColor(20, 20, 20); pdf.setFontSize(12); pdf.text(report.period || '', 16, 32);
  const fields = [['Workouts', report.workoutsCompleted], ['Volume', `${report.totalVolume || 0} kg`], ['Duration', `${report.totalDuration || 0} min`], ['Calories burned', report.caloriesBurned], ['Meals logged', report.mealsLogged], ['Average protein', `${report.avgDailyProtein || 0} g/day`], ['Weight change', `${report.weightChange || 0} kg`], ['Current streak', `${report.streakDays || 0} days`]];
  fields.forEach(([label, value], index) => pdf.text(`${label}: ${value}`, 16, 48 + index * 10)); pdf.save(`grindx-progress-${new Date().toISOString().slice(0, 10)}.pdf`);
}
