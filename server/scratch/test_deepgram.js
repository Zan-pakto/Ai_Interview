const { DeepgramClient } = require('@deepgram/sdk');
try {
    const client = new DeepgramClient('test_key');
    console.log('DeepgramClient created successfully');
    console.log('Methods:', Object.keys(client));
    if (client.listen) console.log('client.listen exists');
} catch (e) {
    console.log('Error creating DeepgramClient:', e.message);
}
