/* eslint-env browser */
/* eslint "no-console": "off"  */
/* global$ */

var members;
if (window.location.pathname == "/senate-data.html"){
var url = "https://api.propublica.org/congress/v1/113/senate/members.json";}
if (window.location.pathname == "/house-data.html"){
    var url = "https://api.propublica.org/congress/v1/113/house/members.json";
}

//var data = data;
//var members = data.results[0].members;

var checkBox = document.getElementsByName("partyFilter");
var dropDown = document.getElementById("stateFilter");


fetch(url, {
        headers: {
            "X-API-Key": "YQbn7faZKQ0lCUB1OC45LY19AZhdZjMhY2smuevx"
        }
    })
    .then(function (data) {
        return data.json();
    })
    .then(function (myData) {
        console.log(myData);
        members = myData.results[0].members;
    
        init();
    
    document.getElementById("load").style.display="block"; // show tables after loading the data
    document.getElementsByClassName("lds-facebook")[0].style.display="none"; // hide the loader after loading the data
    })


function init() {
setEventListeners();
createOptions();
createTable("members-data", members);
}


function setEventListeners() {
    for (var k = 0; k < checkBox.length; k++) {
        checkBox[k].addEventListener("click", filter);
    }
    dropDown.addEventListener("change", filter);
}


function createOptions() { // create options in the dropdown
    var optionStates = [];
    
    for (var r = 0; r < members.length; r++) {
        if (!optionStates.includes(members[r].state)) { // if the member's state is NOT included in the optionStates array
            optionStates.push(members[r].state);
        }
    }
    optionStates.sort();
    for (var s = 0; s < optionStates.length; s++) {
        var option = document.createElement("option");
        option.setAttribute("value", optionStates[s]); // add a value (state) to each option
        option.innerHTML = optionStates[s]; // add text (state) to each option
        document.getElementById("stateFilter").appendChild(option);
    }
}


function filter() {
    var partyArray = []; // checked checkboxes
    var filteredMembers = []; // final array of members that will generate the filtered table
    for (var p = 0; p < members.length; p++) {
        if (!checkBox[0].checked && !checkBox[1].checked && !checkBox[2].checked && dropDown.value == "All") {
            filteredMembers = members; // checkboxes unchecked, dropdown unselected
        }
        if (!checkBox[0].checked && !checkBox[1].checked && !checkBox[2].checked && dropDown.value == members[p].state) {
            filteredMembers.push(members[p]); // checkboxes unchecked, dropdown selected
        }
    }
    for (var l = 0; l < checkBox.length; l++) {
        if (checkBox[l].checked && checkBox[l].value == "R") {
            partyArray.push(checkBox[l].value); // checkbox Republicans checked
        }
        if (checkBox[l].checked && checkBox[l].value == "D") {
            partyArray.push(checkBox[l].value); // checkbox Democrats checked
        }
        if (checkBox[l].checked && checkBox[l].value == "I") {
            partyArray.push(checkBox[l].value); // checkbox Independent checked
        }
    }
    for (var m = 0; m < members.length; m++) {
        for (var n = 0; n < partyArray.length; n++) {
            if (members[m].party == partyArray[n] && members[m].state == dropDown.value) {
                filteredMembers.push(members[m]); // checkboxes checked, dropdown selected
            }
            if (members[m].party == partyArray[n] && dropDown.value == "All") {
                filteredMembers.push(members[m]); // checkboxes checked, dropdown unselected
            }
        }
    }
    document.getElementById("members-data").innerHTML = ""; // delete the previous table
    createTable("members-data", filteredMembers); // create the new filtered table
}


function createTable(pageID, membersArray) {
    if (membersArray.length == 0) {
        var notFound = document.createTextNode("No member found.");
        document.getElementById(pageID).appendChild(notFound); // display a message when no member is found to display
    }
    for (var i = 0; i < membersArray.length; i++) {
        var row = document.createElement("tr");
        var website = document.createElement("a");
        website.href = membersArray[i].url;
        if (membersArray[i].middle_name == null) {
            var name = document.createTextNode(membersArray[i].first_name + " " + membersArray[i].last_name);
        } else {
            var name = document.createTextNode(membersArray[i].first_name + " " + membersArray[i].middle_name + " " + members[i].last_name);
        }
        website.appendChild(name);
        var party = document.createTextNode(membersArray[i].party);
        var state = document.createTextNode(membersArray[i].state);
        var seniority = document.createTextNode(membersArray[i].seniority);
        var votes = document.createTextNode(membersArray[i].votes_with_party_pct + "%");
        var membersInfo = [website, party, state, seniority, votes];
        for (var j = 0; j < membersInfo.length; j++) {
            var cell = document.createElement("td");
            cell.appendChild(membersInfo[j]);
            row.appendChild(cell);
        }
        document.getElementById(pageID).appendChild(row);
    }
}
