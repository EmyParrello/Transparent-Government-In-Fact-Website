/* eslint-env browser */
/* eslint "no-console": "off"  */
/* global$ */

var members;
if (window.location.pathname == "/senate-party-loyalty.html") {
    var url = "https://api.propublica.org/congress/v1/113/senate/members.json";
}
if (window.location.pathname == "/house-party-loyalty.html") {
    var url = "https://api.propublica.org/congress/v1/113/house/members.json";
}

//var data = data;
//var members = data.results[0].members;

var r_number = [];
var d_number = [];
var i_number = [];


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


function init() {
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

    // dinamic tables
    statisticsTables(statistics.least_loyal, "least-loyal", "total_votes", "votes_with_party_pct");
    statisticsTables(statistics.most_loyal, "most-loyal", "total_votes", "votes_with_party_pct");
}



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
