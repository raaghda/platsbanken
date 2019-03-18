const limitButtons = document.getElementsByClassName('limit');
const countyButtons = document.getElementsByClassName('county');
const pageButtons = document.getElementsByClassName('pageNo');
const pageBack = document.getElementById('back');
const pageForward = document.getElementById('forward');
const pageBackFive = document.getElementById('backFive');
const pageForwardFive = document.getElementById('forwardFive');
const occupationalField = document.getElementById('occupationalField');

const Fetch = {
    // Fetches the ten latest jobs.
    fetchJobs: function (countyId = '1', occupationalField = '', viewAmount = '10', pageNumber = '1') {
        fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?lanid=${countyId}&yrkesid=&yrkesomradeid=${occupationalField}&antalrader=${viewAmount}&sida=${pageNumber}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (jobs) {
                View.displayNumberOfAvailableJobs(jobs);
                View.displayJobs(jobs);
            })
    },
    // Fetches a specific job by Id.
    fetchJobID: function (annonsId) {
        fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/${annonsId}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (job) {
                View.displayJobById(job);
            })
    },
    fetchSearchJobs: function (yrkesnamn) {
        fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?nyckelord=${yrkesnamn}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (searchedJobs) {
                View.displaySearchedJobs(searchedJobs);
            })
    },
}

const Model = {
    getUrl: function () {
        const url_string = window.location.href;
        const url = new URL(url_string);

        // Get jobAdID from url
        const jobAdID = url.searchParams.get("jobAd");
            //Get countyId if set, otherwise get the default
        const countyId = url.searchParams.get("countyId") || "1";

        // If there is a job id in url, show the job
        if (jobAdID && jobAdID.length > 0) {
            Fetch.fetchJobID(jobAdID);
        } else {
            // if countyId is specified, show jobs with this countyId
            Fetch.fetchJobs(countyId);
        }
    },
    saveJob: function (id, name, place) {
        let jobs = [];
        if (localStorage.getItem("jobs")) {
            jobs = JSON.parse(localStorage.getItem("jobs"));
        }
        //push is similar to append. It adds the job to the saved list
        jobs.push({
            id,
            name,
            place
        });
        localStorage.setItem("jobs", JSON.stringify(jobs));
    },
    clearSavedJobs: function () {
        localStorage.clear();
        location.reload();
        window.scrollTo(0, 0);
    },
}

const View = {
    // Displays the total amount of ads in Stockholm (number).
    displayNumberOfAvailableJobs: function (jobs) {
        const antal_platsannonser = jobs.matchningslista.antal_platsannonser;
        let htmlBlock = '';
        for (let i = 0; i < jobs.matchningslista.matchningdata.length; i++) {
            const job = jobs.matchningslista.matchningdata[i];
            htmlBlock = `
                <div class="fullWidth">
                    <p class="availableJobs">
                        Antal lediga jobb i <span class="bold">${job.lan}:</span> ${antal_platsannonser}
                    </p>
                </div>
            `;
        }
        jobWrapper.innerHTML = htmlBlock;
    },
    displayJobs: function (jobs) {
        let htmlBlock = '';
        for (let i = 0; i < jobs.matchningslista.matchningdata.length; i++) {
            const job = jobs.matchningslista.matchningdata[i];
            htmlBlock += `
                 <div class="jobInfo" id="${job.annonsid}">
                     <h2> ${job.annonsrubrik} </h2>
                     <p><span class="bold">Kommun:</span> ${job.kommunnamn}</p>
                     <p><span class="bold">Sista ansökningsdag:</span> ${job.sista_ansokningsdag}</p>
                     <p><span class="bold">Yrke:</span> ${job.yrkesbenamning}</p>
                     <p><span class="bold">Anställningstyp:</span> ${job.anstallningstyp}</p>
                     <p class="readMore">
                         <a href="?jobAd=${job.annonsid}">Läs mer</a>
                     </p>
                 </div>
             `;
        }
        jobWrapper.innerHTML += htmlBlock;
    },
    displaySearchedJobs: function (searchedJobs) {
        let htmlBlock = '';
        for (let i = 0; i < searchedJobs.matchningslista.matchningdata.length; i++) {
            const job = searchedJobs.matchningslista.matchningdata[i];
            htmlBlock += `
                <div class="jobInfo" id="${job.annonsid}">
                    <h2> ${job.annonsrubrik} </h2>
                    <p><span class="bold">Kommun:</span> ${job.kommunnamn}</p>
                    <p><span class="bold">Sista ansökningsdag:</span> ${job.sista_ansokningsdag}</p>
                    <p><span class="bold">Yrke:</span> ${job.yrkesbenamning}</p>
                    <p><span class="bold">Anställningstyp:</span> ${job.anstallningstyp}</p>
                    <p class="readMore">
                        <a href="?jobAd=${job.annonsid}">Läs mer</a>
                    </p>
                </div>
            `;
        }
        jobWrapper.innerHTML = htmlBlock;
    },
    //Lägg till eventlistener här trör jag.
    displayJobById: function (job) {
        console.log(job.platsannons.annons);
        const jobWrapper = document.getElementById('jobWrapper');
        const jobListing = job.platsannons.annons;
        jobWrapper.innerHTML = `
            <div class="jobInfo" id="${jobListing.annonsid}">
                <p id="backButton"><a href="${window.location.href.split('?')[0]}">Tillbaka</a></p>
                <h2 class="jobTitle"> ${jobListing.annonsrubrik} </h2>
                <p class="text">${jobListing.annonstext}</p>
                <p>Dela jobb:</p>
                <div class="copyUrlContainer">
                    <span class="toolTipText" id="toolTipBox">Klicka för att kopiera länken!</span>
                    <input onClick="View.copyTextToClipboard()"
                           onmouseout="View.outFunc()" type="text"
                           value="${jobListing.platsannonsUrl}" id="copyUrlInput">
                </div>
                <br />
                <a id="saveAd" href onClick="Model.saveJob(${jobListing.annonsid}, '${jobListing.annonsrubrik}',
                '${jobListing.kommunnamn}')">Spara annons</a>
            </div>
        `;
    },
    displaySavedJobs: function () {
        const savedJobsWrapper = document.getElementById('savedJobsWrapper');
        let htmlBlock = '';
        let saved = localStorage.getItem("jobs");
        // If there saved jobs
        if (saved && JSON.parse(saved).length > 0) {
            // Show the jobs
            htmlBlock += `
                <div class="savedJobs">
                    <h2>Mina sparade jobb:</h2>
                    <ul>
            `;
            saved = JSON.parse(saved);
            console.log(saved);
            for (let i = 0; i < saved.length; i++) {
                htmlBlock += `
                    <li><a href="?jobAd=${saved[i].id}">${saved[i].name} (${saved[i].place})</a> </li>
                `;
            }
            htmlBlock += `
                    </ul>
                    <button onClick="Model.clearSavedJobs();">Rensa sparade jobb</button>
                </div>
            `;
        }
        savedJobsWrapper.innerHTML = htmlBlock;
    },
    addActiveClass: function (className, activeClass) {
        const buttons = document.getElementsByClassName(className);
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", function () {
                const current = document.getElementsByClassName(activeClass);
                current[0].className = current[0].className.replace(" " + activeClass, "");
                this.className += " " + activeClass;
            });
        }
    },
    paginationScroll: function () {
        window.scrollTo({
            top: 220,
            behavior: "smooth"
        });
    },
    copyTextToClipboard: function() {
        copyUrlInput.select();
        document.execCommand("Copy");
        
        const tooltip = document.getElementById("toolTipBox");
        tooltip.innerHTML = "Kopierad!";
    },
    outFunc: function() {
        const tooltip = document.getElementById("toolTipBox");
        tooltip.innerHTML = "Klicka för att kopiera länken!";
    },
}

const Controller = {
    viewAmount: '10',
    countyId: '1',
    pageNumber: '1',
    occupationalField: '',
    yrkesnamn: '',
    addCountyListeners: function () {
        for (const countyButton of countyButtons) {
            countyButton.addEventListener('click', function () {
                Controller.countyId = this.value;
                //adds value to url
                window.history.pushState(null, null, "?countyId="+this.value);
                Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber = 1);
            })
        }
    },
    addLimitListeners: function () {
        for (const limitButton of limitButtons) {
            limitButton.addEventListener('click', function () {
                Controller.viewAmount = this.value;
                Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
            })
        }
    },
    addPageListeners: function () {
        pageBack.addEventListener('click', function () {
            if (Controller.pageNumber > 1) {
                Controller.pageNumber--
                Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
                console.log(Controller.pageNumber);
            } else {
                Controller.pageNumber = 1
                Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
                console.log(Controller.pageNumber);
            }
        })
        pageBackFive.addEventListener('click', function () {
            if (Controller.pageNumber < 6) {
                Controller.pageNumber = 1
                Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
                console.log(Controller.pageNumber);
            }
            if (Controller.pageNumber >= 6) {
                Controller.pageNumber -= 5
                Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
                console.log(Controller.pageNumber);
            }
        })
        pageForward.addEventListener('click', function () {
            Controller.pageNumber++
            Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
            console.log(Controller.pageNumber);
        })
        pageForwardFive.addEventListener('click', function () {
            Controller.pageNumber += 5
            Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
            console.log(Controller.pageNumber);
        })
        for (const pageButton of pageButtons) {
            pageButton.addEventListener('click', function () {
                Controller.pageNumber = this.value;
                Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
                console.log(this.value);
                View.paginationScroll();
            })
        }
    },
    selectOccupation: function () {
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelector('select[name="occupational"]').onchange = changeEventHandler;
        }, false);
        function changeEventHandler(event) {
            Controller.occupationalField = event.target.value;
            Fetch.fetchJobs(Controller.countyId, Controller.occupationalField, Controller.viewAmount, Controller.pageNumber);
        }
    },
    searchJob: function () {
        searchInput.addEventListener('change', function () {
            let searchValue = document.getElementById('searchInput').value;
            Controller.yrkesnamn = searchValue;
            Fetch.fetchSearchJobs(Controller.yrkesnamn);
            console.log(View.displaySearchedJobs);
            document.getElementById('searchInput').value = '';
        })
    },
}

Model.getUrl();
View.displaySavedJobs();
View.addActiveClass("county", "activeCounty");
View.addActiveClass("limit", "activeLimit");
View.addActiveClass("pageNo", "activePage");
Controller.addLimitListeners();
Controller.addCountyListeners();
Controller.addPageListeners();
Controller.selectOccupation();
Controller.searchJob();
//Fetch.fetchJobs();