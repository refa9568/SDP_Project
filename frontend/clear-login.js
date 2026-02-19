// Clear login data script
console.log('Clearing existing login data...');
localStorage.removeItem('token');
localStorage.removeItem('user');
console.log('Login data cleared. You can now test fresh login.');

// Also clear any localStorage data that dashboards might use
localStorage.removeItem('Adjutant_notices');
localStorage.removeItem('CO_notices');
localStorage.removeItem('soldier_notices');
console.log('Dashboard data also cleared.');