/* eslint-env browser */
/* eslint "no-console": "off"  */
/* global$ */

var fileName = window.location.pathname;
var members;
if (fileName == "index.html") {
    readMore(dotsP, moreP, btnP);
} else if (fileName == "senate-data.html" || fileName == "/senate-attendance.html" || fileName == "/senate-party-loyalty.html") {
    var url = "https://api.propublica.org/congress/v1/113/senate/members.json";
    startFetch(url);
} else if (fileName == "/house-data.html" || fileName == "/house-attendance.html" || fileName == "/house-party-loyalty.html") {
    var url = "https://api.propublica.org/congress/v1/113/house/members.json";
    startFetch(url);
}


//var data = data;
//var members = data.results[0].members;


//Congress 113
var checkBox = document.getElementsByName("partyFilter");
var dropDown = document.getElementById("stateFilter");


//Attendance, Party Loyalty
var r_number = [];
var d_number = [];
var i_number = [];


//All pages except Home
function startFetch(url) {
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

            document.getElementById("load").style.display = "block"; // show tables after loading the data
            document.getElementsByClassName("lds-facebook")[0].style.display = "none"; // hide the loader after loading the data
        })
}


//Home
function readMore(dotsP, moreP, btnP) {
    var dots = document.getElementById(dotsP);
    var more = document.getElementById(moreP);
    var btn = document.getElementById(btnP);
    if (dots.style.display === "none") {
        dots.style.display = "inline";
        btn.innerHTML = "Read more";
        more.style.display = "none";
    } else {
        dots.style.display = "none";
        btn.innerHTML = "Read less";
        more.style.display = "inline";
    }
}


function init() {
    //Congress 113
    if (fileName == "/senate-data.html" || fileName == "/house-data.html") {
        setEventListeners();
        createOptions();
        createTable("members-data", members);
    }

    //Attendance, Party Loyalty
    else if (fileName == "/senate-attendance.html" || fileName == "/house-attendance.html" || fileName == "/senate-party-loyalty.html" || fileName == "/house-party-loyalty.html") {
        numberMembers();

        var statistics = {
            "number_of_republicans": r_number.length,
            "number_of_democrats": d_number.length,
            "number_of_independents": i_number.length,
            "r_pct_voted_with_party": votesWithParty(r_number),
            "d_pct_voted_with_party": votesWithParty(d_number),
            "i_pct_voted_with_party": votesWithParty(i_number),
            "least_loyal": calculateStatistics("least", "votes_with_party_pct"),
            "most_loyal": calculateStatistics("most", "votes_with_party_pct"),
            "least_engaged": calculateStatistics("least", "missed_votes_pct"),
            "most_engaged": calculateStatistics("most", "missed_votes_pct"),
        }

        // static table
        document.getElementById("republican-number").innerHTML = statistics.number_of_republicans;
        document.getElementById("democrat-number").innerHTML = statistics.number_of_democrats;
        document.getElementById("independent-number").innerHTML = statistics.number_of_independents;
        document.getElementById("total-number").innerHTML = members.length;

        document.getElementById("republican-voted-w-party").innerHTML = statistics.r_pct_voted_with_party;
        document.getElementById("democrat-voted-w-party").innerHTML = statistics.d_pct_voted_with_party;
        document.getElementById("independent-voted-w-party").innerHTML = statistics.i_pct_voted_with_party;
        document.getElementById("total-voted-w-party").innerHTML = votesWithParty(members);
    }

    // dinamic tables
    //attendance
    if (fileName == "/senate-attendance.html" || fileName == "/house-attendance.html") {
        statisticsTables(statistics.least_engaged, "least-engaged", "missed_votes", "missed_votes_pct");
        statisticsTables(statistics.most_engaged, "most-engaged", "missed_votes", "missed_votes_pct");
    }
    //party loyalty
    else if (fileName == "/senate-party-loyalty.html" || fileName == "/house-party-loyalty.html") {
        statisticsTables(statistics.least_loyal, "least-loyal", "total_votes", "votes_with_party_pct");
        statisticsTables(statistics.most_loyal, "most-loyal", "total_votes", "votes_with_party_pct");
    }
}


//Congress 113
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


//Attendance, Party Loyalty
function numberMembers() { // number of members of each party
    for (var counter = 0; counter < members.length; counter++) {
        if (members[counter].party == "R") {
            r_number.push(members[counter]);
        }
        if (members[counter].party == "D") {
            d_number.push(members[counter]);
        }
        if (members[counter].party == "I") {
            i_number.push(members[counter]);
        }
    }
}


function votesWithParty(party_number) { // average percentage of votes with party for each party
    var total = 0;
    for (var sum = 0; sum < party_number.length; sum++) {
        total = total + party_number[sum].votes_with_party_pct;
    }
    if (total == 0) { // if there is no members, the result will be 0
        return "--";
    } else {
        return (total / party_number.length).toFixed(2) + " %";
    }
}


function calculateStatistics(orderValue, memberValue) {
    var values = []; // array of 10% of the members
    var prc = ((members.length / 100) * 10).toFixed(); // 10%
    var order = orderValue; // specify the order of the members (minor to major, major to minor)
    if (order == "least") { // sort members from minor to major value
        members.sort(function (a, b) {
            return a[memberValue] - b[memberValue]
        });
    }
    if (order == "most") { // sort members from major to minor value
        members.sort(function (a, b) {
            return b[memberValue] - a[memberValue]
        });
    }
    for (var x = 0; x < members.length; x++) {
        if (values.length == 0 && values.length < prc) {
            values.push(members[x]); // only first loop 
        } else {
            if (values.length < prc || members[x][memberValue] === values[x - 1][memberValue]) {
                values.push(members[x]); // if the number of members is less than the 10%, OR if the last member value we put in the array is exactly the same as the one in the loop
            } else {
                break; // when the loop doesn't add any more members, it breaks and the function stops
            }
        }
    }
    return values;
}


function statisticsTables(tableInfo, tableID, valueNum, valuePct) {
    for (var y = 0; y < tableInfo.length; y++) {
        var row = document.createElement("tr");
        var website = document.createElement("a");
        website.href = tableInfo[y].url;
        var name = document.createTextNode(tableInfo[y].first_name + " " + tableInfo[y].last_name);
        website.appendChild(name);
        var votesNum = document.createTextNode(tableInfo[y][valueNum]);
        var votesPct = document.createTextNode(tableInfo[y][valuePct] + " %");
        var info = [website, votesNum, votesPct];
        for (var z = 0; z < info.length; z++) {
            var cell = document.createElement("td");
            cell.appendChild(info[z]);
            row.appendChild(cell);
        }
        document.getElementById(tableID).appendChild(row);
    }
}
