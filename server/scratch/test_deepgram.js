const { DeepgramClient } = require('@deepgram/sdk');
const client = new DeepgramClient('test_key');
if (client.speak.v1.audio) {
    console.log('client.speak.v1.audio methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client.speak.v1.audio)));
}
