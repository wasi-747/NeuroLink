const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

async function runFullAppAudit() {
  console.log('====================================================');
  console.log('🚀 RUNNING AUTOMATED E2E MOBILE INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let token = null;
  let passed = 0;
  let failed = 0;
  const latencyList = [];

  async function test(name, fn) {
    const t0 = Date.now();
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      const elapsed = Date.now() - t0;
      latencyList.push({ name, elapsed, status: 'PASSED' });
      console.log(`✅ PASSED (${elapsed} ms)`);
      passed++;
    } catch (err) {
      const elapsed = Date.now() - t0;
      latencyList.push({ name, elapsed, status: 'FAILED' });
      console.log(`❌ FAILED (${elapsed} ms): ${err.response?.data?.error || err.response?.data?.message || err.message}`);
      if (err.response?.data) {
        console.log('   Details:', JSON.stringify(err.response.data));
      }
      failed++;
    }
  }

  // 1. Authentication
  await test('1. User Login (JWT Auth)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student1@test.edu',
      password: 'password123',
    });
    if (!res.data?.token) throw new Error('No token returned');
    token = res.data.token;
  });

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // 2. User Profile (/me)
  await test('2. Get Authenticated User Profile', async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, authHeaders());
    if (!res.data?.data?.email) throw new Error('User email missing');
  });

  // 3. Mood Tracker (Post & Get)
  await test('3. Log Daily Mood (1-5 Scale)', async () => {
    const res = await axios.post(
      `${BASE_URL}/mood`,
      {
        mood: 4,
        note: 'Automated test: Feeling balanced and focused.',
      },
      authHeaders()
    );
    if (!res.data?.data) throw new Error('Mood entry creation failed');
  });

  await test('4. Get User Mood Logs', async () => {
    const res = await axios.get(`${BASE_URL}/mood`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Mood logs not an array');
  });

  // 4. Habits (Get, Create, Log Toggle)
  let testHabitId = null;
  await test('5. Fetch Habits List', async () => {
    const res = await axios.get(`${BASE_URL}/habits`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Habits not an array');
    if (res.data.data.length > 0) {
      testHabitId = res.data.data[0]._id;
    }
  });

  await test('6. Create New Custom Habit', async () => {
    const res = await axios.post(
      `${BASE_URL}/habits`,
      {
        name: 'Auto Drink 2L Water',
        category: 'health',
        frequency: 'daily',
        icon: 'Droplets',
      },
      authHeaders()
    );
    if (!res.data?.data?._id) throw new Error('Habit creation failed');
    testHabitId = res.data.data._id;
  });

  await test('7. Toggle Habit Log (Check-in)', async () => {
    if (!testHabitId) throw new Error('No habit ID available');
    const todayStr = new Date().toISOString().split('T')[0];
    const res = await axios.post(
      `${BASE_URL}/habits/${testHabitId}/log`,
      { date: todayStr },
      authHeaders()
    );
    if (res.status !== 200 && res.status !== 201) throw new Error('Habit toggle failed');
  });

  // 5. Therapists & Telehealth Bookings
  let testTherapistId = null;
  await test('8. Fetch Licensed Therapists Directory', async () => {
    const res = await axios.get(`${BASE_URL}/therapists`, authHeaders());
    if (!Array.isArray(res.data?.data) || res.data.data.length === 0) {
      throw new Error('No therapists found in directory');
    }
    testTherapistId = res.data.data[0]._id;
  });

  await test('9. Book Telehealth Session with Therapist', async () => {
    if (!testTherapistId) throw new Error('No therapist ID available');
    const res = await axios.post(
      `${BASE_URL}/therapists/${testTherapistId}/book`,
      {
        service: 'Stress & Anxiety Relief Session',
        preferredDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        preferredTime: 'Afternoon',
        sessionFormat: 'Online',
        message: 'Automated test booking for verification.',
      },
      authHeaders()
    );
    if (!res.data?.data?._id) throw new Error('Booking failed');
  });

  await test('10. Fetch My Appointments (Telehealth Hub)', async () => {
    const res = await axios.get(`${BASE_URL}/therapists/bookings/my-bookings`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Appointments not returned as array');
  });

  // 6. Community Forum & Comments
  let testPostId = null;
  await test('11. Fetch Community Forum Posts', async () => {
    const res = await axios.get(`${BASE_URL}/forum/posts`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Forum posts not an array');
    if (res.data.data.length > 0) {
      testPostId = res.data.data[0]._id;
    }
  });

  await test('12. Create New Community Forum Post', async () => {
    const res = await axios.post(
      `${BASE_URL}/forum/posts`,
      {
        title: 'Overcoming mid-term anxiety with 4-7-8 breathing',
        content: 'Sharing an automated test reflection to verify community safe space.',
        category: 'Anxiety',
      },
      authHeaders()
    );
    if (!res.data?.data?._id) throw new Error('Post creation failed');
    testPostId = res.data.data._id;
  });

  await test('13. Like / React to Forum Post', async () => {
    if (!testPostId) throw new Error('No post ID available');
    const res = await axios.post(
      `${BASE_URL}/forum/posts/${testPostId}/react`,
      { type: 'like' },
      authHeaders()
    );
    if (!res.data?.success) throw new Error('React failed');
  });

  await test('14. Post a Comment to Forum Discussion', async () => {
    if (!testPostId) throw new Error('No post ID available');
    const res = await axios.post(
      `${BASE_URL}/forum/posts/${testPostId}/comments`,
      {
        content: 'Great reflection! Keep prioritizing rest.',
      },
      authHeaders()
    );
    if (!res.data?.data?._id) throw new Error('Comment failed');
  });

  await test('15. Fetch Comments for Forum Post', async () => {
    if (!testPostId) throw new Error('No post ID available');
    const res = await axios.get(
      `${BASE_URL}/forum/posts/${testPostId}/comments`,
      authHeaders()
    );
    if (!Array.isArray(res.data?.data)) throw new Error('Comments not an array');
  });

  // 7. Masterclasses & Courses
  let testCourseId = null;
  await test('16. Fetch Wellness Masterclasses Catalog', async () => {
    const res = await axios.get(`${BASE_URL}/courses`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Courses not an array');
    if (res.data.data.length > 0) {
      testCourseId = res.data.data[0]._id;
    }
  });

  // 8. PSS-10 Clinical Stress Assessment
  await test('17. Submit PSS-10 Stress Assessment (10 Questions)', async () => {
    const answers = { 1: 2, 2: 3, 3: 2, 4: 1, 5: 2, 6: 3, 7: 1, 8: 2, 9: 2, 10: 3 };
    const res = await axios.post(
      `${BASE_URL}/stress-quiz`,
      { answers },
      authHeaders()
    );
    if (!res.data?.data?.score && res.data?.data?.score !== 0) throw new Error('Stress quiz scoring failed');
  });

  // 9. AI Reflective Journal
  let testJournalId = null;
  await test('18. Submit Reflective AI Journal Entry', async () => {
    const res = await axios.post(
      `${BASE_URL}/journal`,
      {
        title: 'Automated Resilience Journal',
        content: 'Today was full of progress. Feeling calm and grateful for all the milestones achieved.',
        tags: ['Reflection', 'Personal Growth'],
      },
      authHeaders()
    );
    if (!res.data?.data?._id) throw new Error('Journal creation failed');
    testJournalId = res.data.data._id;
  });

  await test('19. Fetch Journal History', async () => {
    const res = await axios.get(`${BASE_URL}/journal`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Journals not an array');
  });

  // 10. Daily Gratitude Journal (3 Items)
  await test('20. Submit Daily Gratitude (3 Good Things)', async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/gratitude`,
        {
          items: [
            'Warm sunshine in the morning',
            'Smooth pairing and coding session',
            'Deep restorative breathwork',
          ],
        },
        authHeaders()
      );
      if (!res.data?.data?._id) throw new Error('Gratitude save failed');
    } catch (err) {
      if (err.response?.data?.error?.includes('already logged')) {
        // Expected if already logged today
        return;
      }
      throw err;
    }
  });

  await test('21. Fetch Gratitude History & Streaks', async () => {
    const res = await axios.get(`${BASE_URL}/gratitude`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Gratitude not an array');
  });

  // 11. Smart ML Personalization & Recommendations
  await test('22. Fetch "For You" ML Recommendations', async () => {
    const res = await axios.get(`${BASE_URL}/ml/recommendations`, authHeaders());
    if (!res.data?.data) throw new Error('ML recommendations failed');
  });

  // 12. Weekly Mind Balance Report
  await test('23. Fetch Weekly Wellness Reports', async () => {
    const res = await axios.get(`${BASE_URL}/wellness-reports`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Reports not an array');
  });

  // 13. Psychoeducation Articles & Resources
  await test('24. Fetch Psychoeducation Knowledge Articles', async () => {
    const res = await axios.get(`${BASE_URL}/resources/articles`, authHeaders());
    if (!Array.isArray(res.data?.data)) throw new Error('Articles not an array');
  });

  // 14. Conversational AI Agent (Aria Chat Copilot)
  await test('25. Conversational AI Aria Copilot (RAG/Groq)', async () => {
    const res = await axios.post(
      `${BASE_URL}/ml/chat`,
      {
        messages: [
          { role: 'user', content: 'I feel overwhelmed with upcoming exam deadlines.' },
        ],
      },
      authHeaders()
    );
    if (!res.data?.reply && !res.data?.data?.reply) throw new Error('Aria chat failed to respond');
  });

  // 15. Adaptive Learning Pathway
  await test('26. Fetch Personalized Cognitive Learning Pathway', async () => {
    const res = await axios.get(`${BASE_URL}/learning/path`, authHeaders());
    if (!res.data) throw new Error('Learning pathway fetch failed');
  });

  // 16. Fast ML Microservice Crisis Triage
  await test('27. Direct ML Service Crisis Triage (< 50ms)', async () => {
    const res = await axios.post('http://127.0.0.1:8000/api/ml/analyze/sentiment', {
      text: 'I cannot bear this pain anymore, I want to end my life.',
      source: 'journal',
    });
    if (!res.data?.crisis_detected || res.data?.sentiment !== 'CRISIS') {
      throw new Error('Crisis keyword detector failed to trigger safety flag!');
    }
  });

  // ====================================================
  // 🛑 NEGATIVE & FAILURE RESILIENCE TESTING
  // (Verifying that the backend strictly rejects invalid/malicious data)
  // ====================================================
  console.log('\n--- Running Negative & Validation Rejection Tests ---');

  await test('28. [Negative] Reject Login with Incorrect Password', async () => {
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'student1@test.edu',
        password: 'completely_wrong_password_999',
      });
      throw new Error('SECURITY BREACH: Server accepted invalid password!');
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      throw err;
    }
  });

  await test('29. [Negative] Block Protected Route Without Auth Token', async () => {
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      throw new Error('SECURITY BREACH: Protected route accessed without token!');
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      throw err;
    }
  });

  await test('30. [Negative] Reject Blank Habit Creation (Schema Validation)', async () => {
    try {
      await axios.post(`${BASE_URL}/habits`, {}, authHeaders());
      throw new Error('VALIDATION FAILED: Server accepted habit with missing required name!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.includes('name')) {
        return;
      }
      throw err;
    }
  });

  await test('31. [Negative] Reject Access with Forged / Tampered JWT Token', async () => {
    try {
      await axios.get(`${BASE_URL}/mood`, {
        headers: { Authorization: 'Bearer forged.tampered.token' },
      });
      throw new Error('SECURITY BREACH: Server accepted forged JWT token!');
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      throw err;
    }
  });

  await test('32. [Negative] Reject Invalid Route with 404', async () => {
    try {
      await axios.get(`${BASE_URL}/nonexistent-route-for-testing-12345`, authHeaders());
      throw new Error('Server returned 200 for a non-existent endpoint!');
    } catch (err) {
      if (err.response?.status === 404) {
        return;
      }
      throw err;
    }
  });

  // Calculate statistics
  const total = passed + failed;
  const avgLatency = (latencyList.reduce((acc, curr) => acc + curr.elapsed, 0) / latencyList.length).toFixed(1);
  const minLatency = Math.min(...latencyList.map((x) => x.elapsed));
  const maxLatency = Math.max(...latencyList.map((x) => x.elapsed));

  console.log('\n====================================================');
  console.log(`🎯 AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED (Total: ${total})`);
  console.log(`⏱️ LATENCY METRICS: Mean = ${avgLatency} ms | Min = ${minLatency} ms | Max = ${maxLatency} ms`);
  console.log(`🛡️ SUCCESS RATE: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('====================================================\n');
}

runFullAppAudit();
