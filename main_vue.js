var app = new Vue({
    el: "#app",

    data: {
        url: "",
        members: [],
        loading: true,

        //Congress 113
        checkBoxes: [],
        dropDown: "All",
        selectOptions: [],
        noMember: false,

        //Attendance & Party Loyalty
//        statistics: {
//            total_republicans: [],
//            total_democrats: [],
//            total_independents: [],
//            r_pct_voted_w_party: 0,
//            d_pct_voted_w_party: 0,
//            i_pct_voted_w_party: 0,
//            least_loyal: 0,
//            most_loyal: 0,
//            least_engaged: 0,
//            most_engaged: 0,
//        },
    },

    methods: {
        getUrl: function () { // get the URL depending on which HTML is active
            if (window.location.pathname == "/senate-data.html") {
                this.url = "https://api.propublica.org/congress/v1/113/senate/members.json";
            }
            if (window.location.pathname == "/house-data.html") {
                this.url = "https://api.propublica.org/congress/v1/113/house/members.json";
            }
        },
        getData: function (url) { // fetch function, call live data
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
                    app.members = myData.results[0].members;

                    app.init();
                })
        },
        init: function () { // function that call functions inside the fetch
            app.loading = false;
            app.createSelectOptions(app.members);
//            app.numberOfMembers();
        },

        //Congress 113
        createSelectOptions: function (members) { // create the dropdown options
            for (var op = 0; op < this.members.length; op++) {
                if (!this.selectOptions.includes(this.members[op].state)) {
                    this.selectOptions.push(this.members[op].state);
                }
            }
            this.selectOptions.sort();
        },

        filterData: function (member) { // filter members by Party and State: returns a condition called in the HTML (v-if)
            return (this.checkBoxes.length == 0 || this.checkBoxes.includes(member.party)) && (this.dropDown == "All" || this.dropDown == member.state)
        },

        //Attendance & Party Loyalty
//        numberOfMembers: function () {
//            for (var counter = 0; counter < this.members.length; counter++) {
//                if (this.members[counter].party == "R") {
//                    this.statistics.total_republicans.push(this.members[counter]);
//                } else if (this.members[counter].party == "D") {
//                    this.statistics.total_democrats.push(this.members[counter]);
//                } else if (this.members[counter].party == "I") {
//                    this.statistics.total_independents.push(this.members[counter]);
//                }
//            }
//        },
    },

    created() { // function called once the web is created
        this.getUrl();
        this.getData(this.url);
    },

    updated() { // function called after the web is updated

        //Congress 113
        var membersFound = document.getElementById("members-data").children.length;
        if (membersFound == 0) {
            this.noMember = true;
        } else {
            this.noMember = false;
        }
    }
})
