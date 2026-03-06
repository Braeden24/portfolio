/*
Name: Braeden Carlson
Date: 1/13/2026
Purpose: Portfolio Project Script
*/

let projects = [
	{name: "Advising Website", description: "", img: "assets/advisingSite.png", class: "card", id: "projectOne"},
	{name: "Photography Website", description: "Lorem ipsum dolor sit amet", img: "assets/photographySite.png", class: "card", id: "projectTwo"},
	{name: "Project 3", description: "Lorem ipsum dolor sit amet", img: "projects/tempProjects.png", class: "card", id: "projectThree"},
	{name: "Project 4", description: "Lorem ipsum dolor sit amet", img: "projects/tempProjects.png", class: "card", id: "projectFour"},
	{name: "Project 5", description: "Lorem ipsum dolor sit amet", img: "projects/tempProjects.png", class: "card", id: "projectFive"}
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
		overlayContent.innerHTML = `
			<div class="overlayCard">
			<h1>${projects[i].name}</h1>
			<img src="${projects[i].img}" alt="${projects[i].name}">
			<h2>Description</h2>
			<hr>
			<p>${projects[i].description}</p>
		</div>`;
	overlay.style.display = "block";
	});

	// Appends each new card to the cardsContainer
	cardsContainer.appendChild(card);
}

//Closed the overlay when clicked
overlay.addEventListener("click", function(e) {
	// prevent closing when clicking inside content
	if (e.target === overlay) {
		overlay.style.display = "none";
	}
});