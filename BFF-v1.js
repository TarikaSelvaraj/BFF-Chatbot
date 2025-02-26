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
            
            
          qid: "Q1594", // CHANGE: Added qid property for Qualtrics mapping
          question: "What is the primary function of your position?",
          options: ["ATS", "ATS-D&IS", "ATS-Infrastructure/other", "ATS-PLT", "Claims", "Claims-Auto", "Claims-Casualty", "Claims-Property", "Customer Experience", "Data(D3)",
            "Direct Sales", "Distribution - Agency", "Enterprise Operations", "Field Leadership", "Finance", "HR", "Legal", "Marketing", "Marketing - Analytics", "Marketing - Service",
            "National General", "Overall Leadership(C-suite)", "Property Protection Services(PPS)", "Product", "Product - Actuary", "Product - Property", "Product - State product management",
            "Risk(ERRM)", "Strategy and/or Investments"]
        },
        {
          qid: "Q848", // CHANGE: Added qid property for Qualtrics mapping
          question: "Which one of the following best represents your job title?",
          options: ["C-Level", "Executive Position", "Function or division leader", "Next line of leadeers", "Other"]
        },
        {
          qid: "Q1593", // CHANGE: Added qid property for Qualtrics mapping
          question: "How many years have you worked at your company?",
          options: ["Less than a year", "1 to 5 years", "6 to 10 years", "11 to 15 years", "More than 15 years"]
        },


        {
            qid: "Q1246",
            question: "How would you rate your expertise in AI-related topics?",
            options: ["Beginner: I have basic knowledge but limited practical experience (e.g. experimented with CoPilot or ChatGPT).",
                 "Intermediate: I have a good understanding and some practical experience (e.g. significant formal trainings and regular user of AI tools).",
                  "Advanced: I have extensive knowledge and significant practical experience (e.g. formal education in AI and power user of AI tools).",
                   "Expert: I am highly knowledgeable and have led multiple large scale AI initiatives (e.g. formal education in AI and experience leading roll-out of AI tools)."]
        },

        {
            qid: "Q1248",
            question: "How would you describe your awareness of AI initiatives within your company?",
            options: ["Not aware", "Slightly aware", "Moderately aware", "Very aware", "Slightly aware"]
        },
        {
            qid: "Q1247", 
            question: "What is your level of involvement in your company’s AI projects?",
            options: ["Not involved", "Low involvement", "Moderate involvement", "High Involvement"]
        },


      ],
      sections: []
    };
  


    //NEED TO FIX THIS 
    // Generate 25 sections each with 10 questions (each question has options)
    for (let i = 1; i <= 25; i++) {
      let section = {
        header: `Section ${i}`,
        questions: []
      };
      for (let j = 1; j <= 10; j++) {
        section.questions.push({
          qid: `QID_S${i}Q${j}`, // CHANGE: Added qid property for each section question
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
          splash.style.display = "none";  // <-- CHANGE: Hide the splash image after hitting next
          stage = "introduction";
          askNext();
        } else if (stage === "demographics") {
          // CHANGE: Use the qid from the current demographic question as the key
          const currentDemoQID = surveyFlow.demographics[demoQuestionIndex].qid;
          responses[currentDemoQID] = answerText;
          demoQuestionIndex++;
          askNext();
        } else if (stage === "sections") {
          // CHANGE: Use the qid from the current section question as the key
          const currentSectionQID = surveyFlow.sections[currentSectionIndex].questions[currentSectionQuestionIndex].qid;
          responses[currentSectionQID] = answerText;
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
  
        // CHANGE: The payload now maps responses by their Qualtrics question IDs (qids)
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
  
      
  });


