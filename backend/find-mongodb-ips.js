import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

console.log('🔍 Finding MongoDB server IP addresses...\n');

async function findMongoDBIPs() {
  const hosts = [
    'cluster0-shard-00-00.ipujo7u.mongodb.net',
    'cluster0-shard-00-01.ipujo7u.mongodb.net',
    'cluster0-shard-00-02.ipujo7u.mongodb.net'
  ];

  console.log('Attempting to resolve MongoDB hosts...\n');

  for (const host of hosts) {
    try {
      console.log(`Testing: ${host}`);
      const { stdout } = await execPromise(`nslookup ${host} 8.8.8.8`);
      console.log(stdout);
    } catch (error) {
      console.log(`❌ Failed to resolve ${host}`);
    }
  }

  console.log('\n💡 If all failed, your network is blocking MongoDB DNS completely.');
  console.log('✅ SOLUTION: Deploy your backend to Render/Heroku - it will work there!');
}

findMongoDBIPs();
