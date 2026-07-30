/*
Name: Braeden Carlson, Lynda Ofurie, Justin Day
Date: 10/30/2025
Purpose: Advising Website Login
File Name: login_srcipt.js
*/

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    	e.preventDefault();

    	const username = document.getElementById("username").value;
    	const password = document.getElementById("password").value;

    	try {
        	const response = await fetch("/api/login", {
            		method: "POST",
            		credentials: "include",
            		headers: { "Content-Type": "application/json" },
            		body: JSON.stringify({ username, password })
        	});

        	const data = await response.json();

        	if (response.ok) {
            		window.location.href = "index.html";
        	} else {
           	alert(data.error || "Login failed");
        	}
    	} catch (err) {
        	console.error(err);
        	alert("An error occurred while logging in.");
    	}
});
