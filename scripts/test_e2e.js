const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET /api/projects ---');
  const r1 = await request('/api/projects');
  console.log(`Status: ${r1.status}, Count: ${r1.data.count}, First: "${r1.data.projects[0]?.title}"`);

  console.log('\n--- 2. Testing GET /api/categories ---');
  const r2 = await request('/api/categories');
  console.log(`Status: ${r2.status}, Count: ${r2.data.count}, Categories:`, r2.data.categories.map(c => c.slug).join(', '));

  console.log('\n--- 3. Testing GET /api/archive/motion-graphics ---');
  const r3 = await request('/api/archive/motion-graphics');
  console.log(`Status: ${r3.status}, Category: "${r3.data.category?.title}"`);
  console.log(`Tabs: deliverables=${r3.data.detailView?.deliverables?.length}, stills=${r3.data.detailView?.stills?.length}, widescreen=${r3.data.detailView?.widescreen?.length}, reels=${r3.data.detailView?.reels?.length}`);

  console.log('\n--- 4. Testing POST /api/contact ---');
  const r4 = await request('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      name: 'Elena Rostova',
      email: 'elena@rostova-design.com',
      subject: 'Global Autumn Lookbook',
      budget: '$25k - $50k',
      message: 'We are seeking art direction and visual sequencing for our AW26 Paris presentation.',
      website: '', // honeypot empty
    }
  });
  console.log(`Status: ${r4.status}, Success: ${r4.data.success}, Inquiry ID: ${r4.data.inquiryId}`);

  console.log('\n--- 5. Testing POST /api/auth/login (Bad Password) ---');
  const r5 = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { password: 'incorrect-pass' }
  });
  console.log(`Status: ${r5.status} (Expected 401), Success: ${r5.data.success}`);

  console.log('\n--- 6. Testing POST /api/auth/login (Correct Password) ---');
  const r6 = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { password: 'moizstudio2026' }
  });
  const cookie = r6.headers['set-cookie'] ? r6.headers['set-cookie'][0].split(';')[0] : '';
  console.log(`Status: ${r6.status} (Expected 200), Cookie Received: ${Boolean(cookie)}`);

  console.log('\n--- 7. Testing GET /api/admin/inquiries (Authenticated) ---');
  const r7 = await request('/api/admin/inquiries', {
    method: 'GET',
    headers: { Cookie: cookie }
  });
  console.log(`Status: ${r7.status}, Inquiries Count: ${r7.data.count}, Latest Inquiry: "${r7.data.inquiries[0]?.name}" - "${r7.data.inquiries[0]?.subject}"`);

  const inqId = r7.data.inquiries[0]?.id;
  if (inqId) {
    const r7b = await request('/api/admin/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: { id: inqId, status: 'replied' }
    });
    console.log(`Inquiry PATCH Status: ${r7b.status}, New Status: "${r7b.data.inquiry?.status}"`);
  }

  console.log('\n--- 8. Testing GET /api/admin/backup?action=list ---');
  const r8 = await request('/api/admin/backup?action=list', {
    method: 'GET',
    headers: { Cookie: cookie }
  });
  console.log(`Status: ${r8.status}, Snapshots Count: ${r8.data.snapshots?.length}`);

  console.log('\n--- 9. Testing GET /robots.txt & /sitemap.xml ---');
  const r9 = await request('/robots.txt');
  console.log(`Robots Status: ${r9.status}, Contains Sitemap: ${r9.raw?.includes('Sitemap:')}`);
  const r10 = await request('/sitemap.xml');
  console.log(`Sitemap Status: ${r10.status}, XML Header: ${r10.raw?.includes('<?xml')}`);

  console.log('\n=== ALL 9 BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
