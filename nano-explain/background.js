chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "nanoExplain",
        title: "Nano Explain",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "nanoExplain") {
        const selectedText = info.selectionText;
        const prompt = `Explain this to me like I am 5: ${selectedText}`;

        try {
            // Use the API to get the explanation
            const response = await fetchExplanationFromAPI(prompt);

            // Display the explanation in the active tab using executeScript
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: showAlert,
                args: [response]
            });
        } catch (error) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: showAlert,
                args: [`Error: ${error.message}`]
            });
        }
    }
});

// This function will be executed in the context of the current tab
function showAlert(message) {
    alert(message);
}

async function fetchExplanationFromAPI(prompt) {
    try {
        // Initialize AI capabilities and session
        const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
        const session = await chrome.aiOriginTrial.languageModel.create({
            systemPrompt: 'You are a helpful and friendly assistant.',
            temperature: capabilities.defaultTemperature,
            topK: capabilities.defaultTopK,
        });

        // Use the session to get a response
        const response = await session.prompt(prompt);
        return response;
    } catch (error) {
        throw new Error(`Failed to fetch explanation: ${error.message}`);
    }
}