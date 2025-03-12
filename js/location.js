
async function analyzeLocation() {
    const location = document.getElementById("locationInput").value;

    if (!location) {
        alert("Please enter a location or use your current location!");
        return;
    }

    // Convert location to coordinates
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    let geoResponse = await fetch(geoUrl);
    let geoData = await geoResponse.json();

    if (geoData.length === 0) {
        document.getElementById('loadingIndicator').style.display = 'none';
        alert("Location not found. Try another.");
        return;
    }

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    getNearbyPlaces(lat, lon);
}

function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getNearbyPlaces(lat, lon);
            },
            () => {
                document.getElementById('loadingIndicator').style.display = 'none';
                alert("Failed to get current location. Please enter manually.");
            }
        );
    } else {
        document.getElementById('loadingIndicator').style.display = 'none';
        alert("Geolocation is not supported by your browser.");
    }
}

async function getNearbyPlaces(lat, lon) {
    const query = `
        [out:json];
        (
            node["amenity"="hospital"](around:5000, ${lat}, ${lon});
            node["amenity"="school"](around:5000, ${lat}, ${lon});
            node["amenity"="college"](around:5000, ${lat}, ${lon});
            node["shop"="mall"](around:5000, ${lat}, ${lon});
            node["place"="neighbourhood"]["luxury"="yes"](around:5000, ${lat}, ${lon});
        );
        out body;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    try {
        let response = await fetch(url);
        let data = await response.json();
        displayAnalysis(data.elements);
    } catch (error) {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'block';
        document.getElementById('investmentDecision').innerHTML = "❌ Error fetching location data. Please try again.";
        document.getElementById('investmentDecision').className = 'poor';
        console.error("Error fetching data:", error);
    }
}

function displayAnalysis(places) {
    const resultsList = document.getElementById("placesList");
    resultsList.innerHTML = "";

    let hospitals = 0, schools = 0, colleges = 0, malls = 0, poshArea = 0;
    let importantPlaces = [];

    places.forEach(place => {
        const name = place.tags.name || "Unnamed Place";

        if (place.tags.amenity === "hospital" && hospitals < 1) {
            hospitals++;
            importantPlaces.push(`<i class="fas fa-hospital"></i> ${name} (Hospital)`);
        }
        if (place.tags.amenity === "school" && schools < 1) {
            schools++;
            importantPlaces.push(`<i class="fas fa-school"></i> ${name} (School)`);
        }
        if (place.tags.amenity === "college" && colleges < 1) {
            colleges++;
            importantPlaces.push(`<i class="fas fa-graduation-cap"></i> ${name} (College)`);
        }
        if (place.tags.shop === "mall" && malls < 1) {
            malls++;
            importantPlaces.push(`<i class="fas fa-shopping-bag"></i> ${name} (Mall)`);
        }
        if (place.tags.place === "neighbourhood" && place.tags.luxury === "yes" && poshArea < 1) {
            poshArea++;
            importantPlaces.push(`<i class="fas fa-gem"></i> Luxury Area`);
        }
    });

    // Display 5 key places
    if (importantPlaces.length === 0) {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<i class="fas fa-info-circle"></i> No notable places found in this area`;
        resultsList.appendChild(listItem);
    } else {
        for (let i = 0; i < importantPlaces.length && i < 5; i++) {
            const listItem = document.createElement("li");
            listItem.innerHTML = importantPlaces[i];
            resultsList.appendChild(listItem);
        }
    }

    // Investment Decision
    let investmentDecision = document.getElementById("investmentDecision");

    if (hospitals > 0 && schools > 0 && (colleges > 0 || malls > 0)) {
        investmentDecision.innerHTML = "✅ <strong>Excellent Investment Opportunity!</strong>";
        investmentDecision.className = "good";
    } else if ((hospitals > 0 || schools > 0) && malls > 0) {
        investmentDecision.innerHTML = "⚠️ <strong>Moderate Investment Potential</strong>";
        investmentDecision.className = "moderate";
    } else {
        investmentDecision.innerHTML = "❌ <strong>Not Recommended for Investment</strong>";
        investmentDecision.className = "poor";
    }

    // Good About the Area
    let areaGoodness = document.getElementById("areaGoodness");
    
    if (poshArea > 0) {
        areaGoodness.innerHTML = "💎 This area is considered <strong>luxurious and high-end</strong>, which typically results in better property value appreciation over time.";
    } else if (hospitals > 0 && schools > 0) {
        areaGoodness.innerHTML = "🏥 This area has <strong>good medical and educational facilities</strong>, making it attractive for families and long-term residents.";
    } else if (malls > 0) {
        areaGoodness.innerHTML = "🛍️ This area has <strong>good commercial & shopping facilities</strong>, which provides convenience and can attract tenants.";
    } else if (places.length > 0) {
        areaGoodness.innerHTML = "📍 This area has some amenities, but <strong>lacks the ideal mix</strong> of facilities for a strong investment.";
    } else {
        areaGoodness.innerHTML = "🚧 This area appears to <strong>lack key amenities</strong> that would make it an attractive investment location.";
    }
}
