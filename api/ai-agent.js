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

    // Use custom agent: agent1q0jl046j3gphuf3py5fmjq0umpggej9eduy4srsrnn2337zxh7tuyurzq4z
    // This is the Fetch.ai agent address for your custom agent
    const customAgentId = 'agent1q0jl046j3gphuf3py5fmjq0umpggej9eduy4srsrnn2337zxh7tuyurzq4z';
    const models = [
      customAgentId, // Try custom agent first (Fetch.ai agent address)
      'ai/ccx', // Alternative format from URL
      'ccx', // Short ID format
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
        // Build request body
        // For custom agents, we'll send user message only (agent has its own system prompt)
        // For generic models, include system prompt
        const isCustomAgent = model === customAgentId || model === 'ai/ccx' || model === 'ccx' || model.startsWith('agent1');
        const requestBody = {
          model: model,
          messages: isCustomAgent ? [
            // Custom agents typically have their own system prompt defined
            {
              role: 'user',
              content: userMessage
            }
          ] : [
            // Generic models need system prompt
            {
              role: 'system',
              content: systemPrompt || 'You are a helpful AI assistant specializing in cryptocurrency market analysis.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        };

        console.log(`\n=== Trying model: ${model} ===`);
        console.log('API URL:', apiUrl);
        console.log('API Key:', apiKey.substring(0, 15) + '...');
        console.log('Session ID:', sessionId);
        console.log('Request Body:', JSON.stringify(requestBody, null, 2));
        
        // Build headers
        const headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CryptoCollectiveX/1.0',
          'x-session-id': sessionId // Include for all agentic models
        };
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
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
          
          console.error(`\n❌ Model ${model} failed:`);
          console.error('Status:', response.status, response.statusText);
          console.error('Error Response:', errorText);
          lastError = { status: response.status, message: errorText, model: model };
          
          // If it's a 401 (unauthorized), don't try other models (API key issue)
          if (response.status === 401) {
            break;
          }
          // For 404, try next model (agent might not exist, try generic)
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
      
      // Provide more helpful error message
      let errorMessage = 'Failed to get AI response';
      if (errorDetails.status === 401) {
        errorMessage = 'API key is invalid or expired. Please check your ASI:One API key.';
      } else if (errorDetails.status === 404) {
        errorMessage = 'Custom agent "ccx" not found. Please verify the agent ID is correct.';
      } else if (errorDetails.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (errorDetails.status === 500) {
        errorMessage = 'ASI:One API server error. The service may be temporarily unavailable.';
      }
      
      return res.status(errorDetails.status || 500).json({
        success: false,
        error: errorMessage,
        message: errorData.error?.message || errorDetails.message || 'All AI models failed',
        status: errorDetails.status,
        details: errorDetails.message?.substring(0, 500) || 'No additional details available',
        triedModels: models,
        lastErrorModel: errorDetails.model || 'unknown'
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

