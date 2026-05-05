import https from 'https';
import dns from 'dns';

console.log('🔍 Testing Network Connectivity...\n');

// Test 1: Basic DNS lookup
console.log('Test 1: DNS Lookup for google.com');
dns.lookup('google.com', (err, address) => {
  if (err) {
    console.log('❌ DNS lookup failed:', err.message);
  } else {
    console.log('✅ DNS works! IP:', address);
  }
});

// Test 2: HTTPS request
console.log('\nTest 2: HTTPS request to google.com');
https.get('https://www.google.com', (res) => {
  console.log('✅ HTTPS works! Status:', res.statusCode);
}).on('error', (err) => {
  console.log('❌ HTTPS failed:', err.message);
});

// Test 3: MongoDB DNS lookup
console.log('\nTest 3: DNS lookup for MongoDB Atlas');
dns.lookup('cluster0.ipujo7u.mongodb.net', (err, address) => {
  if (err) {
    console.log('❌ MongoDB DNS lookup failed:', err.message);
    console.log('🚨 THIS IS THE PROBLEM! Your DNS cannot find MongoDB servers!');
  } else {
    console.log('✅ MongoDB DNS works! IP:', address);
  }
});

// Test 4: SRV record lookup
console.log('\nTest 4: SRV record lookup for MongoDB');
dns.resolveSrv('_mongodb._tcp.cluster0.ipujo7u.mongodb.net', (err, addresses) => {
  if (err) {
    console.log('❌ SRV lookup failed:', err.message);
    console.log('🚨 Your DNS cannot resolve MongoDB SRV records!');
    console.log('\n💡 SOLUTION: Use direct connection string (without +srv)');
  } else {
    console.log('✅ SRV lookup works!');
    addresses.forEach((addr, i) => {
      console.log(`   ${i + 1}. ${addr.name}:${addr.port}`);
    });
  }
});

setTimeout(() => {
  console.log('\n📊 Test completed!');
}, 5000);
