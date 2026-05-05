import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

console.log('🔍 Resolving MongoDB SRV record...\n');

async function getSrvRecords() {
  try {
    // Try to resolve SRV record
    const srvRecords = await resolveSrv('_mongodb._tcp.cluster0.ipujo7u.mongodb.net');
    
    console.log('✅ SRV Records found:');
    srvRecords.forEach((record, i) => {
      console.log(`   ${i + 1}. ${record.name}:${record.port}`);
    });
    
    // Build direct connection string
    const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    const directUri = `mongodb://aravvvvc1:aravvvvc1@${hosts}/gym-tracker?ssl=true&authSource=admin&replicaSet=atlas-xxxxx-shard-0&retryWrites=true&w=majority`;
    
    console.log('\n📋 Direct Connection String:');
    console.log(directUri);
    console.log('\n✅ Copy this and replace MONGO_URI in your .env file');
    
  } catch (error) {
    console.error('❌ Cannot resolve SRV record:', error.message);
    console.error('\n🚨 Your DNS cannot reach MongoDB servers at all!');
    console.error('\n✅ SOLUTIONS:');
    console.error('   1. Use mobile hotspot (100% will work)');
    console.error('   2. Contact your ISP to unblock MongoDB');
    console.error('   3. Use a VPN service');
    console.error('   4. Deploy your backend to cloud (Render/Heroku)');
    console.error('\n💡 For now, use mobile hotspot to develop locally!');
  }
}

getSrvRecords();
