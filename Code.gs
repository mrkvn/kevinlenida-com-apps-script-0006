/**
 * Returns result based on the query you've provided.
 *
 * @param {A1:A10} data The data you want to do something with.
 * @param {string} query The query or task you want to perform on the data.
 * @return {string} Result.
 * @customfunction
 */
function KLFORMULA(data, query) {
  if (Array.isArray(data)) {
    const flatArray = data.flat();
    return callGroqAPI(flatArray.join(', '), query);
  } else {
    return callGroqAPI(data, query);
  }
}

function callGroqAPI(data, query) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const scriptProperties = PropertiesService.getScriptProperties()
  const apiKey = scriptProperties.getProperty('apiKey')

  const headers = {
    "Authorization": "Bearer " + apiKey,
    "Content-Type": "application/json"
  };

  const payload = JSON.stringify({
    "messages": [
      {
        "role": "user",
        "content": `
QUERY: ${query}

Apply the QUERY to the following data:
${data}

Requirements:
- It is important that you only respond with your answer on what was queried and nothing else.
- If your response would have multiple values, separate them using double pipes ||
`
      }
    ],
    "model": "llama3-70b-8192",
    "temperature": 0,
    "max_tokens": 8192
  });

  const options = {
    "method": "post",
    "headers": headers,
    "payload": payload,
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const jsonResponse = response.getContentText()
    const parsedResponse = JSON.parse(jsonResponse)
    const content = parsedResponse.choices[0].message.content
    return content
  } catch (e) {
    return "Error: " + e.toString()
  }
}
