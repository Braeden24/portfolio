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
		class: "card",
		id: "projectOne"
	},
	{
		name: "Photography Website",
		readme: "projects/photography-marketplace/README.md",
		img: "assets/photographySite.png",
		class: "card",
		id: "projectTwo"
	},
];

//defines the cardContainer Variable
let cardsContainer = document.getElementById("cards");
let overlay = document.getElementById("overlay");
let overlayContent = document.getElementById("overlayContent");

for (let i = 0; i < projects.length; i++) {
	let card = document.createElement("div");
	card.id = projects[i].id;
	card.className = projects[i].class;
	card.innerHTML = `<img src="${projects[i].img}" alt="${projects[i].name}"><h3>${projects[i].name}</h3>`;
  
	//Creates a click event to activate the overlay
	card.addEventListener("click", function() {

	fetch(projects[i].readme)
		.then(response => {
			if (!response.ok) {
				throw new Error("Unable to load README");
			}

			return response.text();
		})
		.then(markdown => {

			overlayContent.innerHTML = `
				<div class="overlayCard">
					<h1>${projects[i].name}</h1>

					<img src="${projects[i].img}" alt="${projects[i].name}">

					<div class="project-readme">
						${marked.parse(markdown)}
					</div>
				</div>
			`;

			overlay.style.display = "block";
		})
		.catch(error => {
			console.error(error);

			overlayContent.innerHTML = `
				<div class="overlayCard">
					<h1>${projects[i].name}</h1>
					<p>Unable to load project information.</p>
				</div>
			`;

			overlay.style.display = "block";
		});
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
	});

