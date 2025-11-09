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
    // Base URL: https://api.asi1.ai/v1
    const apiUrl = 'https://api.asi1.ai/v1/chat/completions';
    
    // For custom agents, system prompt may be defined in the agent itself
    // But we can still provide context to enhance responses
    let systemPrompt = '';
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
        // Append context to user message for custom agents
        userMessage = `${message}\n\n${contextText}`;
      }
    }

    // Use custom agent: https://asi1.ai/ai/ccx
    // Custom agents can be referenced by their ID
    const customAgentId = 'ccx'; // Your custom agent ID from asi1.ai/ai/ccx
    const models = [
      customAgentId, // Try custom agent first
      'ai/ccx', // Alternative format
      'asi1-fast-agentic', // Fallback to generic models
      'asi1-agentic',
      'asi1-extended-agentic'
    ];
    let lastError;
    let data;
    
    // Session management for agentic models
    // Generate or retrieve session ID (in production, store in Redis/DB)
    const sessionId = req.headers['x-session-id'] || 
                      req.body.sessionId || 
                      `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    for (const model of models) {
      try {
        // Build request body - custom agents may not need system prompt
        const requestBody = {
          model: model,
          messages: systemPrompt ? [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ] : [
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 2000 // Increased for custom agents
        };

        console.log(`Trying model: ${model}`);
        console.log('Sending request to ASI:One API:', apiUrl);
        console.log('Using API key:', apiKey.substring(0, 10) + '...');
        console.log('Session ID:', sessionId);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'x-session-id': sessionId, // Required for agentic models
            'Content-Type': 'application/json',
            'User-Agent': 'CryptoCollectiveX/1.0'
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(90000) // 90 seconds timeout for agentic models (longer tasks)
        });

        console.log('ASI:One API response status:', response.status, response.statusText);

        if (response.ok) {
          data = await response.json();
          console.log(`Success with model: ${model}`);
          break; // Success, exit loop
        } else {
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = `Failed to read error response: ${e.message}`;
          }
          
          console.warn(`Model ${model} failed:`, response.status, errorText);
          lastError = { status: response.status, message: errorText, model: model };
          
          // If it's a 401 (unauthorized) or 404 (not found), don't try other models
          if (response.status === 401 || response.status === 404) {
            break;
          }
          // Continue to next model
          continue;
        }
      } catch (error) {
        console.warn(`Model ${model} threw error:`, error.message);
        lastError = { status: 0, message: error.message, model: model };
        continue; // Try next model
      }
    }
    
    if (!data) {
      // All models failed
      const errorDetails = lastError || { status: 500, message: 'All models failed' };
      console.error('ASI:One API error (all models failed):', errorDetails);
      
      // Try to parse error if it's JSON
      let errorData;
      try {
        errorData = JSON.parse(errorDetails.message || '{}');
      } catch (e) {
        errorData = { error: { message: errorDetails.message } };
      }
      
      return res.status(errorDetails.status || 500).json({
        success: false,
        error: 'Failed to get AI response',
        message: errorData.error?.message || errorDetails.message || 'All AI models failed',
        status: errorDetails.status,
        details: errorDetails.message?.substring(0, 500) || 'No additional details available',
        triedModels: models
      });
    }
    
    // Extract the AI response
    const aiMessage = data.choices?.[0]?.message?.content || 'No response from AI';
    
    return res.status(200).json({
      success: true,
      message: aiMessage,
      model: data.model || customAgentId || 'asi1-fast-agentic',
      usage: data.usage || null,
      sessionId: sessionId // Return session ID for client to maintain context
    });

  } catch (error) {
    console.error('AI Agent API error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - API took too long to respond';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to ASI:One API - check network connection';
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: errorMessage,
      details: error.stack?.substring(0, 500) || 'No additional details available'
    });
  }
};

