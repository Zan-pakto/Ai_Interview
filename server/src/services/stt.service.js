const { DeepgramClient } = require('@deepgram/sdk');

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

/**
 * Transcribes audio buffer using Deepgram Nova-2 model.
 */
async function transcribeAudio(audioBuffer) {
  try {
    const result = await deepgram.listen.v1.media.transcribeFile(
      audioBuffer,
      { 
        smart_format: true, 
        model: 'nova-2'
      }
    );
    
    return result.results?.channels[0]?.alternatives[0]?.transcript || "";
  } catch (error) {
    console.error('STT Error:', error);
    return "";
  }
}

module.exports = { transcribeAudio };
