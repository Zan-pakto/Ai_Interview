const { DeepgramClient } = require('@deepgram/sdk');

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

/**
 * Transcribes audio buffer using Deepgram Nova-2 model.
 */
async function transcribeAudio(audioBuffer) {
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      { 
        smart_format: true, 
        model: 'nova-2',
        mimetype: 'audio/webm'
      }
    );
    
    if (error) throw error;
    
    return result.results?.channels[0]?.alternatives[0]?.transcript || "";
  } catch (error) {
    console.error('STT Error:', error);
    return "";
  }
}

module.exports = { transcribeAudio };
