import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";


class Assignment {
    constructor(aName, diffDesc, diff, imp, dueD, tC, deadDate, elemental) {
        this.assignName = aName;
        this.difficultyDesc = diffDesc;
        this.difficulty = diff;
        this.importance = imp;
        this.dueD = dueD;

        if (((dueD - cDateV) / 86400000) < 0) {
            this.dueDate = 0;
        } else {
            this.dueDate = 3.5*(Math.log10((((dueD - cDateV) / 86400000))+0.1)+1);
        }
        this.taskComp = tC;
        this.pScore = Math.sqrt(((diff - 10) ** 2) + ((imp - 10) ** 2) + (this.dueDate ** 2) + ((tC ** 2)));
        this.element = elemental;
        this.deadlineDay = deadDate;
    }
}

// Constructor Values for Assigmenent
let positioner;
let assignElement;
let tC;
let ourDiff;
let impBoxV;
let assignList;
let tempAssign;

function sorter() {
    let assign = [...assignList];
    assign.sort((a, b) => a.pScore - b.pScore);
    assignList = assign;
}

//basically to update/get the pscores as accurate as possible
function reconfig() {
    for (let i = 0; i < assignList.length; i += 1) { 
         if (((assignList[i].dueD - cDateV) / 86400000) < 0) {
            assignList[i].dueDate = 0;
        } else {
            assignList[i].dueDate = 3.5*(Math.log10((((assignList[i].dueD - cDateV) / 86400000))+0.1)+1);
        }

        assignList[i].pScore = Math.sqrt(((assignList[i].difficulty - 10) ** 2) + ((assignList[i].importance - 10) ** 2) + (assignList[i].dueDate ** 2) + ((assignList[i].taskComp ** 2)));
    }
}

function formatDeadline(deadlineValue) {
    if (!deadlineValue) {
        return "Due date not set";
    }

    const deadline = new Date(deadlineValue);
    if (Number.isNaN(deadline.getTime())) {
        return `Due: ${deadlineValue}`;
    }

    return `Due: ${new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(deadline)}`;
}

function placer() {
    positioner = document.getElementById('assignmentPool');
    positioner.replaceChildren()
    for (let i = 0; i < assignList.length; i += 1) {
        tempAssign = document.getElementsByClassName('assignmentTemplate')[0];
        assignElement = tempAssign.content.cloneNode(true);
        assignList[i].element = assignElement.firstElementChild;
        assignElement.querySelector('.assignmentName').innerText = assignList[i].assignName;
        assignElement.querySelector('.dueDay').innerText = formatDeadline(assignList[i].deadlineDay);
        assignElement.querySelector('.urgency').innerText = "Leisure Score: " + String(assignList[i].pScore.toFixed(2));
        assignElement.querySelector('.desc').innerText = "Description:\n" + assignList[i].difficultyDesc;

        //if the assignment is urgent, change the upper color
        if (assignList[i].pScore < 5){
            console.log("THIS RAN")
            console.log(assignElement.querySelector(".assignment"))
            assignElement.querySelector(".assignment").style.setProperty("--article-color2", "rgba(251, 47, 47, 0.518)")
            assignElement.querySelector(".assignment").style.setProperty("--article-color", "rgba(255, 148, 148, 0.52)")
            assignElement.querySelector(".dueDay").style.setProperty("--article-color", "rgba(255, 148, 148, 0.52)")
             assignElement.querySelector(".assignmentAlertIcon").style.setProperty("visibility", "visible")
        }
        

        positioner.appendChild(assignElement);

    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dueDateInput = document.getElementById('inputDate');
    if (dueDateInput && typeof dueDateInput.showPicker === 'function') {
        const openDatePicker = () => {
            dueDateInput.showPicker();
        };

        dueDateInput.addEventListener('click', openDatePicker);
        dueDateInput.addEventListener('focus', openDatePicker);
    }

    
    if (localStorage.getItem('saveAList') == null) {
        assignList = [];
    } else {
        assignList = JSON.parse(localStorage.getItem('saveAList'));
        positioner = document.getElementById('assignmentPool');
        reconfig();
        sorter();
        placer();
    }
})

let classification;




let labels = ["hard"];

window.classifyic = async function () {
    classification = await pipeline("zero-shot-classification");
}
classifyic();

async function difficulty(description) {
    let difficulty = await classification(description, labels);
    console.log(difficulty)
    let decimalDifficulty = (parseFloat(difficulty.scores[0]) * 10).toFixed(2);

    return parseFloat(decimalDifficulty);
}
window.estimate = async function () {
    ourDiff = await difficulty(document.getElementById("inputDesc").value + " - " + document.getElementById("inputName").value);
    console.log(ourDiff)
    document.getElementById('inputDiff').value = ourDiff;
}

const cDateV = new Date().getTime();

// Assignment Functions
window.addAssignment = function () {
    document.getElementById('assignmentPanel').style.visibility = 'visible';
}

window.completeAssignment = function () {
    let amountCorrect = 0;
    if (isNaN(parseFloat(document.getElementById('inputImportance').value))) {
        document.getElementById('inputImportance').style.color = 'red';
    } else {
        impBoxV = parseFloat(document.getElementById('inputImportance').value);
        if (impBoxV >= 1 && impBoxV <= 10) {
            document.getElementById('inputImportance').style.color = 'green';
            amountCorrect += 1;
        } else {
            document.getElementById('inputImportance').style.color = 'red';
        }
    }

    if (isNaN(parseFloat(document.getElementById('inputDiff').value))) {
        document.getElementById('inputDiff').style.color = 'red';
    } else {
        ourDiff = parseFloat(document.getElementById('inputDiff').value);
        if (ourDiff >= 0 && ourDiff <= 10) {
            document.getElementById('inputDiff').style.color = 'green';
            amountCorrect += 1;
        } else {
            document.getElementById('inputDiff').style.color = 'red';
        }
    }

    if (isNaN(parseFloat(document.getElementById('inputTask').value))) {
        document.getElementById('inputTask').style.color = 'red';
    } else {
        tC = parseFloat(document.getElementById('inputTask').value);
        if (tC >= 0 && tC <= 100) {
            document.getElementById('inputTask').style.color = 'green';
            amountCorrect += 1;
        } else {
            document.getElementById('inputTask').style.color = 'red';
        }
    }
    
    console.log("val as date:" + document.getElementById('inputDate').value)
//fix
    if ((amountCorrect == 3) && (document.getElementById('inputDate').value !== "")) {
        // Create assignment object
        const createAssign = new Assignment(document.getElementById('inputName').value, document.getElementById('inputDesc').value, ourDiff, impBoxV, document.querySelector('#inputDate').valueAsNumber, tC, document.querySelector('#inputDate').value);
        // Add assign object to list 
        assignList.push(createAssign);
        sorter();
        placer();
        // Save the assignment list
        localStorage.setItem('saveAList', JSON.stringify(assignList));
        
        console.log(assignList);

        // Hide the assignment panel
        document.getElementById('assignmentPanel').style.visibility = 'hidden';
    } else {
        // Make the error box message visible
        // document.getElementById('errorMssage').style.visibility = 'visible';
    }
}

window.done = function(event) {
    for (let i=0; i < assignList.length; i+=1)
    {
        console.log(assignList[i].element)
        console.log(event.target.parentElement)
        if (assignList[i].element == event.target.parentElement)
        {
            assignList.splice(i, 1)
            sorter()
            placer()
            localStorage.setItem('saveAList', JSON.stringify(assignList))
        }
    }
    
}

window.openPage = function () {
    location.href = "dash.html";
}

window.removePanel = function () {
    document.getElementById("assignmentPanel").style.visibility = "hidden";
}
