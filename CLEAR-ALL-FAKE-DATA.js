// EMERGENCY CLEAR ALL FAKE DATA
// Copy and paste this in browser console

// Clear all localStorage
localStorage.clear();

// Clear all sessionStorage  
sessionStorage.clear();

// Clear all cookies
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Clear all caches
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => {
            caches.delete(name);
        });
    });
}

// Reload page
location.reload(true);

console.log("ALL FAKE DATA CLEARED!");