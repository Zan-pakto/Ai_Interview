require('dotenv').config();
// .
async function testFetch() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      console.log("Available models:");
      data.models.forEach(m => console.log("- " + m.name));
    } else {
      console.error("Error fetching models:", data);
    }
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}

testFetch();
