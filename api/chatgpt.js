// API endpoint for OpenAI ChatGPT integration
// Usage: POST /api/chatgpt
// Requires OPENAI_API_KEY environment variable

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      });
    }

    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and must be a string' 
      });
    }

    // OpenAI API endpoint
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // Build user message with context
    let userMessage = message;
    
    // Add context if provided (market data, portfolio info, etc.)
    if (context) {
      let contextText = '';
      if (context.marketData) {
        contextText += `\n\nCurrent Market Context:\n${JSON.stringify(context.marketData, null, 2)}`;
      }
      if (context.portfolio) {
        contextText += `\n\nUser Portfolio:\n${JSON.stringify(context.portfolio, null, 2)}`;
      }
      if (contextText) {
        userMessage = `${message}\n\n${contextText}`;
      }
    }

    // System prompt for crypto market analysis
    const systemPrompt = `You are a helpful AI assistant specializing in cryptocurrency market analysis and trading advice. 
You provide clear, accurate, and helpful information about:
- Cryptocurrency market trends and analysis
- Portfolio management and diversification
- Price movements and technical analysis
- Market sentiment and news
- Risk management strategies

Always respond in Georgian language (ქართული ენა) unless the user explicitly asks in another language.
Be concise, professional, and provide actionable insights when possible.`;

    const requestBody = {
      model: 'gpt-4o-mini', // Using GPT-4o-mini for cost-effectiveness, can be changed to gpt-4o or gpt-3.5-turbo
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    console.log('Sending request to OpenAI API...');
    console.log('Model:', requestBody.model);
    console.log('Message length:', userMessage.length);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'CryptoCollectiveX/1.0'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000) // 60 seconds timeout
    });

    console.log('OpenAI API response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = `Failed to read error response: ${e.message}`;
      }
      
      console.error('OpenAI API error:', response.status, errorText);
      
      // Try to parse error if it's JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: { message: errorText } };
      }
      
      // Provide more helpful error message
      let errorMessage = 'Failed to get AI response';
      if (response.status === 401) {
        errorMessage = 'API key is invalid or expired. Please check your OpenAI API key.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (response.status === 500) {
        errorMessage = 'OpenAI API server error. The service may be temporarily unavailable.';
      } else if (response.status === 503) {
        errorMessage = 'OpenAI API is temporarily overloaded. Please try again in a moment.';
      }
      
      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        message: errorData.error?.message || errorText || 'Unknown error',
        status: response.status
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'No response from AI';

    console.log('OpenAI API success. Response length:', aiMessage.length);

    return res.status(200).json({
      success: true,
      message: aiMessage,
      model: data.model || 'gpt-4o-mini',
      usage: data.usage || null
    });

  } catch (error) {
    console.error('ChatGPT API error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - API took too long to respond (60s limit)';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to OpenAI API - check network connection';
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: errorMessage,
      details: error.stack?.substring(0, 500) || 'No additional details available'
    });
  }
};

