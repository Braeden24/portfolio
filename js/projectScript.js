
/*
Name: Braeden Carlson
Date: 1/13/2026
Purpose: Portfolio Project Script
*/

let projects = [
	{
		name: "Advising Website",
		readme: "projects/advising-website/README.md",
		img: "assets/AdvisingSite.png",
		github: "https://github.com/Braeden24/faculty-advising-system",
		live: "projects/advising-website/index.html",
		download: "projects/downloads/advising-website.zip",
		class: "card",
		id: "projectOne"
	},
	{
		name: "Photography Website",
		readme: "projects/photography-marketplace/README.md",
		img: "assets/photographyMarketplace.png",
		github: "https://github.com/Braeden24/photography-marketplace",
		live: "projects/photography-marketplace/gallery.html",
		download: "projects/downloads/photography-marketplace.zip",
		class: "card",
		id: "projectTwo"
	},
];

// Defines the cardContainer variables
let cardsContainer = document.getElementById("cards");
let overlay = document.getElementById("overlay");
let overlayContent = document.getElementById("overlayContent");

// Creates a card for each project
for (let i = 0; i < projects.length; i++) {
	let card = document.createElement("div");

	card.id = projects[i].id;
	card.className = projects[i].class;
	card.innerHTML = `
		<img src="${projects[i].img}" alt="${projects[i].name}">
		<h3>${projects[i].name}</h3>
	`;

	// Creates a click event to activate the overlay
	card.addEventListener("click", function() {

		// Fetches the project's README file
		fetch(projects[i].readme)
			.then(response => {
				if (!response.ok) {
					throw new Error("Unable to load README");
				}

				return response.text();
			})
			.then(markdown => {

				// Converts Markdown into HTML and displays it
				overlayContent.innerHTML = `
					<div class="overlayCard">
						<h1>${projects[i].name}</h1>

						<img src="${projects[i].img}" alt="${projects[i].name}">

						<div class="project-links">
							<a href="${projects[i].live}" target="_blank">View Live</a>
							<a href="${projects[i].github}" target="_blank">GitHub Repository</a>
							<a href="${projects[i].download}" download>Download</a>
						</div>
						
						<div class="project-readme">
							${marked.parse(markdown)}
						</div>
					</div>
				`;

				overlay.style.display = "block";
			})
			.catch(error => {
				console.error(error);

				// Displays an error if the README cannot be loaded
				overlayContent.innerHTML = `
					<div class="overlayCard">
						<h1>${projects[i].name}</h1>
						<p>Unable to load project information.</p>
					</div>
				`;

				overlay.style.display = "block";
			});
	});

	// Appends each new card to the cardsContainer
	cardsContainer.appendChild(card);
}

// Closes the overlay when clicked outside the content
overlay.addEventListener("click", function(e) {
	if (e.target === overlay) {
		overlay.style.display = "none";
	}
});
