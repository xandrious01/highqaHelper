const urlInput = document.getElementById("urlInput");
const sampleInput = document.getElementById("sampleInput");
const stepInput = document.getElementById("stepInput");

const singleForm = document.getElementById("singleForm");
const multiForm = document.getElementById("multiForm");

const resetButton = document.getElementById("resetButton");

const baseUrl = "https://highqaim:4085/dims/?";
const multiBaseUrl = "https://highqaim:4085/dimsmulti/?";
const staticParams = {};


const testUrl = "https://highqaim:4085/dims/?partid=27286&instid=1465135&jobid=33769&lotid=-1#";
const testSample = 1;

window.onload = () => {
    const prevUrl = localStorage.getItem('url') ? localStorage.getItem('url') : false;
    if (prevUrl) urlInput.value = prevUrl;
    const prevSample = localStorage.getItem('sampleNum') ? localStorage.getItem('sampleNum') : false;
    if (prevSample) sampleInput.value = prevSample;
    const prevStep = localStorage.getItem('step') ? localStorage.getItem('step') : 1;
    if (prevStep) stepInput.value = prevStep;
}

singleForm.addEventListener("submit", function(e){
    e.preventDefault();
    checkHideError();
    //check if error message is visible, hide if it is until triggered again
    const { difference, step } = checkInputs();
    //at this point, we should have the staticParams object filled out and a 'difference' value for instId calculation
    //gather desired sample number from single input form, handle form submission
    let singleSample = document.getElementById("singleSample").value;
    if(singleSample > 1){

        const outputUrl = constructSingleUrl(singleSample, difference);
        //update UI, reset form
        singleForm.reset();
        updateUiSingle(singleSample, outputUrl);
    } else {
        showErrorMsg();
    }
    
});

multiForm.addEventListener("submit", function(e){
    e.preventDefault();
    checkHideError();
    const { difference, step } = checkInputs();
    const rangeStart = document.getElementById("multiFormFirst").value;
    const rangeEnd = document.getElementById("multiFormLast").value;

    if(rangeStart && rangeEnd && rangeEnd - rangeStart > 0){
        const outputUrl = constructMultiUrl(rangeStart, rangeEnd, difference);
        //update UI, reset form
        multiForm.reset();
        updateUiMulti(rangeStart, rangeEnd, outputUrl); 
    } else {
        showErrorMsg();
    }
    
});

resetButton.addEventListener("click", function(e){
    e.preventDefault();
    localStorage.clear();
    urlInput.value = "";
    sampleInput.value = "";
    stepInput.value = 1;

})

function checkInputs(){
        //check that user has filled out header form
        // if correct, send inputs to be parsed
    const url = urlInput.value.trim();
    const sample = sampleInput.value.trim();
    const step = stepInput.value.trim()
    saveToLocal(url, sample, step);
    const difference = (url === undefined) || (sample === undefined) ? showErrorMsg() : parseInputs(url, sample);
    return { difference, step };
}

function parseInputs(url, sample){
        //parse url, pass values to staticParams obj
        //pull instid from url
        //check that all params exist, trigger error if not
        //set difference for calculating instId

    const params = url.split(baseUrl)[1];
    const parsed = params.split('&');
    let difference;
    if (params){
        for (let i of parsed){
            let split = i.split("=");
            let key = split[0];
            let value = split[1];

            if (key !== "instid"){
                staticParams[key] = value;
            }
            if (key === "instid"){
                instId = value;
            }
        }
    difference = instId - parseInt(sample); 
    } else {
        showErrorMsg();
    }
    return difference;
};


function constructSingleUrl(singleSample, difference, step){
    //single sample is the sample that the user is wanting to get
    //sampleInput is the sample for which the user has already provided a url
    //if there is a check for every sample, we do not need to do any additional calculations besides getting the difference
    //if there is a step between each sample, ie there is only data input for samples 1, 29, 57, 85 etc
    //we need to find the difference between singleSample and sampleInput
    const {partid, jobid, lotid} = staticParams;
    let newId;
    if (step === 1) {
        newId = Number(singleSample) + Number(difference);
    }
    if (step !== 1){
        let count = 0;
        if (singleSample > sampleInput){
           for (let i of 1000) {
               count += 1; 
               let newNum = singleSample - stepInput;
               newNum === sampleInput ? true : false;
               if (true) break;
               if (false) continue;
        }
    }
    const newUrl = baseUrl + `partid=${partid}` + `&instid=${newId}` +`&jobid=${jobid}`+`&lotid=${lotid}`;
    return newUrl;
};


function constructMultiUrl(rangeStart, rangeEnd, difference){
    const {partid, jobid, lotid} = staticParams;
    const newId = Number(rangeStart) + Number(difference);
    const newIdLast = Number(rangeEnd) + Number(difference);
    const sampleIds = String(newId) + '-' + String(newIdLast);
    const multiLotId = lotid.slice(0,-1);
    const newUrl = multiBaseUrl + `&partid=${partid}` + `&instid=${newId}` +`&jobid=${jobid}`+`&sampleids=${sampleIds}`+`&lotid=${multiLotId}`;
    return newUrl;
};


function updateUiSingle(singleSample, outputUrl){
    const singleFormOutput = document.getElementById("singleFormOutput");
    const link = createDocumentLink(outputUrl);
    //create <a> object for index page
    singleFormOutput.innerText=`The URL for sample ${singleSample} is:`;
    singleFormOutput.appendChild(link);
    singleFormOutput.className="mt-3"
};

function updateUiMulti(rangeStart, rangeEnd, outputUrl){
    const multiFormOutput = document.getElementById("multiFormOutput");
    const link = createDocumentLink(outputUrl)
    multiFormOutput.innerText=`The URL for samples ${rangeStart}-${rangeEnd} is:`;
    multiFormOutput.appendChild(link);
    multiFormOutput.className="mt-3"
};


function createDocumentLink(outputUrl){
    const link = document.createElement('a');
    link.href = outputUrl;
    link.textContent = outputUrl;
    link.target = '_blank';
    link.className = "p-3 output-link"
    return link;
}


function showErrorMsg(){
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.classList.remove("invisible");
    
};

function checkHideError(){
    const errorMsg = document.getElementById("errorMsg");
    !(errorMsg.classList.contains("invisible")) ? errorMsg.className = "invisible" : true;
    
}


function saveToLocal(url, sample, step){
    localStorage.setItem('url', url);
    localStorage.setItem('sampleNum', sample);
    localStorage.setItem('step', step);
}
