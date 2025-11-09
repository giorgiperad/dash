// API endpoint for ASI:One AI Agent integration
// Usage: POST /api/ai-agent
// Documentation: https://docs.asi1.ai/

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
    const apiKey = process.env.ASI1_API_KEY || 'sk_72cb599f79994f82a3d4599f689d1285b49372c5998b42c58f0e512edf19a5fc';
    const { message, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required and must be a string' 
      });
    }

    // ASI:One API endpoint (OpenAI-compatible)
    // Using asi1-agentic model for agent interactions
    const apiUrl = 'https://api.asi1.ai/v1/chat/completions';
    
    // Build system prompt with crypto context
    let systemPrompt = `You are an expert cryptocurrency market analyst and advisor. You help users understand crypto markets, analyze trends, and make informed decisions.

Your capabilities include:
- Analyzing cryptocurrency market trends and price movements
- Explaining complex crypto concepts in simple terms
- Providing portfolio advice and diversification strategies
- Interpreting market data and technical indicators
- Answering questions about specific cryptocurrencies
- Providing market sentiment analysis

Always be helpful, accurate, and provide actionable insights. If you don't know something, say so.`;

    // Add context if provided (market data, portfolio info, etc.)
    if (context) {
      if (context.marketData) {
        systemPrompt += `\n\nCurrent Market Context:\n${JSON.stringify(context.marketData, null, 2)}`;
      }
      if (context.portfolio) {
        systemPrompt += `\n\nUser Portfolio:\n${JSON.stringify(context.portfolio, null, 2)}`;
      }
    }

    const requestBody = {
      model: 'asi1-agentic', // Best model for agent interactions
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ASI:One API error:', response.status, errorText);
      
      return res.status(response.status).json({
        success: false,
        error: 'Failed to get AI response',
        message: errorText,
        status: response.status
      });
    }

    const data = await response.json();
    
    // Extract the AI response
    const aiMessage = data.choices?.[0]?.message?.content || 'No response from AI';
    
    return res.status(200).json({
      success: true,
      message: aiMessage,
      model: data.model || 'asi1-agentic',
      usage: data.usage || null
    });

  } catch (error) {
    console.error('AI Agent API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

