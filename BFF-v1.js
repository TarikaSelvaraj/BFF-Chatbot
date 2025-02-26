document.addEventListener("DOMContentLoaded", function() {
    
    // Splash Page elements
    const splash = document.getElementById("splash");
    const startBtn = document.getElementById("start-btn");

    // Chat container (make sure this is defined along with chatBox, userInput, and sendBtn)
    const chatContainer = document.getElementById("chat-container");

    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
  
    // Define survey flow with Agreement, Introduction, Demographics (as objects with question and options)
    const surveyFlow = {
      agreement: "You have been invited to provide important information in an application, system, or website managed by Boston Consulting Group, Inc. (BCG) for the purposes of conducting an artificial intelligence maturity assessment with your company. Your data provided in the survey could be transmitted to your company, worldwide to other BCG entities, and with our vendor Qualtrics, a third party we have engaged to help us with the survey process. BCG will process the requested data in accordance with our agreement with your company, applicable data protection laws and BCG's Privacy Policy on the basis of your consent. The consent is voluntary and can be revoked at any time for the future. Please contact ewald.caleb@bcg.com in case of questions. I have read the information and accept the processing of my personal data for the above mentioned purpose. (Type 'Yes' to continue)",
      introduction: "The Build for the Future (BFF) assessment is our assessment tool for an organization's digital and AI maturity to accelerate transformation journeys. It helps to set the right ambition level and to understand what is key to succeed in the digital and AI age. The BFF Assessment is a top level executive assessment of the digital and AI maturity across eight building blocks and 53 dimensions. The survey should take approximately 30-minutes to complete. The survey is anonymous and your answers will not be attributed back to you. Please provide honest and candid ratings and commentary. Please note: If you plan to make a pause while filling out the survey, the survey is saved automatically as you answer. If you want to resume from where you left off, make sure you use the same browser and the same device. Thank you! In order to complete this survey you will be asked, for every dimension considered, to provide a view on: the current maturity of the organization; the target state that it is trying to achieve in 3 years; the importance that each dimension has for the company. We encourage you to provide specific examples to support your assessment or any other additional information that you deem as relevant in the comments box below each question.",
      demographics: [
        {
          question: "What is your age?",
          options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65 or older"]
        },
        {
          question: "What is your gender?",
          options: ["Male", "Female", "Other", "Prefer not to say"]
        },
        {
          question: "Where are you located?",
          options: ["North America", "South America", "Europe", "Asia", "Africa", "Australia", "Other"]
        }
      ],
      sections: []
    };
  
    // Generate 25 sections each with 10 questions (each question has options)
    for (let i = 1; i <= 25; i++) {
      let section = {
        header: `Section ${i}`,
        questions: []
      };
      for (let j = 1; j <= 10; j++) {
        section.questions.push({
          question: `Section ${i} - Question ${j}?`,
          options: ["Option A", "Option B", "Option C", "Option D"]
        });
      }
      surveyFlow.sections.push(section);
    }
  
    // Variables to track survey progress
    let stage = "agreement"; // stages: agreement -> introduction -> demographics -> sections
    let demoQuestionIndex = 0;
    let currentSectionIndex = 0;
    let currentSectionQuestionIndex = 0;
    let responses = {};
  
    // Append messages to the chatBox. Using innerHTML allows bold tags.
    function appendMessage(text, sender) {
      const message = document.createElement("div");
      message.classList.add("message", sender);
      message.innerHTML = text;
      chatBox.appendChild(message);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    // Display a question with clickable options
    function displayQuestion(questionObj) {
      appendMessage(questionObj.question, "bot");
      if (questionObj.options && questionObj.options.length > 0) {
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("options-container");
        questionObj.options.forEach(option => {
          const button = document.createElement("button");
          button.textContent = option;
          button.classList.add("option-btn");
          button.addEventListener("click", function() {
            appendMessage(option, "user");
            processAnswer(option);
          });
          optionsContainer.appendChild(button);
        });
        chatBox.appendChild(optionsContainer);
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }
  
    // Determine and ask the next item in the survey flow
    function askNext() {
      if (stage === "agreement") {
        // Display Agreement header in bold then agreement text
        appendMessage("<b>Agreement</b>", "bot");
        appendMessage(surveyFlow.agreement, "bot");
      } else if (stage === "introduction") {
        appendMessage("<b>Introduction</b>", "bot");
        appendMessage(surveyFlow.introduction, "bot");
        // Move to demographics after showing the introduction.
        stage = "demographics";
        demoQuestionIndex = 0;
        askNext();
      } else if (stage === "demographics") {
        if (demoQuestionIndex === 0) {
          appendMessage("<b>Demographics</b>", "bot");
        }
        if (demoQuestionIndex < surveyFlow.demographics.length) {
          displayQuestion(surveyFlow.demographics[demoQuestionIndex]);
        } else {
          // After demographics, move to the sections
          stage = "sections";
          currentSectionIndex = 0;
          currentSectionQuestionIndex = 0;
          askNext();
        }
      } else if (stage === "sections") {
        if (currentSectionIndex < surveyFlow.sections.length) {
          // Display section header in bold if it is the first question in the section
          if (currentSectionQuestionIndex === 0) {
            appendMessage(`<b>${surveyFlow.sections[currentSectionIndex].header}</b>`, "bot");
          }
          if (currentSectionQuestionIndex < surveyFlow.sections[currentSectionIndex].questions.length) {
            displayQuestion(surveyFlow.sections[currentSectionIndex].questions[currentSectionQuestionIndex]);
          } else {
            // Finished current section; move on to the next section.
            currentSectionIndex++;
            currentSectionQuestionIndex = 0;
            askNext();
            return;
          }
        } else {
          appendMessage("Thank you! Submitting your responses...", "bot");
          sendToQualtrics();
        }
      }
    }
  
    // Process an answer (either from button click or typed input)
    function processAnswer(answerText) {
      if (stage === "agreement") {
        if (answerText.toLowerCase() !== "yes") {
          appendMessage("You must agree to proceed.", "bot");
          return;
        }
        stage = "introduction";
        askNext();
      } else if (stage === "demographics") {
        responses[`DemographicQ${demoQuestionIndex + 1}`] = answerText;
        demoQuestionIndex++;
        askNext();
      } else if (stage === "sections") {
        responses[`Section${currentSectionIndex + 1}_Q${currentSectionQuestionIndex + 1}`] = answerText;
        currentSectionQuestionIndex++;
        askNext();
      }
    }
  
    // Allow the user to type an answer and then click Send.
    sendBtn.addEventListener("click", function() {
      const userText = userInput.value.trim();
      if (userText === "") return;
      appendMessage(userText, "user");
      userInput.value = "";
      processAnswer(userText);
    });
  
    userInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        sendBtn.click();
      }
    });
  
    // Function to send responses to Qualtrics (endpoint and token to be replaced as needed)
    function sendToQualtrics() {
      const qualtricsSurveyID = "SV_eSf53LVy9QrCPyK"; // Replace with your Qualtrics survey ID
      const qualtricsAPIEndpoint = `https://bcg.eu.qualtrics.com/API/v3/surveys/${qualtricsSurveyID}/responses`;



      // question id link to connect
  
      const payload = { values: responses };
  
      fetch(qualtricsAPIEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-TOKEN": "DbSWPNfMqln29LqeuUQF407dyQc7iZdyyJjBvtDt"
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          appendMessage("Responses submitted successfully!", "bot");
        })
        .catch(error => {
          console.error("Error submitting survey:", error);
          appendMessage("There was an error submitting your responses. Please try again later.", "bot");
        });
    }
  
    // Start the chat by asking the agreement stage.
    askNext();


    ///Could add an event listener here to make sure tat the chatbox disapears on the next 
  });
  



