import { getAllAdapters } from '../src/lib/adapters/registry';

async function run() {
  const adapters = getAllAdapters();
  console.log('Registered adapters:', adapters.map((a) => a.providerId).join(', '));

  for (const a of adapters) {
    try {
      const jobs = await a.fetchJobs({
        keywords: ['Full Stack Developer'],
        targetCountry: 'India',
      });
      console.log(`[${a.providerId}] Fetched: ${jobs.length} jobs.`);
      if (jobs.length > 0) {
        console.log(`   Sample: "${jobs[0].title}" at ${jobs[0].company} (${jobs[0].location})`);
      }
    } catch (e: any) {
      console.error(`[${a.providerId}] Error:`, e.message);
    }
  }
}

run().catch(console.error);

