const { Deepgram } = require('@deepgram/sdk');

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

/**
 * Transcribes audio buffer using Deepgram Nova-2 model.
 */
async function transcribeAudio(audioBuffer) {
  try {
    const response = await deepgram.transcription.preRecorded(
      { buffer: audioBuffer, mimetype: 'audio/webm' },
      { smart_format: true, model: 'nova-2' }
    );
    
    return response.results?.channels[0]?.alternatives[0]?.transcript || "";
  } catch (error) {
    console.error('STT Error:', error);
    return "";
  }
}

module.exports = { transcribeAudio };
