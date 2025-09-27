const { Configuration, OpenAIApi } = require('openai');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { field, title, abstract, speakerInfo } = JSON.parse(event.body);

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'AI features not configured. OpenAI API key is missing.' 
        }),
      };
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    let prompt = '';
    let responseField = '';

    switch (field) {
      case 'title':
        responseField = 'enhancedTitle';
        prompt = `
          As an expert conference organizer, help improve this session title to make it more engaging and compelling for attendees.
          
          Current title: "${title}"
          Abstract: "${abstract}"
          Speaker: ${speakerInfo.name} from ${speakerInfo.organization || 'Unknown'}
          
          Requirements:
          - Make it catchy and professional
          - Keep it under 80 characters
          - Ensure it accurately represents the content
          - Make it appealing to the target audience
          - Use action words when appropriate
          
          Return only the improved title, nothing else.
        `;
        break;

      case 'abstract':
        responseField = 'enhancedAbstract';
        prompt = `
          As an expert conference organizer, help improve this session abstract to make it more compelling and clear for conference attendees.
          
          Title: "${title}"
          Current abstract: "${abstract}"
          Speaker: ${speakerInfo.name} from ${speakerInfo.organization || 'Unknown'}
          ${speakerInfo.bio ? `Speaker bio: ${speakerInfo.bio}` : ''}
          
          Requirements:
          - Make it engaging and informative
          - Clearly explain what attendees will learn
          - Keep it between 150-300 words
          - Use professional but approachable language
          - Include key takeaways
          - Make it scannable with good structure
          
          Return only the improved abstract, nothing else.
        `;
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid field specified' }),
        };
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert conference organizer and content editor with years of experience in creating compelling session descriptions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: field === 'title' ? 100 : 500,
      temperature: 0.7,
    });

    const enhancedContent = completion.data.choices[0].message.content.trim();

    return {
      statusCode: 200,
      body: JSON.stringify({
        [responseField]: enhancedContent
      }),
    };

  } catch (error) {
    console.error('AI enhancement error:', error);
    
    // Handle specific OpenAI errors
    if (error.response) {
      return {
        statusCode: error.response.status,
        body: JSON.stringify({
          error: 'OpenAI API Error',
          details: error.response.data.error?.message || 'Unknown API error'
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to enhance content with AI',
        details: error.message
      }),
    };
  }
};