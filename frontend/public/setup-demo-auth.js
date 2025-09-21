
// Demo authentication setup
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NmE4YjVmOGY0ZTIzNDU2NzEyMzQ1NiIsImVtYWlsIjoiZGVtb0B3b3Jrb3V0dHJhY2tlci5jb20iLCJpYXQiOjE3MzQ5NjAwMDAsImV4cCI6MTc0MjczNjAwMH0.demo_signature_for_testing');
localStorage.setItem('user', '{"id":"676a8b5f8f4e23456712345","name":"Demo User","email":"demo@workouttracker.com","profileImage":null,"bio":"Welcome to Workout Tracker!"}');
console.log('✅ Demo authentication configured');
console.log('User:', JSON.parse(localStorage.getItem('user')));
