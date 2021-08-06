var pageUrl = window.location.href;
var leverParameter = "";
var trackingPrefix = "?lever-";

if (pageUrl.indexOf(trackingPrefix) >= 0) {
    // Found Lever parameter
    var pageUrlSplit = pageUrl.split(trackingPrefix);
    leverParameter = "?lever-" + pageUrlSplit[1];
}
// TODO: i don't know if this will affect the WP stuff
$(document).ready(function () {

    // $jQuery methods go here...

    var url = "https://api.lever.co/v0/postings/bullhorn?group=team&mode=json";

    //Checking for potential Lever source or origin parameters


    //Fetching job postings from Lever's postings API
    $.ajax({
        dataType: "json",
        url: url,
        success: function (data) {
            // Normalize Data
            // {
            //     locations: {
            //         "location": ["id1", "id2"],
            //     },
            //     categories: {
            //         "category": ["id2", "id4"],
            //     },
            //     posts: [{}, {}]
            // }
            let postings = data.reduce((acc, next) => {
                const { postings } = next
                for (let i = 0; i < postings.length; i++) {
                    let posting = postings[i]
                    const { department, location } = posting.categories
                    const postingId = posting.id
                    // Mapping of all of the posts by id

                    acc.posts[postingId] = posting

                    // Mapping of all of the posts for a department
                    if (department in acc.departments) {
                        acc.departments[department].push(postingId)
                    } else {
                        acc.departments[department] = [postingId]
                    }

                    // Mapping of all of the posts for a location

                    if (location in acc.locations) {
                        acc.locations[location].push(postingId)
                    } else {
                        acc.locations[location] = [postingId]
                    }

                }

                return acc
            }, { locations: {}, departments: {}, posts: {} })

            createJobsFromPostings(postings);
            activateButtonsFromPostings(".jobs-teams", "departments", postings);
        }
    });

    //Search bar functionality
    //Get input element
    let filterInput = document.getElementById('filterInput');
    //Add event listener
    filterInput.addEventListener('keyup', filterNames);

});


function alertMessage(results) {
    alert(results[0].text);
}

function activateButtons(_data) {
    $(".jobs-teams").on("click", "a", function (e) {
        e.preventDefault();
        for (i = 0; i < _data.length; i++) {
            var teamRaw = _data[i].title;
            var team = cleanString(teamRaw);
            var jobs = $(".jobs-list");
            if ($(this).hasClass(team)) {
                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                    jobs.find(".job").fadeIn("fast");
                } else {
                    $(".jobs-teams").find("a").removeClass("active");
                    $(this).addClass("active");
                    jobs.find("." + team).fadeIn("fast");
                    jobs
                        .find(".job")
                        .not("." + team)
                        .fadeOut("fast");
                }
            }
        }
    });
}

function activateButtonsFromPostings(selector, selectedJobsList, postings) {
    // TODO: check if the selected list is in the postings

    $(selector).on("click", "a", function (e) {
        e.preventDefault();
        var jobs = $(".jobs-list");

        for (let key in postings[selectedJobsList]) {
            for (let id of postings[selectedJobsList][key]) {
                key = cleanString(nullCheck(key))
                let team = cleanString(nullCheck(key));

                if ($(this).hasClass(key)) {
                    console.log("key", key)
                    if ($(this).hasClass("active")) {
                        $(this).removeClass("active");
                        jobs.find(".job").fadeIn("fast");
                    } else {
                        $(".jobs-teams").find("a").removeClass("active");
                        $(this).addClass("active");
                        jobs.find("." + team).fadeIn("fast");
                        jobs
                            .find(".job")
                            .not("." + team)
                            .fadeOut("fast");
                    }
                }
            }
        }
    });
}


//Functions for checking if the variable is unspecified
function cleanString(string) {
    if (string) {
        var cleanString = string.replace(/\s+/gi, "");
        return cleanString;
    } else {
        return "Uncategorized";
    }
}

function nullCheck(string) {
    if (!string) {
        var result = "Uncategorized";
        return result;
    } else {
        return string;
    }
}

//CREATE JOBS START//

function createJobsFromPostings(postings) {

    for (var department in postings.departments) {

        // var team = nullCheck(id);
        // var department = "";
        var departmentCleanString = cleanString(nullCheck(department));
        var location = "";
        var locationCleanString = "";

        let teamButton = `<p class="tags teamCategories" style="padding: 0px 20px; margin: 0px;">
            <span>
                <a href="#" class="btn departmentFilterBtn ${departmentCleanString}">
                    ${department}
                </a>
            </span>
        </p>` 

        //Display all job departments in the .jobs-teams div
        $(".jobs-teams").append(teamButton);

        //Display all job locations in the .jobs-teams div
        // $(".jobs-locations").append(
        //     '<p class="tags teamCategories" style="padding: 0px 20px; margin: 0px;"><span><a href="#" class="btn departmentFilterBtn ' +
        //     locationCleanString +
        //     '">' +
        //     location +
        //     "</a></span></p>"
        // );

    }

    for (var id in postings.posts) {

        var posting = postings.posts[id];
        var id = posting.id;
        var title = posting.text;
        var shortDescription =
            $.trim(posting.descriptionPlain)
                .slice(1574)
                .substring(0, 250)
                .replace("\n", " ") + "...";
        var location = nullCheck(posting.categories.location);
        // var locationCleanString = cleanString(location);
        var commitment = nullCheck(posting.categories.commitment);
        // var commitmentCleanString = cleanString(commitment);
        var team = nullCheck(posting.categories.team);
        // var teamCleanString = cleanString(team);
        // var link = posting.hostedUrl + leverParameter;
        // var applyLink = posting.applyUrl + leverParameter;
        var department = nullCheck(posting.categories.department);
        // var departmentCleanString = cleanString(department);
        // var additionalText = nullCheck(posting.additional);

        //Append each job posting to the #jobs div
        $("#jobs").append(
            '<li class="job list-group-item jobListing ' +
            team +
            " " +
            location +
            " " +
            commitment +
            " " +
            department + " " + id + " " +
            '">' +
            '<ul style="padding-left: 0px !important;">' +
            '<li class="job-title list-group-item">' +
            title +
            "</li>" +
            '<li class="tags"><span class="department list-group-item"><a style="color: #999;">' +
            department +
            "</a></span></li>" +
            '<li class="tags"><span class="location list-group-item"><a style="color: #999;">' +
            location +
            "</a></span></li>" +
            '<li class="description"><a>' +
            shortDescription +
            "</a></li>" +
            "</ul>" +
            "</li>"
        );

    }

    //Count the total amount of jobs
    $(".totalJobs").append('<p class="tags"><span>' + Object.keys(postings.posts).length + " jobs</span></p>");
}

function createJobs(_data) {
    var totalPosts = [];
    var total = 0;

    for (i = 0; i < _data.length; i++) {
        var team = nullCheck(_data[i].title);
        var teamLabel = nullCheck(_data[i].title).slice(0, -5);
        var teamCleanString = cleanString(team);
        var posting = [];
        var department = "";
        var departmentCleanString = "";
        var location = "";
        var locationCleanString = "";
        var filteredArr = [];

        for (j = 0; j < _data[i].postings.length; j++) {
            posting = _data[i].postings[j];
            department = nullCheck(posting.categories.department);
            departmentCleanString = cleanString(department);
            location = nullCheck(posting.categories.location);
            locationCleanString = cleanString(location);
        }

        //Display all job departments in the .jobs-teams div
        $(".jobs-teams").append(
            '<p class="tags teamCategories" style="padding: 0px 20px; margin: 0px;"><span><a href="#" class="btn departmentFilterBtn ' +
            teamCleanString +
            " " +
            departmentCleanString +
            '">' +
            department +
            "</a></span></p>"
        );

        //Display all job locations in the .jobs-teams div
        $(".jobs-locations").append(
            '<p class="tags teamCategories" style="padding: 0px 20px; margin: 0px;"><span><a href="#" class="btn departmentFilterBtn ' +
            locationCleanString +
            '">' +
            location +
            "</a></span></p>"
        );
    }

    //For all team types, pull all job postings and identify the attributes of each post
    for (i = 0; i < _data.length; i++) {
        for (j = 0; j < _data[i].postings.length; j++) {
            total += 1;
            var posting = _data[i].postings[j];
            var id = posting.id;
            var title = posting.text;
            var description = posting.description;
            var shortDescription =
                $.trim(posting.descriptionPlain)
                    .slice(1574)
                    .substring(0, 250)
                    .replace("\n", " ") + "...";
            var location = nullCheck(posting.categories.location);
            // var locationCleanString = cleanString(location);
            var commitment = nullCheck(posting.categories.commitment);
            // var commitmentCleanString = cleanString(commitment);
            var team = nullCheck(posting.categories.team);
            // var teamCleanString = cleanString(team);
            var link = posting.hostedUrl + leverParameter;
            var applyLink = posting.applyUrl + leverParameter;
            var department = nullCheck(posting.categories.department);
            // var departmentCleanString = cleanString(department);
            var additionalText = nullCheck(posting.additional);

            //Append each job posting to the #jobs div
            $("#jobs").append(
                '<li class="job list-group-item jobListing ' +
                team +
                " " +
                location +
                " " +
                commitment +
                " " +
                department +
                '">' +
                '<ul style="padding-left: 0px !important;">' +
                '<li class="job-title list-group-item">' +
                title +
                "</li>" +
                '<li class="tags"><span class="department list-group-item"><a style="color: #999;">' +
                department +
                "</a></span></li>" +
                '<li class="tags"><span class="location list-group-item"><a style="color: #999;">' +
                location +
                "</a></span></li>" +
                '<li class="description"><a>' +
                shortDescription +
                "</a></li>" +
                "</ul>" +
                "</li>"
            );
        }
    }

    //Count the total amount of jobs
    $(".totalJobs").append('<p class="tags"><span>' + total + " jobs</span></p>");
}



function filterNames() {
    //Get value of input
    let filterValue = document.getElementById('filterInput').value.toUpperCase();

    //Get jobs ul
    let ul = document.getElementById('jobs');
    //Get li from ul
    let li = ul.querySelectorAll('li.list-group-item');

    //Loop through collection-item lis
    for (let i = 0; li.length; i++) {
        let a = li[i].getElementsByTagName('a')[0];
        //If matches
        if (a.innerText.toUpperCase().indexOf(filterValue) > -1) {
            li[i].style.display = '';
        } else {
            li[i].style.display = 'none';
        }
    }
}