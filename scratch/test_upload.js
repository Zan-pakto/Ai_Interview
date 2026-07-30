const fs = require('fs');
const path = require('path');

async function runTest() {
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  console.log('1. Signing up a test user...');
  try {
    const signupRes = await fetch('http://localhost:5001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!signupRes.ok) {
      const errorText = await signupRes.text();
      console.error('Signup failed:', errorText);
      return;
    }

    const { token, user } = await signupRes.json();
    console.log(`Signup success! User ID: ${user.id}`);

    console.log('2. Reading test_resume.pdf...');
    const pdfPath = path.join(__dirname, '..', 'test_resume.pdf');
    if (!fs.existsSync(pdfPath)) {
      console.error(`PDF not found at ${pdfPath}`);
      return;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log(`PDF read successfully, size: ${pdfBuffer.length} bytes`);

    console.log('3. Uploading resume...');
    const formData = new FormData();
    // Create a Blob from the buffer so FormData parses it correctly
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('resume', blob, 'test_resume.pdf');

    const uploadRes = await fetch('http://localhost:5001/api/resume/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!uploadRes.ok) {
      const errorJson = await uploadRes.json();
      console.error('Upload failed:', errorJson);
      return;
    }

    const uploadResult = await uploadRes.json();
    console.log('Upload success response:', uploadResult);

  } catch (error) {
    console.error('Test run failed with error:', error);
  }
}

runTest();
