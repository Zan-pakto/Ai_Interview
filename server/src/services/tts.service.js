const { DeepgramClient } = require('@deepgram/sdk');

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

/**
 * Converts text to speech using Deepgram Aura TTS.
 * Returns a buffer of the audio.
 */
async function textToSpeech(text) {
  try {
    const response = await deepgram.speak.v1.audio.generate(
      { text },
      {
        model: 'aura-asteria-en',
        container: 'mp3',
      }
    );

    // In v5 SDK, the response object contains the data and helper methods
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Deepgram TTS Error:', error);
    return null;
  }
}

module.exports = { textToSpeech };
