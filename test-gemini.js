const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI('DUMMY_KEY');
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: "You are a helpful assistant."
    });

    const chat = model.startChat({
      history: []
    });

    console.log("SDK validation passed! Attempting to send message...");
    const result = await chat.sendMessage("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("Caught error:", e.message);
  }
}

test();
