/*
 *  Filename: scripts.js
 *  Description: Provided JS source code as material for Lesson 3: JavaScript.
 *  Course Code: TNM115-2024VT
 *  Institution: Linköping University
 *
 *  Author: Nico Reski & Ramez Rizek 
 *  Version: 2024-02-01
 */

// array of JSON objects, representing individual Likert scale options;
// each JSON object has three keys (id, label, value)
const likertScaleJsonArray = [
    { id: "stronglydisagree", label: "Strongly Disagree", value: 1 },
    { id: "disagree",         label: "Disagree",          value: 2 },
    { id: "neutral",          label: "Neutral",           value: 3 },
    { id: "agree",            label: "Agree",             value: 4 },
    { id: "stronglyagree",    label: "Strongly Agree",    value: 5 }
];

// array of JSON objects, representing individual SUS questionnaire items;
// each JSON object has two keys (id, statement)
const susQuestionnaireJsonArray = [
    { id:  1, statement: "I think that I would like to use this system frequently."},
    { id:  2, statement: "I found the system unnecessarily complex."},
    { id:  3, statement: "I thought the system was easy to use."},
    { id:  4, statement: "I think that I would need the support of a technical person to be able to use this system."},
    { id:  5, statement: "I found the various functions in this system were well integrated."},
    { id:  6, statement: "I thought there was too much inconsistency in this system."},
    { id:  7, statement: "I would imagine that most people would learn to use this system very quickly."},
    { id:  8, statement: "I found the system very cumbersome to use."},
    { id:  9, statement: "I felt very confident using the system."},
    { id: 10, statement: "I needed to learn a lot of things before I could get going with this system."}
];

//CHANGED
//Changed the randomizer to shuffle the statments instead of the entire objects.
//Since odd and even statments are calculated differently we needed to just shuffle them around respectively

// function to randomize the array containing the SUS questionnaire items as JSON objects
// returns: array of JSON objects
function getRandomizedSusQuestionnaireJsonArray(){

    // separate odd and even statements
    const oddStatements = susQuestionnaireJsonArray.filter(item => item.id % 2 !== 0);
    const evenStatements = susQuestionnaireJsonArray.filter(item => item.id % 2 === 0);

    // shuffle only the statement key for odd statements
    for(let i = oddStatements.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [oddStatements[i].statement, oddStatements[j].statement] = [oddStatements[j].statement, oddStatements[i].statement];
    }

    // shuffle only the statement key for even statements
    for(let i = evenStatements.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [evenStatements[i].statement, evenStatements[j].statement] = [evenStatements[j].statement, evenStatements[i].statement];
    }

    // merge shuffled odd and even statements back into a single array
    const shuffledArray = [];
    for (let i = 0; i < oddStatements.length; i++) {
        shuffledArray.push(oddStatements[i]);
        shuffledArray.push(evenStatements[i]);
    }

    return shuffledArray;
}
// function to calculate the System Usability Scale (SUS) score based on an input array of JSON objects;
// each JSON object has two keys (id, value), representing the answers of the individual SUS items
// returns: either a number value, representing the calculated SUS score,
//          or null if at least one of the answer values is missing (null)
function calculateScore(resultJsonArray){

    // Scoring SUS:
    // SUS yields a single number representing a composite measure of the overall usability of the
    // system being studied. Note that scores for individual items are not meaningful on their own.
    // To calculate the SUS score, first sum the score contributions from each item. Each item's
    // score contribution will range from 0 to 4. For items 1,3,5,7,and 9 the score contribution is
    // the scale position minus 1. For items 2,4,6,8 and 10, the contribution is 5 minus the scale
    // position. Multiply the sum of the scores by 2.5 to obtain the overall value of SU.
    // SUS scores have a range of 0 to 100.
    //
    // Source: John Brooke. SUS: A ’Quick and Dirty’ Usability Scale. In Patrick W. Jordan,
    // B. Thomas, Ian Lyall McClelland, and Bernard Weerdmeester, editors, Usability Evaluation
    // In Industry, pages 189–194. CRC Press, 11 June 1996. doi: 10.1201/9781498710411.

    let sumOdd = 0;
    let sumEven = 0;

    for(let i = 0; i < resultJsonArray.length; i++){
        if(resultJsonArray[i].value == null) return null;   
        if(resultJsonArray[i].id % 2 == 0){
            sumEven += resultJsonArray[i].value;
        } else {
            sumOdd += resultJsonArray[i].value;
        }
    }

    const x = sumOdd - 5;
    const y = 25 - sumEven;

    const susScore = (x + y) * 2.5;
    return susScore; 
}

// ===== PROVIDED JS SOURCE CODE    -- ABOVE   =====
// ===== JS LESSON 3 IMPLEMENTATION -- BENEATH =====

// your JavaScript (JS) source code goes here

function generateQuestionnaire() {

    const webpageURL = new URL(document.URL);
    //Is activated by manually appending the key to the url
    //i.e adding ?random=true
    //several params are added with an & between each pair "key=value"
    const isRandomized = webpageURL.searchParams.get("random") == "true";

    const  susContainerElement = document.getElementById("sus-questionnaire-container");
    if (isRandomized) {
        createSusQuestionnaire(susContainerElement, getRandomizedSusQuestionnaireJsonArray());
    }
    else    createSusQuestionnaire(susContainerElement, susQuestionnaireJsonArray);
}

function createLikertOptionDiv(susItemId, likertOptionJson){

    const divContainer = document.createElement("div");
    divContainer.className = "likert-flex-item";

    const inputElement = document.createElement("input");
    inputElement.type = "radio";
    inputElement.name = susItemId + "-scale";
    inputElement.id = inputElement.name + "-" + likertOptionJson.id;
    inputElement.value = likertOptionJson.value;

    const labelElement = document.createElement("label");
    labelElement.for = inputElement.id;
    const labelText = document.createTextNode(likertOptionJson.label);
    labelElement.appendChild(labelText);

    divContainer.appendChild(inputElement);
    divContainer.appendChild(labelElement);
    return divContainer;
}

function createLikertScaleDiv(susItemId){
    const divContainer = document.createElement("div");
    divContainer.className = "likert-flex-buttons";

    for (let index = 0; index < likertScaleJsonArray.length; index++) {
        const currentLikertOptionDiv = createLikertOptionDiv(susItemId, likertScaleJsonArray[index]);
        divContainer.appendChild(currentLikertOptionDiv);
    }
    return divContainer;
}

function createSusItemDiv(susItemJson){
    const divContainer = document.createElement("div");
    divContainer.className = "likert-flexbox-container";

    const pId = document.createElement("p");
    pId.className = "likert-flex-qNr";
    const pNr = document.createTextNode(susItemJson.id + ".");
    pId.appendChild(pNr);

    const pStatment = document.createElement("p");
    pStatment.className = "likert-flex-q";
    const pText = document.createTextNode(susItemJson.statement);
    pStatment.appendChild(pText);


    divContainer.appendChild(pId);
    divContainer.appendChild(pStatment);
    divContainer.appendChild(createLikertScaleDiv(susItemJson.id));

    return divContainer;

}

function createSusQuestionnaire(parentcontainer, questionnaireJsonArray){

    while (parentcontainer.lastElementChild != parentcontainer.firstElementChild) {
        parentcontainer.removeChild(parentcontainer.lastChild);
    }


    for (let index = 0; index < questionnaireJsonArray.length; index++) {
        const element = createSusItemDiv(questionnaireJsonArray[index]);
        parentcontainer.appendChild(element);
        parentcontainer.appendChild(document.createElement("hr"));

    }
}


function submitQuestionnaire(){
    const resultJsonArray = [];
    for (let I = 0; I < susQuestionnaireJsonArray.length; I++) {
        const currentResult = getSubmittedValueForSusItem(susQuestionnaireJsonArray[I].id);
        resultJsonArray.push({ id: susQuestionnaireJsonArray[I].id, value: currentResult});
    }

    const susScore = calculateScore(resultJsonArray);
    const pSusResult = document.getElementById("sus-result");
    if(susScore == null) pSusResult.innerHTML = "Invalid: Not all items were answered.";
    else pSusResult.innerHTML = "SUS Score = " + susScore;

}

function getSubmittedValueForSusItem(susItemId){

    const radioButtonGroupName = susItemId + "-scale";
    const radioCollection = document.getElementsByName(radioButtonGroupName);

    let result = null;
    for (let I = 0; I < radioCollection.length; I++) {
        if (radioCollection[I].checked) {
            result = Number(radioCollection[I].value);
        }
    }

    return result;

}